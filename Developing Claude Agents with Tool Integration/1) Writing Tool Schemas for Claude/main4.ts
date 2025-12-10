// creating the mapping system that connects Claude's tool requests to your actual TypeScript functions

import { sumNumbers, multiplyNumbers } from './functions';

// TODO: Create an object mapping tool names to functions
const tools: Record<string, Function> = {
    "sum_numbers": sumNumbers,
    "multiply_numbers": multiplyNumbers
}

// TODO: Test sum_numbers through the object with values 25 and 17, print the result
const result1 = tools['sum_numbers'](25, 17);
console.log(`sum_numbers(25, 17) = ${result1}`);


// TODO: Test multiply_numbers through the object with values 6 and 9, print the result
const result2 = tools['multiply_numbers'](6, 9);
console.log(`multiply_numbers(6, 9) = ${result2}`);