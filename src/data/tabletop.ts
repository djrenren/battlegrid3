import * as Y from "yjs";

//@ts-ignore
interface TypedMap<T extends object> extends Y.Map<T[keyof T]> {
  get<K extends keyof T>(key: K): T[K];
  set<K extends keyof T>(key: K, value: T[K]): void;
}

export type TabletopDoc = Y.Doc & {
  getMap(name: "tabletop"): Tabletop;
};

export type Tabletop = TypedMap<{
  grid: Grid;
}>;

export type Grid = TypedMap<{
  src: string;
  grid_size: number;
  tokens: Y.Array<Token>;
}>;

type Token = TypedMap<{
  src: string;
  x: number;
  y: number;
}>;

export const createTabletopDoc = (): TabletopDoc => new Y.Doc() as TabletopDoc;
