import { Worker } from 'worker_threads';
import path from 'path';

export function runEmailWorker(action: 'schedule' | 'send') {
  return new Promise((resolve, reject) => {
    const worker = new Worker(path.resolve(process.cwd(), 'src/workers/emailWorker.ts'), {
      workerData: { action }
    });

    worker.on('message', resolve);
    worker.on('error', reject);
    worker.on('exit', (code) => {
      if (code !== 0) reject(new Error(`워커가 ${code} 코드로 종료됨`));
    });
  });
}