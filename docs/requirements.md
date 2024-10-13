# Requirements

This document is going to capture my thoughts on what this app needs to be able to do.

## Functional

The ocr function should:
* Take a path to an image file and load it.
* Scan the image for readable characters from top to bottom, left to right.
* Output a string with all of the characters recognized in order.
* Whitespace between characters is not necessary to record into the return value.

## Nonfunctional

The function should:
* Complete within a few miliseconds.
* Be 90% accurate.
* Be easilly extendable to detect more characters as needed.