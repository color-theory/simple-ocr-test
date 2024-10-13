# simple-ocr-test
My first attempt at OCR.

It should take an image and parse out readable characters from top to bottom,
left to right and return the value as a string.

## Warning
* This is a naive approach for learning purposes. People who care about OCR and
have been doing it forever will obviously have a much better way of doing it. 
If you need an OCR library, it would be wise to look elsewhere.

## Usage
```js
const text = ocr("./image.jpg");
```