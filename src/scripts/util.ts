import { Canvas, CanvasRenderingContext2D } from 'canvas';

export function printCharacter(character: string, font: string, fontStyle: string, canvas: Canvas, ctx: CanvasRenderingContext2D) {
	const canvasSize = 50;

	canvas.width = canvasSize;
	canvas.height = canvasSize;

	ctx.fillStyle = 'rgba(255, 255, 255, 1)';
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	ctx.fillStyle = 'rgba(0, 0, 0, 1)';
	ctx.font = `${fontStyle} ${canvasSize}px ${font}`;

	const textMetrics = ctx.measureText(character);
	const textWidth = textMetrics.width;
	const textHeight = textMetrics.actualBoundingBoxAscent + textMetrics.actualBoundingBoxDescent;

	const x = (canvasSize - textWidth) / 2;
	const y = (canvasSize + textHeight) / 2 - textMetrics.actualBoundingBoxDescent;

	ctx.fillText(character, x, y);
}