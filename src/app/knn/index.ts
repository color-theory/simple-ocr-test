import * as os from 'os';
import * as path from 'path';
import { Worker } from 'worker_threads';
import { ReferenceVector, Result } from './types';

const numWorkers = os.cpus().length;

const vote = (guesses: any) => {
	const votes = new Map();

	guesses.forEach((guess: any) => {
		const confidence = 100 - guess.distance;
		const [existingConfidence, count] = votes.get(guess.character) ? votes.get(guess.character) : [0, 0];
		if (count === undefined) {
			votes.set(guess.character, [confidence, 1]);
		} else {
			votes.set(guess.character, [existingConfidence + confidence, count + 1]);
		}
	});

	const votesWithAverages = Array.from(votes.entries()).map(([character, [confidence, count]]) => {
		return [character, confidence / count];
	});

	const sortedVotes = votesWithAverages.sort((a, b) => b[1] - a[1]);

	return sortedVotes[0];
}

const runKnnWorker = async (vectorSubset: ReferenceVector[], vector: number[], k: number) => {
	return new Promise<Result[]>((resolve, reject) => {
		const workerData = { vectorSubset, vector, k };
		const workerPath = path.resolve(__dirname, 'knnWorker.js');
		const worker = new Worker(workerPath, {
			workerData
		});

		worker.on('message', (message: Result[]) => {
			resolve(message);
		});

		worker.on('error', (error) => {
			console.log("Error from worker:", error);
			return reject(error);
		});
	}
	);
}


export const getNearestNeighbors = async (vectors: ReferenceVector[], vector: number[], k: number) => {
	const chunkSize = Math.floor(vectors.length / numWorkers); // Calculate the base chunk size
	const promises = [];

	for (let i = 0; i < numWorkers; i++) {
		const start = i * chunkSize;
		const end = i === numWorkers - 1 ? vectors.length : start + chunkSize; // Last chunk takes remaining items

		const vectorSubset = vectors.slice(start, end);
		promises.push(runKnnWorker(vectorSubset, vector, k));
	}

	const results: Result[][] = await Promise.all(promises);
	const combinedResults: Result[] = results.flat();
	combinedResults.sort((a, b) => a.distance - b.distance);

	const bestGuesses = combinedResults.slice(0, k);
	return vote(bestGuesses)[0];
}
