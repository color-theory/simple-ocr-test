import * as fs from 'fs';
import * as path from 'path';
import { createCanvas, registerFont } from 'canvas';
import { cropToBoundingBox, scaleImage, convertToGreyscale, extractFeatures } from '../app';
import { binarize } from '../app/otsu';
import { printCharacter } from './util';

const canvas = createCanvas(50, 50);
const ctx = canvas.getContext('2d');

const characterData = fs.readFileSync(path.resolve(__dirname, '../data/characters-raw.txt'), 'utf8');
const characters = characterData.split('\n');

const vectors: { character: string, pixelData: number[] }[] = [];

const getFonts = () => {
  const fontsPath = path.resolve(__dirname, '../fonts');
  const files = fs.readdirSync(fontsPath);
  const ttfFiles = files.filter(file => path.extname(file).toLowerCase() === '.ttf');
  const result = ttfFiles.map(file => ({ name: file, path: path.join(fontsPath, file) }));
  return result;
}

const registerFonts = (fonts: { name: string, path: string }[]) => {
  fonts.forEach((font) => {
    registerFont(font.path, { family: font.name });
  });
}

const fonts = getFonts();
registerFonts(fonts);

const fontStyles = ["normal", "italic", "bold"];
fonts.forEach((font) => {
  fontStyles.forEach((fontStyle) => {
    characters.forEach((character: string,) => {
      printCharacter(character, font.name, fontStyle, canvas, ctx);

      convertToGreyscale(canvas, ctx);
      binarize(canvas, ctx);
      cropToBoundingBox(canvas, ctx);
      scaleImage(canvas, ctx, 50, 50);

      const visiblePixels = extractFeatures(canvas, ctx);

      vectors.push({
        character,
        pixelData: visiblePixels,
      });

    });
  });
});
fs.writeFileSync(path.resolve(__dirname, '../data/vectors.json'), JSON.stringify(vectors, null, 2));
console.log('Character vectors generated and saved to vectors.json');
