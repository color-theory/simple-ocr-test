import * as os from 'os';
let activeWorkers = 0;
const maxWorkers = os.cpus().length;
const taskQueue: (() => Promise<void>)[] = [];
export const runWorkerTask = (task: () => Promise<void>) => {
	if (activeWorkers < maxWorkers) {
		activeWorkers++;
		task().finally(() => {
			activeWorkers--;
			if (taskQueue.length > 0) {
				runWorkerTask(taskQueue.shift()!);
			}
		});
	} else {
		taskQueue.push(task);
	}
}