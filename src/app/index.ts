/**
 * This is the main component of the application.
 * @param image - The image to be processed
 * @returns The text extracted from the image
 */
import { loadImage, Image } from 'canvas';
import { Worker } from 'worker_threads';
import path from 'path';
import { createAndLoadCanvas, convertToGreyscale, cropToBoundingBox, binarize, prepareLine, prepareSegment, pad, invertIfDarkBackground } from './preprocess';
import { getCharacterSegments, getLineSegments, extractCharacterFeatures, getBounds } from './extraction';
import { vectorSize } from './config';
import { progressBar } from './util';
import { runWorkerTask } from './concurrency';

export const preprocessImage = (image: Image) => {
	const { canvas, ctx } = createAndLoadCanvas(image);
	convertToGreyscale(canvas, ctx);
	invertIfDarkBackground(canvas, ctx);
	binarize(canvas, ctx);
	pad(canvas, ctx, 10);
	const { minY, maxY } = getBounds(canvas, ctx);
	cropToBoundingBox(canvas, ctx, minY, maxY);

	return { canvas, ctx };
};

const ocr = async (imagePath: string) => {
	const image = await loadImage(imagePath);

	let outputText = '';

	const { canvas, ctx } = preprocessImage(image);
	const lines = getLineSegments(canvas, ctx);
	console.log(`Found ${lines.length} lines. Analyzing...`);
	let lineIndex = 0;
	let promises = [];
	for (const line of lines) {
		lineIndex++;
		const { lineCanvas, lineCtx } = prepareLine(canvas, line, vectorSize);
		pad(lineCanvas, lineCtx, 2);
		const { minY, maxY } = getBounds(lineCanvas, lineCtx);
		cropToBoundingBox(lineCanvas, lineCtx, minY, maxY);
		pad(lineCanvas, lineCtx, 1);

		const segments = getCharacterSegments(lineCanvas, lineCtx, minY - maxY);

		let segmentIndex = 0;
		let lineFeatures = [];
		for (const segment of segments) {
			segmentIndex++;
			if (segment.type == 'space') {
				lineFeatures.push(new Array(vectorSize * vectorSize).fill(0));
				continue;
			};
			if (segment.type == 'gap') {
				continue;
			}

			const { segmentCanvas, segmentCtx } = prepareSegment(lineCanvas, segment, vectorSize);

			const features = extractCharacterFeatures(segmentCanvas, segmentCtx);
			lineFeatures.push(features);
		};
		const linePromise = runWorkerTask(() => {
			return new Promise<string>((resolve, reject) => {

				const worker = new Worker(path.resolve(__dirname, './concurrency/lineWorker.js'), {
					workerData: { lineFeatures, segments, lineIndex }
				});

				worker.on('message', (result: string) => resolve(result));
				worker.on('error', reject);
				worker.on('exit', (code) => {
					if (code !== 0) {
						reject(new Error(`Worker stopped with exit code ${code}`));
					}
				});
			});
		});

		promises.push(linePromise);
	};
	const results = await Promise.all(promises);
	results.forEach((result: string) => outputText += result);

	console.log(`\n\nBest guess: \n${outputText}\n`);
};


export default ocr;