export function CustomEvent<T>(name: string): {new(detail: T): Event & T} {
    return class extends Event {
        constructor(detail: T) {
            super(name, {composed: false, bubbles: true});
            Object.assign(this, detail);
        }
    } as unknown as {new(detail: T): Event & T};
}