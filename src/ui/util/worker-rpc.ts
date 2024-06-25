export interface WorkerService extends Record<string, (...args: any[]) => unknown> {
  init(): Promise<void>;
}

export type Client<WS extends WorkerService> = {
  [K in keyof WS]: (...args: Parameters<WS[K]>) => Promise<ReturnType<WS[K]>>;
} & Worker;

interface RPCRequest<T extends WorkerService, K extends keyof T = keyof T> {
  method: K;
  args: Parameters<T[K]>;
  id: number;
}

interface RPCResponse<T extends WorkerService, K extends keyof T = keyof T> {
  response: ReturnType<T[K]>;
  id: number;
}

/** Inits a worker service  */
export const service = (service: WorkerService) => {
  addEventListener("message", async (e) => {
    const { method, args, id } = e.data as RPCRequest<WorkerService>;
    const response = await service[method](...args);
    postMessage({ id, response });
  });
};

export const make_client = async <T extends WorkerService>(w: Worker): Promise<Client<T>> => {
  const pending = new Map<number, (result: unknown) => void>();
  const proxFn = async (method: keyof T, ...args: Parameters<T[keyof T]>) => {
    const { promise, resolve, reject } = Promise.withResolvers<unknown>();
    const id = Math.random();
    const payload: RPCRequest<T> = { method, args, id };
    console.log(payload);
    w.postMessage(payload);
    pending.set(id, resolve);
    return promise;
  };

  const handleResponse = <T extends WorkerService>({ data }: MessageEvent<RPCResponse<T>>) => {
    console.log("RESP", data);
    pending.get(data.id)?.(data.response);
  };
  w.addEventListener("message", handleResponse);

  const client = new Proxy({ then: 1 } as Record<string | symbol, any>, {
    get(recv, method) {
      recv[method] ??= (...args: Parameters<T[keyof T]>) => proxFn(method as keyof T, ...args);
      return recv[method];
    },
  }) as Client<T>;

  // @ts-ignore
  await client.init();

  return client;
};
