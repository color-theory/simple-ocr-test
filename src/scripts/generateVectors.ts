import * as fs from 'fs';
import * as path from 'path';
import { createCanvas, registerFont } from 'canvas';
import { extractCharacterFeatures, getBounds } from '../app/extraction';
import { cropToBoundingBox, scaleImage, convertToGreyscale, binarize } from '../app/preprocess';
import { printCharacter, printFamily } from './util';
import { vectorSize } from '../app/config';

const canvas = createCanvas(vectorSize, vectorSize);
const ctx = canvas.getContext('2d');

const characterData = fs.readFileSync(path.resolve(__dirname, '../data/characters-raw.txt'), 'utf8');
const characters = characterData.split(/\r?\n/);

const vectors: { character: string, pixelData: number[] }[] = [];

const getFonts = () => {
  const fontsPath = path.resolve(__dirname, '../fonts');
  const files = fs.readdirSync(fontsPath);
  const ttfFiles = files.filter(file => path.extname(file).toLowerCase() === '.ttf');
  const result = ttfFiles.map(file => ({ name: file.slice(0,-4), path: path.join(fontsPath, file) }));
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
console.log('Fonts registered. Generating reference vectors...');

const fontStyles = ["normal"];
fonts.forEach((font) => {
  fontStyles.forEach((fontStyle,index) => {
    const {canvas: familyCanvas, ctx: familyCtx} = printFamily(font.name, fontStyle, vectorSize, characters);
    const {minY, maxY} = getBounds(familyCanvas, familyCtx);
    console.log(`Family saved as ${font.name}-family.png minY: ${minY}, maxY: ${maxY}`);


    characters.forEach((character: string,) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      printCharacter(canvas, ctx, character, font.name, fontStyle, vectorSize);
      convertToGreyscale(canvas, ctx);
      binarize(canvas, ctx);
      cropToBoundingBox(canvas, ctx, minY, maxY);  
      scaleImage(canvas, ctx, vectorSize, vectorSize);
      binarize(canvas, ctx);
      const visiblePixels = extractCharacterFeatures(canvas, ctx);
      vectors.push({
        character,
        pixelData: visiblePixels,
      });

    });
  });
});
// generate empty space vector
vectors.push({
  character: ' ',
  pixelData: Array(vectorSize * vectorSize).fill(0),
});

fs.writeFileSync(path.resolve(__dirname, '../data/vectors.json'), JSON.stringify(vectors, null, 2));
console.log('Character vectors generated and saved to vectors.json');
