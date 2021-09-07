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

    @cache()
    public static getMultipleStatic(int1: number, int2: number): number {
        return Math.random() * int1 * int2;
    }

    @cache({ maxArgs: 0 })
    public getComplexMax(int: number): number {
        return Math.random() * this.multiplier * int;
    }

    @cache()
    public getObjectComparison(_foo: unknown): number {
        return Math.random();
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

    public static resetStatic(): void {
        clear(TestClass.getMultipleStatic, TestClass);
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

    it("static - should be the same number", () => {
        expect(TestClass.getMultipleStatic(10, 20)).toEqual(TestClass.getMultipleStatic(10, 20));
    });

    it("memoize - should be the same number", () => {
        expect(test.memoized({ value: 10 }, { value: 20 })).toEqual(test.memoized({ value: 10 }, { value: 20 }));
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

    it("static - should be a new number", () => {
        const number = TestClass.getMultipleStatic(10, 20);
        TestClass.resetStatic();
        expect(TestClass.getMultipleStatic(10, 20)).not.toEqual(number);
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

    it("static - should be a different number", () => {
        expect(TestClass.getMultipleStatic(20, 30)).not.toEqual(TestClass.getMultipleStatic(10, 20));
    });

    it("memoize - should be a different number", () => {
        expect(test.memoized({ value: 10 }, { value: 20 })).not.toEqual(test.memoized({ value: 30 }, { value: 20 }));
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

    it("max args - should be the same number", () => {
        expect(test.getComplexMax(100)).toEqual(test.getComplexMax(200));
    });

    it("object - should be the same number", () => {
        expect(test.getObjectComparison({ a: "test", b: 13 })).toEqual(test.getObjectComparison({ a: "test", b: 13 }));
    });

    it("object - should be the same number", () => {
        expect(test.getObjectComparison({ e: [2, 1], d: { b: 1, a: 2 }, c: false, a: "test", b: 13 })).toEqual(
            test.getObjectComparison({ a: "test", b: 13, c: false, d: { a: 2, b: 1 }, e: [1, 2] })
        );
    });

    it("object - should be a new number", () => {
        expect(test.getObjectComparison({ a: "test", b: 13 })).not.toEqual(
            test.getObjectComparison({ a: "test", b: 11 })
        );
    });
});

export {};
