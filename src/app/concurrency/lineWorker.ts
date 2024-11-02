import { parentPort, workerData } from 'worker_threads';
import { getReferenceVectors } from '../vectors';
import { getNearestNeighbors } from '../knn';
import { LineSegment } from '../types';

export type LineResult = {
	type: 'result' | 'progress',
	lineIndex: number,
	data?: string,
	progress?: number
}

const processLine = async (lineFeatures: number[][], segments: LineSegment[], lineIndex: number) => {
	let result = '';
	let segmentIndex = 0;
	for (const features of lineFeatures) {
		parentPort?.postMessage({ type: 'progress', lineIndex, progress: segmentIndex });
		segmentIndex++;

		const vectors = getReferenceVectors();
		const k = 10;
		const bestGuess = await getNearestNeighbors(vectors, features, k);
		result += bestGuess;
	}
	return result;
};

(async () => {
	const { lineFeatures, segments, lineIndex } = workerData;
	const result = await processLine(lineFeatures, segments, lineIndex);
	const lineResult: LineResult = {
		type: 'result',
		lineIndex,
		data: result
	};
	parentPort?.postMessage(lineResult);
})();
