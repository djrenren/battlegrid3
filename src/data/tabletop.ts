import * as Y from "yjs";

//@ts-ignore
interface TypedMap<T extends object> extends Y.Map<T[keyof T]> {
  get<K extends keyof T>(key: K): T[K];
  set<K extends keyof T, V extends T[K]>(key: K, value: V): V;
}

type YJSify<T> =
  T extends Y.AbstractType<any>
    ? T
    : T extends Array<infer U>
      ? Y.Array<YJSify<U>>
      : T extends object
        ? TypedMap<{ [K in keyof T]: YJSify<T[K]> }>
        : T;

type Extends<T extends U, U> = T;

type testBasic = Extends<YJSify<{ a: string }>, Y.Map<string>>;
type testFlattening = Extends<YJSify<YJSify<{ a: string }>>, YJSify<{ a: string }>>;

export function yjs<T>(data: T): YJSify<T> {
  if (data instanceof Y.AbstractType) {
    return data as YJSify<T>;
  }
  if (Array.isArray(data)) {
    return Y.Array.from(data.map(yjs)) as YJSify<T>;
  }
  if (typeof data === "object" && data) {
    return new Y.Map(Object.entries(data).map(([a, b]) => [a, yjs(b)])) as YJSify<T>;
  }

  return data as YJSify<T>;
}

export type TabletopDoc = Y.Doc & {
  getMap(name: "tabletop"): Tabletop;
};

export type Tabletop = YJSify<{
  grid: Grid;
}>;

export type Grid = YJSify<{
  src: string;
  grid_size: number;
  tokens: Y.Array<Token>;
}>;

export type Token = YJSify<{
  src: string;
  x: number;
  y: number;
}>;

export const createTabletopDoc = (): TabletopDoc => new Y.Doc() as TabletopDoc;
