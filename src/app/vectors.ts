import * as fs from 'fs';
import * as path from 'path';

export const getReferenceVectors = () => {
	const vectorPath = path.resolve(__dirname, '../data/vectors.json');
	const vectorsRaw = fs.readFileSync(vectorPath, 'utf8');

	return JSON.parse(vectorsRaw);
}