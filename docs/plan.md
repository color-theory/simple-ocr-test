# Plan of Attack

I need to do the following:
* Create a list of characters that will be recognized by the OCR
	* Each character will be one line for ease of loading
* Generate an image of each character
	* Parse through the raw list of characters and create a 50px by 50px image for each one
	* 1 bit per pixel? on or off black and white. I could also perhaps use 8bit and do it in greyscale to capture antialiasing of the character
	* Generate from html and run in browser.
	* html will output in a grid of 50x50 for each character, 10 chars wide
	* This will allow us to know the x and y coords of the upper left corner of each character based on their order in the dom
	* Need to figure out how to actually capture each pixel of the screen from the location coords + 50,50 and render each pixel to an image
	* Actually, perhaps we don't need to generate an image to extract the pixel data from each rendered character. If we can get the pixel data from the screen to generate the image, we could probably just write that pixel data directly into the data for the next step?
		* Yes, so using the html5 canvas API, we can forgo the image generation and simply get the pixel data we need.
* Extract the pixel data as features for each character
	* For each character, analyze each pixel and record it in order as a single vector.
	* for example if I had a 4x4 image of the letter A, it would be an array with a length of 16 elements, each representing a single pixel.
	* save each vector to a json file that contains the data for all characters with the key
* Write KNN algorithm to work with vector data from the previous step
	* will compare it directly against another vector of the same size.
* Start with a simple comparison of source image to see if it is a character
	* basically can be used to validate that my KNN algorithm detects the orginal source image correctly
* Need to be able to parse through an image of a single character
	* remove a background(perhaps by adjusting value contrast?)
	* detect the upper left corner of the character
	* crop and scale if necessary to get closer to the vector data
	* extract features of the adjusted image
	* use KNN algorithm to find the closest character to that data
	* return value
* Once we can parse a single character, we need to figure out how to scan an image with multiple characters
	* top to bottom, left to right
	* will likely use the same technique to make it easier to recognize the boundaries of each character as the prev step (ie: value contrast to remove noise)
	* How do we do this effectively? Some characters such as a double quote, have whitespace in between but should be recognized as a single character.
	* we can't start at the first dark pixel as some words, such as pixel, will have the tallest dark pixel in the upper right of the image.
	* we will need to determine average line-height and character width somehow before we can start scanning
	* once we have line height, we should crop the top and bottom of the image to the boundaries of the top of the first line of text and the bottom of the last.
	* We'll also need to know of the line spacing, but This is starting to get complex.
	* Letter spacing is variable for different typefaces and some even have ligatures, which we should ignore for now
	* At some point we should be able to isolate a single character shape based on min-width, max-width, line-height, and whitespace to determine character boundaries.
	* at this point, we can run through our previous step for each character that we parsed out and determine which character is closest
