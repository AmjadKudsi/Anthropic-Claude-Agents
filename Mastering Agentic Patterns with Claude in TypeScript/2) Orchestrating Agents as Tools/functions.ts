export function sumNumbers(a: number, b: number): number {
  return a + b;
}

export function multiplyNumbers(a: number, b: number): number {
  return a * b;
}

export function subtractNumbers(a: number, b: number): number {
  return a - b;
}

export function divideNumbers(a: number, b: number): number {
  if (b === 0) {
    throw new Error("Cannot divide by zero");
  }
  return a / b;
}

export function power(base: number, exponent: number): number {
  return Math.pow(base, exponent);
}

export function squareRoot(number: number): number {
  if (number < 0) {
    throw new Error("Cannot calculate square root of negative number");
  }
  return Math.sqrt(number);
}