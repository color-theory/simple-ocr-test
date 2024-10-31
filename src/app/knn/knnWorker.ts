import { parentPort, workerData } from 'worker_threads';
import { ReferenceVector, Result } from './types';

const euclideanDistance = (vector1: number[], vector2: number[]) => {
	let distance = 0;
	for (let i = 0; i < vector2.length; i++) {
		distance += Math.pow(vector1[i] - vector2[i], 2);
	}
	return Math.sqrt(distance);
};

const knn = async (refVectorSubset: ReferenceVector[], vector: number[], k: number) => {
	const distances: Result[] = refVectorSubset.map((vectorData) => {
		return {
			character: vectorData.character,
			distance: euclideanDistance(vector, vectorData.pixelData),
		};
	});
	distances.sort((a, b) => a.distance - b.distance);
	return distances.slice(0, k);
}

(async () => {
	if (!workerData) {
		return;
	};
	const { vectorSubset, vector, k } = workerData;
	const result = await knn(vectorSubset, vector, k);
	if (parentPort) {
		parentPort.postMessage(result);
	} else {
		throw new Error('No parentPort found');
	}
})();