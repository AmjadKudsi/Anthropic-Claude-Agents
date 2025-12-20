/**
 * Sum two numbers and return the result.
 * 
 * @param a - First number to add
 * @param b - Second number to add
 * @returns The sum of a and b
 */
export function sumNumbers(a: number, b: number): number {
    return a + b;
}

/**
 * Multiply two numbers and return the result.
 * 
 * @param a - First number to multiply
 * @param b - Second number to multiply
 * @returns The product of a and b
 */
export function multiplyNumbers(a: number, b: number): number {
    return a * b;
}

/**
 * Subtract the second number from the first and return the result.
 * 
 * @param a - Number to subtract from
 * @param b - Number to subtract
 * @returns The difference of a and b
 */
export function subtractNumbers(a: number, b: number): number {
    return a - b;
}

/**
 * Divide the first number by the second and return the result.
 * 
 * @param a - Number to divide (dividend)
 * @param b - Number to divide by (divisor)
 * @returns The quotient of a and b
 * @throws Error if b is zero (division by zero)
 */
export function divideNumbers(a: number, b: number): number {
    if (b === 0) {
        throw new Error("Cannot divide by zero");
    }
    return a / b;
}

/**
 * Raise the base to the power of the exponent.
 * 
 * @param base - The base number
 * @param exponent - The exponent
 * @returns The result of base raised to the power of exponent
 */
export function power(base: number, exponent: number): number {
    return Math.pow(base, exponent);
}

/**
 * Calculate the square root of a number.
 * 
 * @param number - The number to find the square root of
 * @returns The square root of the number
 * @throws Error if number is negative
 */
export function squareRoot(number: number): number {
    if (number < 0) {
        throw new Error("Cannot calculate square root of negative number");
    }
    return Math.sqrt(number);
}