import { parentPort, workerData } from 'worker_threads';
import { getReferenceVectors } from '../vectors';
import { getNearestNeighbors } from '../knn';
import { progressBar } from '../util';
import { LineSegment } from '../types';

const processLine = async (lineFeatures: number[][], segments: LineSegment[], lineIndex: number) => {
	let result = '';
	let segmentIndex = 0;
	for (const features of lineFeatures) {
		segmentIndex++;
		const vectors = getReferenceVectors();
		const k = 10;
		//	progressBar(segmentIndex, segments.length, `Analyzing line ${lineIndex} segments:`, lineIndex); broken with concurrent workers
		const bestGuess = await getNearestNeighbors(vectors, features, k);
		result += bestGuess;
	}
	return result;
};

(async () => {
	const { lineFeatures, segments, lineIndex } = workerData;
	const result = await processLine(lineFeatures, segments, lineIndex);
	parentPort?.postMessage(result + '\n');
})();
