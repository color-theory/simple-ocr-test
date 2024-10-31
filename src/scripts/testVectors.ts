import { createCanvas, registerFont } from 'canvas';
import { getNearestNeighbors } from '../app/knn';
import { getReferenceVectors } from '../app/vectors';
import { extractCharacterFeatures, getBounds } from '../app/extraction';
import { cropToBoundingBox, scaleImage, convertToGreyscale, binarize } from '../app/preprocess';
import { printCharacter, printFamily } from './util';
import { vectorSize } from '../app/config';
import * as fs from 'fs';
import * as path from 'path';

const canvas = createCanvas(vectorSize, vectorSize);
const ctx = canvas.getContext('2d');

const getFonts = () => {
	const fontsPath = path.resolve(__dirname, '../fonts');
	const files = fs.readdirSync(fontsPath);
	const ttfFiles = files.filter(file => path.extname(file).toLowerCase() === '.ttf');
	const result = ttfFiles.map(file => ({ name: file.slice(0, -4), path: path.join(fontsPath, file) }));
	return result;
}

const registerFonts = (fonts: { name: string, path: string }[]) => {
	fonts.forEach((font) => {
		registerFont(font.path, { family: font.name });
	});
}

const fonts = getFonts();
console.log(`Found ${fonts.length} fonts. Registering fonts...`);
registerFonts(fonts);
console.log('Fonts registered. Generating test vectors...');

const characterData = fs.readFileSync(path.resolve(__dirname, '../data/characters-raw.txt'), 'utf8');
const characters = characterData.split(/\r?\n/);

let wrongGuesses = 0;
let correctGuesses = 0;
(async () => {
	for (const font of fonts) {
		const fontName = font.name;
		const fontStyle = "normal";
		for (const character of characters) {
			const characterToTest = character;
			const { canvas: familyCanvas, ctx: familyCtx } = printFamily(fontName, fontStyle, vectorSize, characters);
			const { minY, maxY } = getBounds(familyCanvas, familyCtx);
			console.log(`generating test vector for ${characterToTest} in font ${fontName} with style ${fontStyle}`);
			printCharacter(canvas, ctx, characterToTest, fontName, fontStyle, vectorSize);
			convertToGreyscale(canvas, ctx);
			binarize(canvas, ctx);
			cropToBoundingBox(canvas, ctx, minY, maxY);
			scaleImage(canvas, ctx, vectorSize, vectorSize);
			binarize(canvas, ctx);
			const visiblePixels = extractCharacterFeatures(canvas, ctx);

			const vectors = getReferenceVectors();
			const k = 5;
			const bestGuess = await getNearestNeighbors(vectors, visiblePixels, k);
			if (bestGuess === characterToTest) {
				correctGuesses++;
			} else {
				console.log(`Incorrect guess! ${characterToTest} was incorrectly identified as ${bestGuess}`);
				wrongGuesses++;
			}
		};
	};

	console.log(`\nCorrect guesses: ${correctGuesses}`);
	console.log(`Incorrect guesses: ${wrongGuesses}`);
})();