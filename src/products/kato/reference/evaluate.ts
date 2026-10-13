import { parse } from "./parser.js";
import type {
  Document,
  Value,
  Statement,
  ObjectNode,
  ArrayNode,
  FunctionCall,
} from "./types.js";

export interface ResolverContext {
  /** Positional arguments to the function call, already evaluated. */
  args: any[];
  /** Keyword arguments to the function call, already evaluated. */
  options: Record<string, any>;
  /** The document root being built. Mutating this is not supported. */
  root: Record<string, any>;
  /** The environment map supplied via `EvaluateOptions.env`, if any. */
  env: Record<string, string>;
}

export type Resolver = (ctx: ResolverContext) => any;

export interface EvaluateOptions {
  env?: Record<string, string>;
  profile?: string;
  /**
   * Custom resolvers for function-call values like `env(...)` or `ref(...)`.
   *
   * Each key is the function name as it appears in the source. The resolver
   * receives a context with `args` (positional, evaluated), `options`
   * (keyword, evaluated), the current `root`, and the `env` map.
   *
   * Resolvers registered here override the built-ins (`env`, `ref`).
   * Names that have no built-in resolver and are not provided here will
   * cause evaluation to throw.
   */
  resolvers?: Record<string, Resolver>;
}

interface Ctx {
  root: Record<string, any>;
  env: Record<string, string>;
  resolvers: Record<string, Resolver>;
}

/**
 * Parses Kato input and returns a plain JavaScript object.
 */
export function evaluate(input: string, options?: EvaluateOptions): Record<string, any> {
  const doc: Document = parse(input);
  const env = options?.env ?? {};
  const resolvers: Record<string, Resolver> = {
    ...defaultResolvers,
    ...(options?.resolvers ?? {}),
  };
  const ctx: Ctx = { root: {}, env, resolvers };

  for (const stmt of doc.body) {
    applyStatement(ctx.root, stmt, ctx);
  }

  if (options?.profile) {
    for (const d of doc.directives) {
      if (d.name === "profile" && d.profile === options.profile && d.body) {
        for (const stmt of d.body.members) {
          applyStatement(ctx.root, stmt, ctx);
        }
      }
    }
  }

  return ctx.root;
}

function applyStatement(target: Record<string, any>, stmt: Statement, ctx: Ctx): void {
  switch (stmt.type) {
    case "KeyValue": {
      const value = evalValue(stmt.value, ctx);
      assignDotted(target, stmt.key, value, /*merge*/ true);
      return;
    }
    case "NamedBlock": {
      const obj = evalObject(stmt.body, ctx);
      const existing = getDotted(target, stmt.name);
      if (isPlainObject(existing) && isPlainObject(obj)) {
        deepMerge(existing, obj);
      } else {
        assignDotted(target, stmt.name, obj, /*merge*/ false);
      }
      return;
    }
    case "NamedArray": {
      const arr = evalArray(stmt.elements, ctx);
      assignDotted(target, stmt.name, arr, /*merge*/ false);
      return;
    }
    case "ArrayOp": {
      const existing = getDotted(target, stmt.name);
      const incoming = evalArray(stmt.value, ctx);
      if (stmt.operator === "+=") {
        if (Array.isArray(existing)) {
          existing.push(...incoming);
        } else {
          assignDotted(target, stmt.name, incoming, /*merge*/ false);
        }
      } else {
        if (Array.isArray(existing)) {
          for (const item of incoming) {
            for (let i = existing.length - 1; i >= 0; i--) {
              if (deepEqual(existing[i], item)) existing.splice(i, 1);
            }
          }
        }
      }
      return;
    }
  }
}

function evalValue(v: Value, ctx: Ctx): any {
  switch (v.type) {
    case "Scalar":
      return v.value;
    case "UnitLiteral":
      return { $unit: v.unit, value: v.value };
    case "Object":
      return evalObject(v, ctx);
    case "Array":
      return evalArray(v, ctx);
    case "FunctionCall":
      return evalFunctionCall(v, ctx);
  }
}

function evalObject(o: ObjectNode, ctx: Ctx): Record<string, any> {
  const out: Record<string, any> = {};
  for (const stmt of o.members) {
    applyStatement(out, stmt, ctx);
  }
  return out;
}

function evalArray(a: ArrayNode, ctx: Ctx): any[] {
  return a.elements.map((e) => evalValue(e, ctx));
}

function evalFunctionCall(fc: FunctionCall, ctx: Ctx): any {
  const resolver = ctx.resolvers[fc.name];
  if (!resolver) {
    throw new Error(`unknown function: ${fc.name}`);
  }
  const args = fc.args.map((a) => evalValue(a, ctx));
  const evaluatedOptions: Record<string, any> = {};
  if (fc.options) {
    for (const k of Object.keys(fc.options)) {
      evaluatedOptions[k] = evalValue(fc.options[k], ctx);
    }
  }
  return resolver({
    args,
    options: evaluatedOptions,
    root: ctx.root,
    env: ctx.env,
  });
}

/**
 * Built-in resolvers. Users can override any of these by passing
 * `EvaluateOptions.resolvers`.
 */
export const defaultResolvers: Record<string, Resolver> = {
  env: ({ args, options, env }) => {
    const name = args[0];
    if (typeof name !== "string") throw new Error(`env() name must be a string`);
    if (Object.prototype.hasOwnProperty.call(env, name)) {
      return env[name];
    }
    if (Object.prototype.hasOwnProperty.call(options, "fallback")) {
      return options.fallback;
    }
    throw new Error(`env() variable ${JSON.stringify(name)} is not set and no fallback provided`);
  },
  ref: ({ args, root }) => {
    const path = args[0];
    if (typeof path !== "string") throw new Error(`ref() path must be a string`);
    const resolved = getDotted(root, path);
    if (resolved === undefined) {
      throw new Error(`ref(${JSON.stringify(path)}) could not be resolved`);
    }
    return resolved;
  },
};

// ---------- Helpers --------------------------------------------------------

function splitKey(key: string): string[] {
  return key.split(".");
}

function getDotted(obj: Record<string, any>, key: string): any {
  const parts = splitKey(key);
  let cur: any = obj;
  for (const p of parts) {
    if (cur == null || typeof cur !== "object") return undefined;
    cur = cur[p];
  }
  return cur;
}

function assignDotted(
  obj: Record<string, any>,
  key: string,
  value: any,
  merge: boolean,
): void {
  const parts = splitKey(key);
  let cur: Record<string, any> = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const p = parts[i];
    if (!isPlainObject(cur[p])) cur[p] = {};
    cur = cur[p];
  }
  const last = parts[parts.length - 1];
  if (merge && isPlainObject(cur[last]) && isPlainObject(value)) {
    deepMerge(cur[last], value);
  } else {
    cur[last] = value;
  }
}

function deepMerge(target: Record<string, any>, source: Record<string, any>): void {
  for (const k of Object.keys(source)) {
    const sv = source[k];
    const tv = target[k];
    if (isPlainObject(tv) && isPlainObject(sv)) {
      deepMerge(tv, sv);
    } else {
      target[k] = sv;
    }
  }
}

function isPlainObject(v: any): v is Record<string, any> {
  return v !== null && typeof v === "object" && !Array.isArray(v);
}

function deepEqual(a: any, b: any): boolean {
  if (a === b) return true;
  if (typeof a !== typeof b) return false;
  if (a === null || b === null) return a === b;
  if (Array.isArray(a)) {
    if (!Array.isArray(b) || a.length !== b.length) return false;
    return a.every((v, i) => deepEqual(v, b[i]));
  }
  if (typeof a === "object") {
    const ak = Object.keys(a);
    const bk = Object.keys(b);
    if (ak.length !== bk.length) return false;
    return ak.every((k) => deepEqual(a[k], b[k]));
  }
  return false;
}
