import { cache, clear, memoize } from "../cache";

class TestClass {
    constructor(private multiplier = 1) {}

    public memoized = memoize((x: { value: number }, y: { value: number }) => {
        return Math.random() * this.multiplier + x.value + y.value;
    });

    @cache()
    public getBasic(): number {
        return Math.random() * this.multiplier;
    }

    @cache()
    public getComplex(int: number): number {
        return Math.random() * this.multiplier * int;
    }

    @cache()
    public getMultiple(int1: number, int2: number): number {
        return Math.random() * this.multiplier * int1 * int2;
    }

    public resetBasic(): void {
        clear(this.getBasic, this);
    }

    public resetComplex(): void {
        clear(this.getComplex, this);
    }

    public resetMultiple(): void {
        clear(this.getMultiple, this);
    }

    public resetMemoize(): void {
        clear(this.memoized, this);
    }
}

function baseFunction(int: number) {
    return Math.random() * int;
}

describe("Cache decorator with clearing", () => {
    const test = new TestClass();

    beforeEach(() => {
        test.resetBasic();
        test.resetComplex();
        test.resetMultiple();
        test.resetMemoize();
    });

    it("basic - should be the same number", () => {
        expect(test.getBasic()).toEqual(test.getBasic());
    });

    it("complex - should be the same number", () => {
        expect(test.getComplex(10)).toEqual(test.getComplex(10));
    });

    it("multiple - should be the same number", () => {
        expect(test.getMultiple(10, 20)).toEqual(test.getMultiple(10, 20));
    });

    it("memoize - should be the same number", () => {
        expect(test.memoized({ value: 10 }, { value: 20 })).toEqual(
            test.memoized({ value: 10 }, { value: 20 })
        );
    });

    it("function - should be the same number", () => {
        const memoizedFunction = memoize(baseFunction);
        expect(memoizedFunction(10)).toEqual(memoizedFunction(10));
    });

    it("basic - should be a new number", () => {
        const number = test.getBasic();
        test.resetBasic();
        expect(test.getBasic()).not.toEqual(number);
    });

    it("complex - should be a new number", () => {
        const number = test.getComplex(10);
        test.resetComplex();
        expect(test.getComplex(10)).not.toEqual(number);
    });

    it("multiple - should be a new number", () => {
        const number = test.getMultiple(10, 20);
        test.resetMultiple();
        expect(test.getMultiple(10, 20)).not.toEqual(number);
    });

    it("memoize - should be a new number", () => {
        const number = test.memoized({ value: 10 }, { value: 20 });
        test.resetMemoize();
        expect(test.memoized({ value: 10 }, { value: 20 })).not.toEqual(number);
    });

    it("function - should be a new number", () => {
        const memoizedFunction = memoize(baseFunction);
        const number = memoizedFunction(10);
        clear(memoizedFunction);
        expect(memoizedFunction(10)).not.toEqual(number);
    });

    it("complex - should be a different number", () => {
        expect(test.getComplex(20)).not.toEqual(test.getComplex(10));
    });

    it("multiple - should be a different number", () => {
        expect(test.getMultiple(20, 30)).not.toEqual(test.getMultiple(10, 20));
    });

    it("memoize - should be a different number", () => {
        expect(test.memoized({ value: 10 }, { value: 20 })).not.toEqual(
            test.memoized({ value: 30 }, { value: 20 })
        );
    });

    it("function - should be a different number", () => {
        const memoizedFunction = memoize(baseFunction);
        expect(memoizedFunction(10)).not.toEqual(memoizedFunction(20));
    });

    it("multiple functions - should be a different number", () => {
        const memoizedFunction1 = memoize(baseFunction);
        const memoizedFunction2 = memoize(baseFunction);
        expect(memoizedFunction1(10)).not.toEqual(memoizedFunction2(20));
    });

    it("multiple class instances - should be a different number", () => {
        const test2 = new TestClass(100);
        expect(test.getComplex(10)).not.toEqual(test2.getComplex(10));
    });

    it("different class instances - should be a different number", () => {
        const test1 = new TestClass(100);
        const test2 = new TestClass(100);
        expect(test1.getComplex(10)).not.toEqual(test2.getComplex(10));
    });
});

export {};
