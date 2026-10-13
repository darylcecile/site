// ============================================================
// Kato AST Type Definitions
// ============================================================

// ---------- Token Types --------------------------------------------------

export enum TokenType {
  // Literals
  String = "String",
  Integer = "Integer",
  Float = "Float",
  Boolean = "Boolean",
  Null = "Null",
  OnOff = "OnOff",
  BareWord = "BareWord",
  UnitLiteral = "UnitLiteral",

  // Structural
  BraceOpen = "BraceOpen",
  BraceClose = "BraceClose",
  BracketOpen = "BracketOpen",
  BracketClose = "BracketClose",
  Colon = "Colon",
  Comma = "Comma",
  Newline = "Newline",

  // Operators
  PlusEquals = "PlusEquals",
  MinusEquals = "MinusEquals",

  // Special
  Directive = "Directive",
  Comment = "Comment",
  DocComment = "DocComment",
  Identifier = "Identifier",
  Dot = "Dot",

  // Functions
  Env = "Env",
  Ref = "Ref",
  ParenOpen = "ParenOpen",
  ParenClose = "ParenClose",

  // Meta
  EOF = "EOF",
}

// ---------- Source Location -----------------------------------------------

export interface SourceLocation {
  line: number;
  column: number;
  offset: number;
}

export interface SourceSpan {
  start: SourceLocation;
  end: SourceLocation;
}

// ---------- AST Node Types ------------------------------------------------

export type Node =
  | Document
  | ObjectNode
  | ArrayNode
  | ScalarNode
  | UnitLiteral
  | FunctionCall
  | Directive
  | Comment
  | DocComment
  | KeyValue
  | NamedBlock
  | NamedArray
  | ArrayOp;

export interface BaseNode {
  span?: SourceSpan;
  leadingComments?: (Comment | DocComment)[];
}

// ---------- Document (root) -----------------------------------------------

export interface Document extends BaseNode {
  type: "Document";
  body: Statement[];
  directives: Directive[];
}

// ---------- Statements ----------------------------------------------------

export type Statement = KeyValue | NamedBlock | NamedArray | ArrayOp;

export interface KeyValue extends BaseNode {
  type: "KeyValue";
  key: string;
  value: Value;
}

export interface NamedBlock extends BaseNode {
  type: "NamedBlock";
  name: string;
  body: ObjectNode;
}

export interface NamedArray extends BaseNode {
  type: "NamedArray";
  name: string;
  elements: ArrayNode;
}

export interface ArrayOp extends BaseNode {
  type: "ArrayOp";
  name: string;
  operator: "+=" | "-=";
  value: ArrayNode;
}

// ---------- Values --------------------------------------------------------

export type Value =
  | ScalarNode
  | UnitLiteral
  | FunctionCall
  | ObjectNode
  | ArrayNode;

// ---------- Object --------------------------------------------------------

export interface ObjectNode extends BaseNode {
  type: "Object";
  members: Statement[];
}

// ---------- Array ---------------------------------------------------------

export interface ArrayNode extends BaseNode {
  type: "Array";
  elements: Value[];
}

// ---------- Scalars -------------------------------------------------------

export interface ScalarNode extends BaseNode {
  type: "Scalar";
  value: string | number | boolean | null;
  rawValue: string;
  scalarType: "string" | "integer" | "float" | "boolean" | "null" | "on_off" | "bare_word";
}

// ---------- Unit Literal --------------------------------------------------

export interface UnitLiteral extends BaseNode {
  type: "UnitLiteral";
  value: number;
  unit: string;
  rawValue: string;
}

// ---------- Function Calls (env, ref) -------------------------------------

export interface FunctionCall extends BaseNode {
  type: "FunctionCall";
  name: string;
  args: Value[];
  options?: Record<string, Value>;
}

// ---------- Directives ----------------------------------------------------

export interface Directive extends BaseNode {
  type: "Directive";
  name: string;
  value?: Value | string | number;
  body?: ObjectNode;
  profile?: string;
}

// ---------- Comments ------------------------------------------------------

export interface Comment extends BaseNode {
  type: "Comment";
  text: string;
}

export interface DocComment extends BaseNode {
  type: "DocComment";
  text: string;
}
