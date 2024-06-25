declare interface CSSStyleDeclaration {
  setProperty(name: string, value: string | number | undefined): void;
}

declare interface PromiseConstructor {
  withResolvers<T>(): {
    promise: Promise<T>;
    resolve: (value: T) => void;
    reject: (reason: any) => void;
  };
}

declare const IS_DEV: boolean;
