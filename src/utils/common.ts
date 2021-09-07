/* Map sequentially over T[] with an asynchronous function and return array of mapped values */
export async function promiseMap<T, S>(inputValues: T[], mapper: (value: T) => Promise<S>): Promise<S[]> {
    const output: S[] = [];
    for (const value of inputValues) {
        const res = await mapper(value);
        output.push(res);
    }
    return output;
}
