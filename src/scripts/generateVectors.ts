import * as fs from 'fs';
import { createCanvas } from 'canvas';

const canvas = createCanvas(50, 50);
const ctx = canvas.getContext('2d');

const characterData = fs.readFileSync('./data/characters-raw.txt', 'utf8');
const characters = characterData.split('\n');

const vectors: Record<string, any> = {};

characters.forEach((character) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = '40px sans-serif';
    ctx.fillText(character, 0, 40);

    const pixelData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let visiblePixels = [];

    for (let i = 0; i < pixelData.length; i += 4) {
      // Check if the alpha value (4th component) is greater than 0 (non-transparent)
      let alpha = pixelData[i + 3];
      visiblePixels.push(alpha > 0 ? 1 : 0);
    }

    // let lineToPrint = '';
    // for (let i = 0; i < visiblePixels.length; i ++) {
    //   lineToPrint += visiblePixels[i] ? 'X' : ' ';
    //     if (i % canvas.width === 0) {
    //     console.log(lineToPrint);
    //     lineToPrint = '';
    //   }
    // }

    vectors[character] = {
        width: canvas.width,
        height: canvas.height,
        pixelData: visiblePixels,
    };
});

fs.writeFileSync('./vectors/characterVectors.json', JSON.stringify(vectors, null, 2));
console.log('Character vectors generated and saved to characterVectors.json');