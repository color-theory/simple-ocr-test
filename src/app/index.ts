/**
 * This is the main component of the application.
 * @param image - The image to be processed
 * @returns The text extracted from the image
 */
import { loadImage, Image, Canvas, CanvasRenderingContext2D } from 'canvas';
import { getReferenceVectors } from './vectors';
import { knn } from './knn';
import { createAndLoadCanvas, convertToGreyscale, cropToBoundingBox, scaleImage, binarize, prepareSegment } from './preprocess';
import { segmentImage, extractCharacterFeatures } from './extraction';

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

		segments.forEach((segment) => {
			const { segmentCanvas, segmentCtx } = prepareSegment(segment, canvas);
			const features = extractCharacterFeatures(segmentCanvas, segmentCtx);

			// for (let i = 0; i < features.length; i++) {
			// 	if (i % 50 === 0) {
			// 		console.log('');
			// 	}

			// 	process.stdout.write(features[i] === 1 ? 'X' : ' ');
			// }

			const vectors = getReferenceVectors();
			const k = 10;
			const bestGuess = knn(vectors, features, k);
			outputText += bestGuess;
			// console.log(`\nBest guess(with weighted average out of ${k} votes): ${bestGuess}\n\n\n`);
		});
		console.log(`\nBest guess: ${outputText}\n\n\n`);
	});
}

export default ocr;