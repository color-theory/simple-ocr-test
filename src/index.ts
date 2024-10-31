/**
 * @fileoverview Entry point of the application
 * @packageDocumentation
 * @module index
 * @preferred
 * 
 */

import ocr from './app';

// Run the OCR function with the image path provided as an argument
(async () => {
	const start = Date.now();
	await ocr(process.argv[2]);
	const end = Date.now();
	console.log(`Execution time: ${end - start}ms`);
})();
