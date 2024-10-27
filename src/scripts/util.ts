import { createCanvas, Canvas, CanvasRenderingContext2D } from 'canvas';

export const printFamily = (font: string, fontStyle: string, vectorSize: number, characters: string[]) => {
	const canvasSize = vectorSize;
	const canvas = createCanvas(canvasSize, canvasSize);
	const ctx = canvas.getContext('2d');

	ctx.fillStyle = 'rgba(255, 255, 255, 1)';
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	ctx.fillStyle = 'rgba(0, 0, 0, 1)';
	ctx.font = `${fontStyle} ${canvasSize * .65}px ${font}`;
	characters.forEach((character: string) => {
		ctx.textBaseline = "top";
		ctx.fillText(character, 0, 0);
	});
	return {canvas, ctx};
}

export const printCharacter = ( canvas: Canvas, ctx: CanvasRenderingContext2D, character: string, font: string, fontStyle: string, vectorSize: number ) => {
	const canvasSize = vectorSize;

	canvas.width = canvasSize;
	canvas.height = canvasSize;

	ctx.fillStyle = 'rgba(255, 255, 255, 1)';
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	ctx.fillStyle = 'rgba(0, 0, 0, 1)';
	ctx.font = `${fontStyle} ${canvasSize * .65}px ${font}`;
	ctx.textBaseline = "top";
	ctx.fillText(character, 0,0);
}