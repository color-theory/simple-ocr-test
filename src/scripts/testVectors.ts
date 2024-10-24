import * as fs from 'fs';
import { createCanvas } from 'canvas';

const canvas = createCanvas(50, 50);
const ctx = canvas.getContext('2d');

const vectorsRaw = fs.readFileSync('../data/vectors.json', 'utf8');
const vectors = JSON.parse(vectorsRaw);

function printCharacter(character: string) {
	const canvasSize = 50;
	let fontSize = 50;
	ctx.font = `${fontSize}px Arial`;

	let textMetrics = ctx.measureText(character);

	// Reduce font size to fit within the canvas
	while (textMetrics.width > canvasSize ||
		(textMetrics.actualBoundingBoxAscent + textMetrics.actualBoundingBoxDescent) > canvasSize) {
		fontSize--;
		ctx.font = `${fontSize}px Arial`;
		textMetrics = ctx.measureText(character);
	}

	// Clear the canvas
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	// Draw the character in the upper-left corner (0, 0)
	const x = 0;
	const y = textMetrics.actualBoundingBoxAscent;  // Start drawing from the baseline

	ctx.fillText(character, x, y);
}

printCharacter('R');
const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
let visiblePixels = [];

for (let i = 0; i < imageData.length; i += 4) {
	// Check if the alpha value (4th component) is greater than 0 (non-transparent)
	let alpha = imageData[i + 3];
	visiblePixels.push(alpha > 0 ? 1 : 0);
}

const euclideanDistance = (vector1: number[], vector2: number[]) => {
	let distance = 0;

	for (let i = 0; i < vector1.length; i++) {
		distance += Math.pow(vector1[i] - vector2[i], 2);
	}

	return Math.sqrt(distance);
};

const knn = (vectors: Record<string, any>, vector: number[], k: number) => {
	const distances = Object.keys(vectors).map((character: string) => {
		return {
			character,
			distance: euclideanDistance(vector, vectors[character].pixelData),
		};
	});

	distances.sort((a, b) => a.distance - b.distance);

	return distances.slice(0, k);
}

const k = 3;
const bestGuesses = knn(vectors, visiblePixels, k);
console.log(`\nBest guesses(in order of confidence): ${bestGuesses[0].character}, ${bestGuesses[1].character}, ${bestGuesses[2].character}\n\nCharacter that was on the canvas: \n`);
for (let i = 0; i < visiblePixels.length; i++) {
	if (i % 50 === 0) {
		console.log('');
	}

	process.stdout.write(visiblePixels[i] === 1 ? 'X' : ' ');
}
