import * as fs from 'fs';
import * as path from 'path';
import { createCanvas } from 'canvas';

const canvas = createCanvas(50, 50);
const ctx = canvas.getContext('2d');

const vectorPath = path.resolve(__dirname, '../data/vectors.json');
const vectorsRaw = fs.readFileSync(vectorPath, 'utf8');
const vectors = JSON.parse(vectorsRaw);

const fontStyle = 'italic';
const fontName = 'Helvetica Neue';
const characterToTest = 'b';


function printCharacter(character: string) {
	const canvasSize = 50;
	let fontSize = 50;
	ctx.font = `${fontStyle} ${fontSize}px ${fontName}`;

	let textMetrics = ctx.measureText(character);

	while (textMetrics.width > canvasSize ||
		(textMetrics.actualBoundingBoxAscent + textMetrics.actualBoundingBoxDescent) > canvasSize) {
		fontSize--;
		ctx.font = `${fontStyle} ${fontSize}px ${fontName}`;
		textMetrics = ctx.measureText(character);
	}

	ctx.clearRect(0, 0, canvas.width, canvas.height);
	const x = 0;
	const y = textMetrics.actualBoundingBoxAscent;

	ctx.fillText(character, x, y);
}

printCharacter(characterToTest);
const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
let visiblePixels = [];

for (let i = 0; i < imageData.length; i += 4) {
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

const knn = (vectors: { character: string, pixelData: number[] }[], vector: number[], k: number) => {
	const distances = vectors.map((vectorData) => {
		return {
			character: vectorData.character,
			distance: euclideanDistance(vector, vectorData.pixelData),
		};
	});

	distances.sort((a, b) => a.distance - b.distance);

	return distances.slice(0, k);
}

const k = 10;
const bestGuesses = knn(vectors, visiblePixels, k);
console.log(`\nBest guesses(with weighted average out of ${k} votes): `);

const vote = (guesses: any) => {
	const votes = new Map();

	guesses.forEach((guess: any) => {
		const confidence = 100 - guess.distance;
		const [existingConfidence, count] = votes.get(guess.character) ? votes.get(guess.character) : [0, 0];

		if (count === undefined) {
			votes.set(guess.character, [confidence, 1]);
		} else {
			votes.set(guess.character, [existingConfidence + confidence, count + 1]);
		}
	});

	const votesWithAverages = Array.from(votes.entries()).map(([character, [confidence, count]]) => {
		return [character, confidence / count];
	});

	const sortedVotes = votesWithAverages.sort((a, b) => b[1] - a[1]);

	return sortedVotes;
}

const votes = vote(bestGuesses);

for (const [character, count] of votes) {
	console.log(`${character}: ${count}`);
}

for (let i = 0; i < visiblePixels.length; i++) {
	if (i % 50 === 0) {
		console.log('');
	}

	process.stdout.write(visiblePixels[i] === 1 ? 'X' : ' ');
}
