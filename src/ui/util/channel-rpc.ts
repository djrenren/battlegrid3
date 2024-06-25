export interface Service extends Record<string, (...args: any[]) => unknown> {
  init(): Promise<void>;
}

export type Client<WS extends Service> = {
  [K in keyof WS]: (...args: Parameters<WS[K]>) => Promise<ReturnType<WS[K]>>;
} & MessagePort;

export const attach_service = <T extends Service>(service: T, port: MessagePort) => {
  const handler = async ({ data: { method, args, id } }: MessageEvent<RPCRequest<T>>) => {
    const response = await service[method](...args);
    postMessage({ id, response });
  };
  port.addEventListener("message", handler);
};

type RPCRequest<T extends Service, K extends keyof T = keyof T> = {
  method: K;
  args: Parameters<T[K]>;
  id: number;
};

interface RPCResponse<T extends Service, K extends keyof T = keyof T> {
  response: ReturnType<T[K]>;
  id: number;
}

/** Construct a client for a service on the other end of a messageport */
export const make_client = async <T extends Service>(port: MessagePort): Promise<Client<T>> => {
  const pending = new Map<number, (result: unknown) => void>();
  const proxFn = async (method: keyof T, args: Parameters<T[keyof T]>) => {
    const { promise, resolve, reject } = Promise.withResolvers<unknown>();
    const id = Math.random();
    const payload: RPCRequest<T> = { method, args, id };
    port.postMessage(payload);
    pending.set(id, resolve);
    return promise;
  };

  const handleResponse = <T extends Service>({ data }: MessageEvent<RPCResponse<T>>) => {
    console.log("RESP", data);
    pending.get(data.id)?.(data.response);
  };
  port.addEventListener("message", handleResponse);

  const client = new Proxy(Object.create(port), {
    get(recv, method) {
      recv[method] ??= (...args: Parameters<T[keyof T]>) => proxFn(method as keyof T, args);
      return recv[method];
    },
  }) as Client<T>;

  // @ts-ignore
  await client.init();

  return client;
};
