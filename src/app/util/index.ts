export const progressBar = (current: number, total: number, label: string) => {
    const percentage = Math.round((current / total) * 100);
    const bar = '='.repeat(Math.round(percentage / 2)) + ' '.repeat(50 - Math.round(percentage / 2));
    process.stdout.write(`\r${label} [${bar}] ${percentage}%`);
}

export const visualizeVector = (vector: number[], vectorSize: number) => {
    for (let i = 0; i < vector.length; i++) {
        if (i % vectorSize === 0) {
            process.stdout.write('\r\n');
        }

        process.stdout.write(vector[i] === 1 ? 'X' : ' ');
    }
}