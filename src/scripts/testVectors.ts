import { createCanvas } from 'canvas';
import { knn } from '../app/knn';
import { getReferenceVectors } from '../app/vectors';
import { extractCharacterFeatures } from '../app/extraction';
import { cropToBoundingBox, scaleImage, convertToGreyscale, binarize } from '../app/preprocess';
import { printCharacter } from './util';
import { vectorSize } from '../app/config';
import { visualizeVector } from '../app/util';

const canvas = createCanvas(vectorSize, vectorSize);
const ctx = canvas.getContext('2d');

const fontStyle = 'normal';
const fontName = 'Arial';
const characterToTest = '8';

printCharacter( canvas, ctx, characterToTest, fontName, fontStyle, vectorSize );
convertToGreyscale(canvas, ctx);
binarize(canvas, ctx);
cropToBoundingBox(canvas, ctx);
scaleImage(canvas, ctx, vectorSize, vectorSize);
const visiblePixels = extractCharacterFeatures(canvas, ctx);

const vectors = getReferenceVectors();
const k = 5;
const bestGuess = knn(vectors, visiblePixels, k);
console.log(`\nBest guess(with weighted average out of ${k} votes): ${bestGuess}`);
visualizeVector( visiblePixels, vectorSize );
