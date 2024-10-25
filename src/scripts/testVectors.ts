import { createCanvas } from 'canvas';
import { knn } from '../app/knn';
import { getReferenceVectors } from '../app/vectors';
import { convertToGreyscale, scaleImage, cropToBoundingBox, extractFeatures } from '../app';
import { binarize } from '../app/otsu';
import { printCharacter } from './util';

const canvas = createCanvas(50, 50);
const ctx = canvas.getContext('2d');

const fontStyle = 'italic';
const fontName = 'Helvetica Neue';
const characterToTest = 'b';

printCharacter(characterToTest, fontName, fontStyle, canvas, ctx);
convertToGreyscale(canvas, ctx);
binarize(canvas, ctx);
cropToBoundingBox(canvas, ctx);
scaleImage(canvas, ctx, 50, 50);
const visiblePixels = extractFeatures(canvas, ctx);

const vectors = getReferenceVectors();
const k = 10;
const bestGuess = knn(vectors, visiblePixels, k);
console.log(`\nBest guess(with weighted average out of ${k} votes): ${bestGuess}`);

for (let i = 0; i < visiblePixels.length; i++) {
	if (i % 50 === 0) {
		console.log('');
	}

	process.stdout.write(visiblePixels[i] === 1 ? 'X' : ' ');
}
