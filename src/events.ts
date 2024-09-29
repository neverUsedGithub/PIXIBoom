export interface EventController {
  cancel(): void;
}

type AnyFn = (...args: any[]) => any;

export class EventEmitter<T extends Record<string, any[]>> {
  private events: Map<keyof T, Set<AnyFn>> = new Map();

  on<U extends keyof T>(
    event: U,
    callback: (...args: T[U]) => void
  ): EventController {
    let temp: Set<AnyFn>;
    let callbacks: Set<AnyFn> =
      this.events.get(event) ??
      ((temp = new Set()), this.events.set(event, temp), temp);

    callbacks.add(callback);

    return {
      cancel() {
        callbacks.delete(callback);
      },
    };
  }

  emit<U extends keyof T>(event: U, ...args: T[U]) {
    let callbacks: Set<AnyFn> | undefined;
    if ((callbacks = this.events.get(event))) {
      callbacks.forEach((cb) => cb(...args));
    }
  }
}
