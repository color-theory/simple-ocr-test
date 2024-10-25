/**
 * @fileoverview Entry point of the application
 * @packageDocumentation
 * @module index
 * @preferred
 * 
 */

import ocr from './app';

// Run the OCR function with the image path provided as an argument
ocr(process.argv[2]);
