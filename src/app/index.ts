/**
 * This is the main component of the application.
 * @param image - The image to be processed
 * @returns The text extracted from the image
 */
import { loadImage, Image } from 'canvas';
import { getReferenceVectors } from './vectors';
import { knn } from './knn';
import { createAndLoadCanvas, convertToGreyscale, cropToBoundingBox, binarize, prepareLine, prepareSegment, pad, invertIfDarkBackground } from './preprocess';
import { getCharacterSegments, getLineSegments, extractCharacterFeatures } from './extraction';
import { vectorSize } from './config';
import { progressBar } from './util';

export const preprocessImage = (image: Image) => {
	const { canvas, ctx } = createAndLoadCanvas(image);
	convertToGreyscale(canvas, ctx);
	invertIfDarkBackground(canvas, ctx);
	binarize(canvas, ctx);
	pad(canvas, ctx, 10);
	cropToBoundingBox(canvas, ctx);

	return { canvas, ctx };
};

const ocr = (imagePath: string) => {
	loadImage(imagePath).then((image) => {
		let outputText = '';

		const { canvas, ctx } = preprocessImage(image);
		const lines = getLineSegments(canvas, ctx);
		console.log(`Found ${lines.length} lines. Analyzing...`);
		lines.forEach((line, lineIndex) => {
			const { lineCanvas, lineCtx } = prepareLine(canvas, line, vectorSize);
			const segments = getCharacterSegments(lineCanvas, lineCtx, line.end - line.start);

			segments.forEach((segment, index) => {
				if (segment.type == 'space') {
					outputText += ' ';
					return;
				};
				if(segment.type == 'gap') {
					return;
				}
				progressBar(index + 1, segments.length, `Analyzing line ${lineIndex + 1} segments:`);
				const { segmentCanvas, segmentCtx } = prepareSegment( lineCanvas, segment, vectorSize);				
				const features = extractCharacterFeatures(segmentCanvas, segmentCtx);
				const vectors = getReferenceVectors();
				const k = 10;
				const bestGuess = knn(vectors, features, k);
				outputText += bestGuess;
			});
			outputText += '\n';
		});
		console.log(`\n\nBest guess: \n${outputText}\n`);
	});
}

export default ocr;