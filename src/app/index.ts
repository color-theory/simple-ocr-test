/**
 * This is the main component of the application.
 * @param image - The image to be processed
 * @returns The text extracted from the image
 */
import { loadImage, Image } from 'canvas';
import { getReferenceVectors } from './vectors';
import { knn } from './knn';
import { createAndLoadCanvas, convertToGreyscale, cropToBoundingBox, binarize, prepareSegment } from './preprocess';
import { segmentImage, extractCharacterFeatures } from './extraction';
import { vectorSize } from './config';
import { progressBar } from './util';

export const preprocessImage = (image: Image) => {
	const { canvas, ctx } = createAndLoadCanvas(image);
	convertToGreyscale(canvas, ctx);
	binarize(canvas, ctx);
	cropToBoundingBox(canvas, ctx);

	return { canvas, ctx };
};

const ocr = (imagePath: string) => {
	loadImage(imagePath).then((image) => {
		const { canvas, ctx } = preprocessImage(image);
		const segments = segmentImage(canvas, ctx);
		let outputText = '';

		segments.forEach((segment, index) => {
			progressBar(index + 1, segments.length, "Analyzing segments:");
			const { segmentCanvas, segmentCtx } = prepareSegment( canvas, segment, vectorSize);
			const features = extractCharacterFeatures(segmentCanvas, segmentCtx);

			const vectors = getReferenceVectors();
			const k = 10;
			const bestGuess = knn(vectors, features, k);
			outputText += bestGuess;
		});
		console.log(`\n\nBest guess: ${outputText}\n`);
	});
}

export default ocr;