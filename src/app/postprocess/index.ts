export const getCorrectedText = async (ocrText: string): Promise<string> => {
    const response = await fetch("http://localhost:8080/spellcheck", {
        method: "POST",
        headers: {
            "Content-Type": "text/plain"
        },
        body: ocrText
    });

    if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
    }

    return await response.text();
}