import * as fs from 'fs';
import { createCanvas } from 'canvas';

const canvas = createCanvas(50, 50);
const ctx = canvas.getContext('2d');

const characterData = fs.readFileSync('../data/characters-raw.txt', 'utf8');
const characters = characterData.split('\n');

const vectors: Record<string, any> = {};

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

characters.forEach((character: string) => {
  printCharacter(character);

  const pixelData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
  let visiblePixels = [];

  for (let i = 0; i < pixelData.length; i += 4) {
    // Check if the alpha value (4th component) is greater than 0 (non-transparent)
    let alpha = pixelData[i + 3];
    visiblePixels.push(alpha > 0 ? 1 : 0);
  }

  vectors[character] = {
    width: canvas.width,
    height: canvas.height,
    pixelData: visiblePixels,
  };
});

fs.writeFileSync('../data/vectors.json', JSON.stringify(vectors, null, 2));
console.log('Character vectors generated and saved to vectors.json');