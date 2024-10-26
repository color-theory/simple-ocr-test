import { createCanvas, Image, Canvas, CanvasRenderingContext2D } from 'canvas';
export { binarize } from './otsu';

export const createAndLoadCanvas = (image: Image) => {
	const canvas = createCanvas(image.width, image.height);
	const ctx = canvas.getContext('2d');
	ctx.drawImage(image, 0, 0);
	return { canvas, ctx };
}

export const convertToGreyscale = (canvas: Canvas, ctx: CanvasRenderingContext2D) => {
	const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
	const data = imageData.data;

	for (let i = 0; i < data.length; i += 4) {
		const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
		data[i] = avg;
		data[i + 1] = avg;
		data[i + 2] = avg;
	}

	ctx.putImageData(imageData, 0, 0);
}

export const scaleImage = (canvas: Canvas, ctx: CanvasRenderingContext2D, width: number, height: number) => {
	let tempCanvas = createCanvas(width, height);
	let tempCtx = tempCanvas.getContext('2d');

	tempCtx.drawImage(canvas, 0, 0, width, height);
	canvas.width = width;
	canvas.height = height;
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.drawImage(tempCanvas, 0, 0);
}

export const cropToBoundingBox = (canvas: Canvas, ctx: CanvasRenderingContext2D) => {
	const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
	const data = imageData.data;
	let minX = canvas.width;
	let minY = canvas.height;
	let maxX = 0;
	let maxY = 0;

	for (let x = 0; x < canvas.width; x++) {
		for (let y = 0; y < canvas.height; y++) {
			const i = (y * canvas.width + x) * 4;
			if (data[i] === 0) {
				if (x < minX) minX = x;
				if (y < minY) minY = y;
				if (x > maxX) maxX = x;
				if (y > maxY) maxY = y;
			}
		}
	}

	const width = maxX - minX + 1;
	const height = maxY - minY + 1;

	const croppedCanvas = createCanvas(width, height);
	const croppedCtx = croppedCanvas.getContext('2d');
	croppedCtx.drawImage(canvas, minX, minY, width, height, 0, 0, width, height);

	canvas.width = width;
	canvas.height = height;
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.drawImage(croppedCanvas, 0, 0);
}

export const prepareSegment = (segment: { start: number, end: number }, canvas: Canvas) => {
	const segmentWidth = segment.end - segment.start;
	const segmentCanvas = new Canvas(segmentWidth, canvas.height);
	const segmentCtx = segmentCanvas.getContext('2d');
	segmentCtx.drawImage(canvas, segment.start, 0, segmentWidth, canvas.height, 0, 0, segmentWidth, canvas.height);
	cropToBoundingBox(segmentCanvas, segmentCtx);
	scaleImage(segmentCanvas, segmentCtx, 50, 50);
	return { segmentCanvas, segmentCtx };
}