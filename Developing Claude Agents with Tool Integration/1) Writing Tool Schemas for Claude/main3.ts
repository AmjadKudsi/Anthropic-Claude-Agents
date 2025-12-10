// transform your single-tool setup into a multi-tool system by adding a multiplyNumbers function alongside your existing sumNumbers function

import fs from 'fs';
import { sumNumbers, multiplyNumbers } from './functions';

// Load the schemas from JSON file
const schemasJson = fs.readFileSync('schemas.json', 'utf-8');
const toolSchemas = JSON.parse(schemasJson);

// Create a map of tool names to functions
const tools: Record<string, Function> = {
    "sum_numbers": sumNumbers,
    "multiply_numbers": multiplyNumbers
};

// Print the schemas
console.log(JSON.stringify(toolSchemas, null, 2));

// Use tools from the map
const result1 = tools['sum_numbers'](10, 5);
console.log(`sum_numbers(10, 5) = ${result1}`);

const result2 = tools['multiply_numbers'](4, 7);
console.log(`multiply_numbers(4, 7) = ${result2}`);