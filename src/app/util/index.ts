export const progressBar = (current: number, total: number, label: string, lineIndex: number, lineTotal: number) => {
    const totalRows = process.stdout.rows;
    const row = totalRows - 1 - (lineTotal - lineIndex);
    const percentage = Math.round((current / total) * 100);
    const bar = '='.repeat(Math.round(percentage / 2)) + ' '.repeat(50 - Math.round(percentage / 2));
    process.stdout.cursorTo(0, row);
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

export const padNumber = (num: number, size: number) => {
    return num.toString().padStart(size, ' ');
}