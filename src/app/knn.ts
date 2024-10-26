const euclideanDistance = (vector1: number[], vector2: number[]) => {
	let distance = 0;

	for (let i = 0; i < vector1.length; i++) {
		distance += Math.pow(vector1[i] - vector2[i], 2);
	}

	return Math.sqrt(distance);
};

const vote = (guesses: any) => {
	const votes = new Map();

	guesses.forEach((guess: any) => {
		const confidence = 100 - guess.distance;
		const [existingConfidence, count] = votes.get(guess.character) ? votes.get(guess.character) : [0, 0];
		if (count === undefined) {
			votes.set(guess.character, [confidence, 1]);
		} else {
			votes.set(guess.character, [existingConfidence + confidence, count + 1]);
		}
	});

	const votesWithAverages = Array.from(votes.entries()).map(([character, [confidence, count]]) => {
		return [character, confidence / count];
	});
	console.log(votesWithAverages);

	const sortedVotes = votesWithAverages.sort((a, b) => b[1] - a[1]);

	return sortedVotes[0];
}



export const knn = (vectors: { character: string, pixelData: number[] }[], vector: number[], k: number) => {
	const distances = vectors.map((vectorData) => {
		return {
			character: vectorData.character,
			distance: euclideanDistance(vector, vectorData.pixelData),
		};
	});

	distances.sort((a, b) => a.distance - b.distance);

	const bestGuesses = distances.slice(0, k);
	return vote(bestGuesses)[0]; // Return the character with the highest confidence
}