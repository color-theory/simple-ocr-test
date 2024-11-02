import * as os from 'os';
const maxWorkers = os.cpus().length;
let activeWorkers = 0;
const taskQueue: (() => Promise<void>)[] = [];
console.log(`Max workers: ${maxWorkers}`);

export const runWorkerTask = <T>(task: () => Promise<T>): Promise<T> => {
	return new Promise((resolve, reject) => {
		const executeTask = async () => {
			try {
				activeWorkers++;
				const result = await task();
				resolve(result);
			} catch (error) {
				reject(error);
			} finally {
				activeWorkers--;
				if (taskQueue.length > 0) {
					const nextTask = taskQueue.shift();
					nextTask?.();
				}
			}
		};

		if (activeWorkers < maxWorkers) {
			executeTask();
		} else {
			taskQueue.push(executeTask);
		}
	});
};
