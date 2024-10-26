import { Canvas, CanvasRenderingContext2D } from 'canvas';

export const segmentImage = (canvas: Canvas, ctx: CanvasRenderingContext2D) => {
	const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
	const data = imageData.data;
	const columnHistogram = new Array(canvas.width).fill(0);

	for (let x = 0; x < canvas.width; x++) {
		for (let y = 0; y < canvas.height; y++) {
			const i = (y * canvas.width + x) * 4;
			if (data[i] === 0) {
				columnHistogram[x]++;
			}
		}
	}

	const segments = [];
	let segmentStart = 0;
	let segmentEnd = 0;
	let inSegment = false;

	for (let x = 0; x < canvas.width; x++) {
		if (columnHistogram[x] > 0 && !inSegment) {
			segmentStart = x;
			inSegment = true;
		} else if (columnHistogram[x] === 0 && inSegment) {
			segmentEnd = x;
			inSegment = false;
			segments.push({ start: segmentStart, end: segmentEnd });
		}
	}

	if (inSegment) {
		segments.push({ start: segmentStart, end: canvas.width });
	}

	return segments;
}

export const extractCharacterFeatures = (canvas: Canvas, ctx: CanvasRenderingContext2D) => {
	const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
	const data = imageData.data;
	const features = [];

	for (let i = 0; i < data.length; i += 4) {
		features.push(data[i] === 0 ? 1 : 0);
	}

	return features;
}

