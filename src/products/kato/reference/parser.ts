import type {
  Document,
  Statement,
  Value,
  ObjectNode,
  ArrayNode,
  ScalarNode,
  UnitLiteral,
  FunctionCall,
  Directive,
  Comment,
  DocComment,
  KeyValue,
  NamedBlock,
  NamedArray,
  ArrayOp,
  SourceLocation,
} from "./types.js";

// ===========================================================================
// Lexer
// ===========================================================================

type TokKind =
  | "string"
  | "number"
  | "unit"
  | "ident"
  | "punct"
  | "newline"
  | "comment"
  | "doccomment"
  | "at"
  | "eof";

interface Tok {
  kind: TokKind;
  value: string;
  // For numbers: parsed numeric value
  numValue?: number;
  numKind?: "integer" | "float";
  // For units: { value, unit }
  unitValue?: number;
  unit?: string;
  loc: SourceLocation;
}

const RESERVED = new Set(["true", "false", "null", "on", "off"]);

class Lexer {
  private src: string;
  private pos = 0;
  private line = 1;
  private col = 1;
  private toks: Tok[] = [];

  constructor(src: string) {
    this.src = src;
  }

  private loc(): SourceLocation {
    return { line: this.line, column: this.col, offset: this.pos };
  }

  private peek(o = 0): string {
    return this.src[this.pos + o] ?? "";
  }

  private advance(): string {
    const c = this.src[this.pos++]!;
    if (c === "\n") {
      this.line++;
      this.col = 1;
    } else {
      this.col++;
    }
    return c;
  }

  private push(t: Tok) {
    this.toks.push(t);
  }

  tokenize(): Tok[] {
    while (this.pos < this.src.length) {
      const c = this.peek();
      // skip spaces & tabs & CR (CR handled by treating CRLF as LF)
      if (c === " " || c === "\t" || c === "\r") {
        this.advance();
        continue;
      }
      if (c === "\n") {
        const loc = this.loc();
        this.advance();
        this.push({ kind: "newline", value: "\n", loc });
        continue;
      }
      // Comments
      if (c === "#") {
        const loc = this.loc();
        this.advance();
        let text = "";
        while (this.pos < this.src.length && this.peek() !== "\n") {
          text += this.advance();
        }
        this.push({ kind: "comment", value: text.trim(), loc });
        continue;
      }
      // /// doc comments or punct '/'
      if (c === "/" && this.peek(1) === "/" && this.peek(2) === "/") {
        const loc = this.loc();
        this.advance();
        this.advance();
        this.advance();
        let text = "";
        while (this.pos < this.src.length && this.peek() !== "\n") {
          text += this.advance();
        }
        this.push({ kind: "doccomment", value: text.trim(), loc });
        continue;
      }
      // Strings
      if (c === '"') {
        this.toks.push(this.readString());
        continue;
      }
      // @ directive marker
      if (c === "@") {
        const loc = this.loc();
        this.advance();
        this.push({ kind: "at", value: "@", loc });
        continue;
      }
      // Numbers (and unit literals)
      if (c === "-" || c === "+" || (c >= "0" && c <= "9")) {
        // disambiguate '-' / '+': only treat as number sign if followed by digit
        if ((c === "-" || c === "+") && !(this.peek(1) >= "0" && this.peek(1) <= "9")) {
          // fall through to punct/ident handling below
        } else {
          this.toks.push(this.readNumberOrUnit());
          continue;
        }
      }
      // += / -=
      if ((c === "+" || c === "-") && this.peek(1) === "=") {
        const loc = this.loc();
        this.advance();
        this.advance();
        this.push({ kind: "punct", value: c + "=", loc });
        continue;
      }
      // Punctuation
      if ("{}[]():,.".includes(c)) {
        const loc = this.loc();
        this.advance();
        this.push({ kind: "punct", value: c, loc });
        continue;
      }
      // Identifier / bare word
      if (isIdStart(c)) {
        this.toks.push(this.readIdent());
        continue;
      }
      throw new ParseError(
        `unexpected character ${JSON.stringify(c)} at line ${this.line}:${this.col}`,
      );
    }
    this.push({ kind: "eof", value: "", loc: this.loc() });
    return this.toks;
  }

  private readString(): Tok {
    const loc = this.loc();
    this.advance(); // opening "
    let out = "";
    while (this.pos < this.src.length) {
      const c = this.peek();
      if (c === '"') {
        this.advance();
        return { kind: "string", value: out, loc };
      }
      if (c === "\n") {
        throw new ParseError(`unterminated string at line ${loc.line}:${loc.column}`);
      }
      if (c === "\\") {
        this.advance();
        const esc = this.advance();
        switch (esc) {
          case '"':
            out += '"';
            break;
          case "\\":
            out += "\\";
            break;
          case "/":
            out += "/";
            break;
          case "b":
            out += "\b";
            break;
          case "f":
            out += "\f";
            break;
          case "n":
            out += "\n";
            break;
          case "r":
            out += "\r";
            break;
          case "t":
            out += "\t";
            break;
          case "u": {
            let hex = "";
            for (let i = 0; i < 4; i++) hex += this.advance();
            out += String.fromCharCode(parseInt(hex, 16));
            break;
          }
          default:
            throw new ParseError(`invalid escape \\${esc}`);
        }
        continue;
      }
      out += this.advance();
    }
    throw new ParseError(`unterminated string at line ${loc.line}:${loc.column}`);
  }

  private readNumberOrUnit(): Tok {
    const loc = this.loc();
    let raw = "";
    if (this.peek() === "-" || this.peek() === "+") raw += this.advance();

    // hex?
    if (this.peek() === "0" && (this.peek(1) === "x" || this.peek(1) === "X")) {
      raw += this.advance();
      raw += this.advance();
      while (/[0-9a-fA-F_]/.test(this.peek())) raw += this.advance();
      const intVal = parseInt(raw.replace(/_/g, ""), 16);
      // hex cannot have a unit suffix per typical convention; but allow none
      return {
        kind: "number",
        value: raw,
        numValue: intVal,
        numKind: "integer",
        loc,
      };
    }

    let isFloat = false;
    while (/[0-9_]/.test(this.peek())) raw += this.advance();
    if (this.peek() === "." && /[0-9]/.test(this.peek(1))) {
      isFloat = true;
      raw += this.advance();
      while (/[0-9_]/.test(this.peek())) raw += this.advance();
    }
    if (this.peek() === "e" || this.peek() === "E") {
      isFloat = true;
      raw += this.advance();
      if (this.peek() === "+" || this.peek() === "-") raw += this.advance();
      while (/[0-9_]/.test(this.peek())) raw += this.advance();
    }

    // unit suffix? immediately following, no whitespace.
    // Suffix: optional leading '/' then ident
    let unit = "";
    if (this.peek() === "/" && isIdStart(this.peek(1))) {
      unit += this.advance();
      while (isIdContinue(this.peek())) unit += this.advance();
    } else if (isIdStart(this.peek())) {
      while (isIdContinue(this.peek())) unit += this.advance();
    }

    const cleaned = raw.replace(/_/g, "");
    const num = isFloat ? parseFloat(cleaned) : parseInt(cleaned, 10);

    if (unit) {
      return {
        kind: "unit",
        value: raw + unit,
        unitValue: num,
        unit,
        loc,
      };
    }
    return {
      kind: "number",
      value: raw,
      numValue: num,
      numKind: isFloat ? "float" : "integer",
      loc,
    };
  }

  private readIdent(): Tok {
    const loc = this.loc();
    let v = "";
    while (isIdContinue(this.peek())) v += this.advance();
    return { kind: "ident", value: v, loc };
  }
}

function isIdStart(c: string): boolean {
  return (c >= "a" && c <= "z") || (c >= "A" && c <= "Z") || c === "_";
}
function isIdContinue(c: string): boolean {
  return isIdStart(c) || (c >= "0" && c <= "9") || c === "-";
}

// ===========================================================================
// Parser
// ===========================================================================

export class ParseError extends Error {}

class Parser {
  private toks: Tok[];
  private i = 0;

  constructor(toks: Tok[]) {
    this.toks = toks;
  }

  private peek(o = 0): Tok {
    return this.toks[this.i + o] ?? this.toks[this.toks.length - 1]!;
  }

  private advance(): Tok {
    const t = this.toks[this.i]!;
    if (t.kind !== "eof") this.i++;
    return t;
  }

  private skipNewlines() {
    while (this.peek().kind === "newline" || this.peek().kind === "comment") {
      this.advance();
    }
  }

  private matchPunct(s: string): boolean {
    const t = this.peek();
    return t.kind === "punct" && t.value === s;
  }

  private expectPunct(s: string): Tok {
    const t = this.peek();
    if (t.kind !== "punct" || t.value !== s) {
      throw new ParseError(
        `expected '${s}' at line ${t.loc.line}:${t.loc.column}, got ${describeTok(t)}`,
      );
    }
    return this.advance();
  }

  parseDocument(): Document {
    const directives: Directive[] = [];
    const body: Statement[] = [];
    let pendingDocs: DocComment[] = [];

    while (this.peek().kind !== "eof") {
      const t = this.peek();
      if (t.kind === "newline" || t.kind === "comment") {
        this.advance();
        continue;
      }
      if (t.kind === "doccomment") {
        pendingDocs.push({ type: "DocComment", text: t.value });
        this.advance();
        continue;
      }
      if (t.kind === "at") {
        const d = this.parseDirective();
        directives.push(d);
        pendingDocs = [];
        continue;
      }
      const stmt = this.parseStatement();
      if (pendingDocs.length > 0) {
        stmt.leadingComments = pendingDocs;
        pendingDocs = [];
      }
      body.push(stmt);
    }

    return { type: "Document", body, directives };
  }

  private parseDirective(): Directive {
    this.expectAt();
    const nameTok = this.peek();
    if (nameTok.kind !== "ident") {
      throw new ParseError(
        `expected directive name at line ${nameTok.loc.line}:${nameTok.loc.column}`,
      );
    }
    this.advance();
    const name = nameTok.value;
    const d: Directive = { type: "Directive", name };

    if (name === "version") {
      const v = this.peek();
      if (v.kind !== "number" || v.numKind !== "integer") {
        throw new ParseError(`@version expects an integer`);
      }
      this.advance();
      d.value = v.numValue!;
    } else if (name === "schema" || name === "schemaVersion") {
      const v = this.peek();
      if (name === "schemaVersion") {
        if (v.kind !== "number" || v.numKind !== "integer") {
          throw new ParseError(`@schemaVersion expects an integer`);
        }
        this.advance();
        d.value = v.numValue!;
      } else {
        if (v.kind !== "string") throw new ParseError(`@schema expects a string`);
        this.advance();
        d.value = v.value;
      }
    } else if (name === "include") {
      const v = this.peek();
      if (v.kind !== "string") throw new ParseError(`@include expects a string`);
      this.advance();
      d.value = v.value;
      // optional "as ident"
      if (this.peek().kind === "ident" && this.peek().value === "as") {
        this.advance();
        const alias = this.peek();
        if (alias.kind !== "ident") throw new ParseError(`@include: expected alias`);
        this.advance();
        d.profile = alias.value; // reuse field
      }
    } else if (name === "use") {
      // dotted ident "as" ident
      let dotted = "";
      while (this.peek().kind === "ident") {
        dotted += this.advance().value;
        if (this.matchPunct(".")) {
          this.advance();
          dotted += ".";
        } else break;
      }
      if (!(this.peek().kind === "ident" && this.peek().value === "as")) {
        throw new ParseError(`@use expects 'as' alias`);
      }
      this.advance();
      const alias = this.peek();
      if (alias.kind !== "ident") throw new ParseError(`@use: expected alias`);
      this.advance();
      d.value = dotted;
      d.profile = alias.value;
    } else if (name === "profile") {
      const ident = this.peek();
      if (ident.kind !== "ident" && ident.kind !== "string") {
        throw new ParseError(`@profile expects a name`);
      }
      this.advance();
      d.profile = ident.value;
      this.skipNewlines();
      if (this.matchPunct("{")) {
        d.body = this.parseObject();
      }
    } else if (name === "agent") {
      this.skipNewlines();
      if (this.matchPunct("{")) {
        d.body = this.parseObject();
      }
    } else {
      // Unknown directive: consume rest of line tokens until newline.
      while (
        this.peek().kind !== "newline" &&
        this.peek().kind !== "eof"
      ) {
        this.advance();
      }
    }

    return d;
  }

  private expectAt(): Tok {
    const t = this.peek();
    if (t.kind !== "at") throw new ParseError(`expected @`);
    this.advance();
    // Must be followed by an identifier
    if (this.peek().kind !== "ident") {
      throw new ParseError(`expected directive name after @`);
    }
    return t;
  }

  private parseStatement(): Statement {
    // key — identifier or quoted string, possibly dotted
    const keyTok = this.peek();
    if (keyTok.kind === "punct" && keyTok.value === "}") {
      throw new ParseError(
        `unexpected '}' at line ${keyTok.loc.line}:${keyTok.loc.column}`,
      );
    }
    if (keyTok.kind !== "ident" && keyTok.kind !== "string") {
      throw new ParseError(
        `expected key at line ${keyTok.loc.line}:${keyTok.loc.column}, got ${describeTok(keyTok)}`,
      );
    }
    let key = this.advance().value;
    // dotted keys: ident (. ident)*
    while (this.matchPunct(".")) {
      this.advance();
      const next = this.peek();
      if (next.kind !== "ident") {
        throw new ParseError(`expected identifier after '.'`);
      }
      key += "." + this.advance().value;
    }

    const next = this.peek();
    if (next.kind === "punct" && next.value === ":") {
      this.advance();
      // detect double colon
      if (this.matchPunct(":")) {
        throw new ParseError(`unexpected ':' at line ${this.peek().loc.line}`);
      }
      // value can't be empty before a terminator
      const peekVal = this.peek();
      if (
        peekVal.kind === "newline" ||
        peekVal.kind === "eof" ||
        (peekVal.kind === "punct" && peekVal.value === ",")
      ) {
        throw new ParseError(
          `expected value after ':' at line ${peekVal.loc.line}:${peekVal.loc.column}`,
        );
      }
      const value = this.parseValue();
      this.consumeTerminator();
      const kv: KeyValue = { type: "KeyValue", key, value };
      return kv;
    }
    if (next.kind === "punct" && next.value === "{") {
      const body = this.parseObject();
      this.consumeTerminator();
      const nb: NamedBlock = { type: "NamedBlock", name: key, body };
      return nb;
    }
    if (next.kind === "punct" && next.value === "[") {
      const arr = this.parseArray();
      this.consumeTerminator();
      const na: NamedArray = { type: "NamedArray", name: key, elements: arr };
      return na;
    }
    if (next.kind === "punct" && (next.value === "+=" || next.value === "-=")) {
      const op = this.advance().value as "+=" | "-=";
      const arr = this.parseArray();
      this.consumeTerminator();
      const ao: ArrayOp = { type: "ArrayOp", name: key, operator: op, value: arr };
      return ao;
    }
    throw new ParseError(
      `expected ':' '{' '[' or '+=' / '-=' after key at line ${next.loc.line}:${next.loc.column}, got ${describeTok(next)}`,
    );
  }

  private consumeTerminator() {
    const t = this.peek();
    if (
      t.kind === "newline" ||
      t.kind === "eof" ||
      (t.kind === "punct" && t.value === ",")
    ) {
      if (t.kind !== "eof") this.advance();
      return;
    }
    // Allow inline comments as terminator
    if (t.kind === "comment") {
      this.advance();
      // there should be a newline next or eof
      if (this.peek().kind === "newline") this.advance();
      return;
    }
    // If followed by '}', let caller handle it (no advance)
    if (t.kind === "punct" && t.value === "}") return;
  }

  private parseObject(): ObjectNode {
    this.expectPunct("{");
    const members: Statement[] = [];
    let pendingDocs: DocComment[] = [];
    while (true) {
      const t = this.peek();
      if (t.kind === "eof") {
        throw new ParseError(`unclosed object — expected '}'`);
      }
      if (t.kind === "newline" || t.kind === "comment") {
        this.advance();
        continue;
      }
      if (t.kind === "doccomment") {
        pendingDocs.push({ type: "DocComment", text: t.value });
        this.advance();
        continue;
      }
      if (t.kind === "punct" && t.value === "}") {
        this.advance();
        return { type: "Object", members };
      }
      const stmt = this.parseStatement();
      if (pendingDocs.length > 0) {
        stmt.leadingComments = pendingDocs;
        pendingDocs = [];
      }
      members.push(stmt);
    }
  }

  private parseArray(): ArrayNode {
    this.expectPunct("[");
    const elements: Value[] = [];
    // skip leading newlines/commas
    while (true) {
      const t = this.peek();
      if (t.kind === "eof") {
        throw new ParseError(`unclosed array — expected ']'`);
      }
      if (t.kind === "newline" || t.kind === "comment") {
        this.advance();
        continue;
      }
      if (t.kind === "punct" && t.value === ",") {
        this.advance();
        continue;
      }
      if (t.kind === "punct" && t.value === "]") {
        this.advance();
        return { type: "Array", elements };
      }
      const v = this.parseValue();
      elements.push(v);
      // separator expected: , or newline, or right-bracket
      const sep = this.peek();
      if (sep.kind === "punct" && sep.value === "]") continue;
      if (sep.kind === "punct" && sep.value === ",") {
        this.advance();
        continue;
      }
      if (sep.kind === "newline" || sep.kind === "comment") {
        this.advance();
        continue;
      }
      if (sep.kind === "eof") {
        throw new ParseError(`unclosed array — expected ']'`);
      }
      // tolerate: keep parsing
    }
  }

  private parseValue(): Value {
    const t = this.peek();
    // function call: any ident followed immediately by '(' (resolved at evaluate time)
    if (t.kind === "ident" && this.peek(1).kind === "punct" && this.peek(1).value === "(") {
      // Reserved bare-word keywords are not callable.
      if (t.value !== "true" && t.value !== "false" && t.value !== "null" && t.value !== "on" && t.value !== "off") {
        return this.parseFunctionCall(t.value);
      }
    }
    if (t.kind === "punct" && t.value === "{") {
      return this.parseObject();
    }
    if (t.kind === "punct" && t.value === "[") {
      return this.parseArray();
    }
    if (t.kind === "string") {
      this.advance();
      const s: ScalarNode = {
        type: "Scalar",
        value: t.value,
        rawValue: t.value,
        scalarType: "string",
      };
      return s;
    }
    if (t.kind === "number") {
      this.advance();
      const s: ScalarNode = {
        type: "Scalar",
        value: t.numValue!,
        rawValue: t.value,
        scalarType: t.numKind!,
      };
      return s;
    }
    if (t.kind === "unit") {
      this.advance();
      const u: UnitLiteral = {
        type: "UnitLiteral",
        value: t.unitValue!,
        unit: t.unit!,
        rawValue: t.value,
      };
      return u;
    }
    if (t.kind === "ident") {
      this.advance();
      if (t.value === "true" || t.value === "false") {
        return {
          type: "Scalar",
          value: t.value === "true",
          rawValue: t.value,
          scalarType: "boolean",
        };
      }
      if (t.value === "null") {
        return {
          type: "Scalar",
          value: null,
          rawValue: t.value,
          scalarType: "null",
        };
      }
      if (t.value === "on" || t.value === "off") {
        return {
          type: "Scalar",
          value: t.value === "on",
          rawValue: t.value,
          scalarType: "on_off",
        };
      }
      return {
        type: "Scalar",
        value: t.value,
        rawValue: t.value,
        scalarType: "bare_word",
      };
    }
    throw new ParseError(
      `unexpected token ${describeTok(t)} at line ${t.loc.line}:${t.loc.column}`,
    );
  }

  private parseFunctionCall(name: string): FunctionCall {
    this.advance(); // consume name ident
    this.expectPunct("(");
    const args: Value[] = [];
    const options: Record<string, Value> = {};
    let hasOptions = false;
    let optionCount = 0;

    while (true) {
      this.skipInlineWhitespace();
      const t = this.peek();
      if (t.kind === "punct" && t.value === ")") {
        this.advance();
        break;
      }
      // Detect option: ident ':' value
      if (
        t.kind === "ident" &&
        this.peek(1).kind === "punct" &&
        this.peek(1).value === ":"
      ) {
        const optName = this.advance().value;
        this.advance(); // ':'
        const v = this.parseValue();
        options[optName] = v;
        hasOptions = true;
        optionCount++;
      } else {
        const v = this.parseValue();
        args.push(v);
      }
      this.skipInlineWhitespace();
      if (this.matchPunct(",")) {
        this.advance();
        continue;
      }
      if (this.matchPunct(")")) {
        this.advance();
        break;
      }
      const t2 = this.peek();
      throw new ParseError(
        `expected ',' or ')' in function call at line ${t2.loc.line}:${t2.loc.column}`,
      );
    }

    const fc: FunctionCall = { type: "FunctionCall", name, args };
    if (hasOptions) {
      fc.options = options;
      // The TS test expects args.length to include options too: env("DB_URL", fallback: null) → args.length 1 (only positional), options.fallback set.
      // Go test expects 2 args for env with fallback. We'll just preserve args+options accurately;
      // Go-side parser is separate.
    }
    // Suppress unused warning
    void optionCount;
    return fc;
  }

  private skipInlineWhitespace() {
    while (this.peek().kind === "newline" || this.peek().kind === "comment") {
      this.advance();
    }
  }
}

function describeTok(t: Tok): string {
  if (t.kind === "punct") return `'${t.value}'`;
  if (t.kind === "ident") return `identifier '${t.value}'`;
  if (t.kind === "string") return `string`;
  if (t.kind === "number") return `number`;
  if (t.kind === "unit") return `unit literal`;
  if (t.kind === "newline") return `newline`;
  if (t.kind === "eof") return `end of input`;
  return t.kind;
}

/**
 * Parse a Kato notation string into a Document AST.
 */
export function parse(input: string): Document {
  const toks = new Lexer(input).tokenize();
  return new Parser(toks).parseDocument();
}
