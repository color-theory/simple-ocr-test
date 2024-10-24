import * as fs from 'fs';
import * as path from 'path';
import { createCanvas, registerFont } from 'canvas';

const canvas = createCanvas(50, 50);
const ctx = canvas.getContext('2d');

const characterData = fs.readFileSync('../data/characters-raw.txt', 'utf8');
const characters = characterData.split('\n');

const vectors: { character: string, pixelData: number[] }[] = [];

const getFonts = () => {
  const files = fs.readdirSync('../fonts');
  const ttfFiles = files.filter(file => path.extname(file).toLowerCase() === '.ttf');
  const result = ttfFiles.map(file => ({ name: file, path: path.join('../fonts', file) }));
  return result;
}

const registerFonts = (fonts: { name: string, path: string }[]) => {
  fonts.forEach((font) => {
    registerFont(font.path, { family: font.name });
  });
}

const fonts = getFonts();
registerFonts(fonts);

function printCharacter(character: string, font: string, fontStyle: string) {
  const canvasSize = 50;
  let fontSize = 50;
  ctx.font = `${fontStyle} ${fontSize}px ${font}`;

  let textMetrics = ctx.measureText(character);

  // Reduce font size to fit within the canvas
  while (textMetrics.width > canvasSize ||
    (textMetrics.actualBoundingBoxAscent + textMetrics.actualBoundingBoxDescent) > canvasSize) {
    fontSize--;
    ctx.font = `${fontStyle} ${fontSize}px ${font}`;
    textMetrics = ctx.measureText(character);
  }

  // Clear the canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw the character in the upper-left corner (0, 0)
  const x = 0;
  const y = textMetrics.actualBoundingBoxAscent;  // Start drawing from the baseline

  ctx.fillText(character, x, y);
}

const fontStyles = ["normal", "italic", "bold"];
fonts.forEach((font) => {
  fontStyles.forEach((fontStyle) => {
    characters.forEach((character: string,) => {
      printCharacter(character, font.name, fontStyle);

      const pixelData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      let visiblePixels = [];

      for (let i = 0; i < pixelData.length; i += 4) {
        // Check if the alpha value (4th component) is greater than 0 (non-transparent)
        let alpha = pixelData[i + 3];
        visiblePixels.push(alpha > 0 ? 1 : 0);
      }

      vectors.push({
        character,
        pixelData: visiblePixels,
      });

    });
  });
});
fs.writeFileSync('../data/vectors.json', JSON.stringify(vectors, null, 2));
console.log('Character vectors generated and saved to vectors.json');
