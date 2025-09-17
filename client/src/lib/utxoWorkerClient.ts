let worker: Worker | null = null;
let listeners: ((data: any) => void)[] = [];

export function initUtxoWorker() {
  if (!worker) {
    worker = new Worker('/db-worker.js');
    worker.onmessage = (e) => {
      listeners.forEach((cb) => cb(e.data));
    };
  }
  return worker;
}

export function onUtxoWorkerMessage(cb: (data: any) => void) {
  listeners.push(cb);
  return () => {
    listeners = listeners.filter((fn) => fn !== cb);
  };
}

export function sendUtxoWorkerMessage(message: any) {
  if (!worker) initUtxoWorker();
  worker!.postMessage(message);
}
