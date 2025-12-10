// fill in the missing information based on the sumNumbers function you created in the previous exercise

import fs from 'fs';

// TODO: Load the schema from the schemas.json file using fs.readFileSync() and JSON.parse()
const toolSchemas = JSON.parse(fs.readFileSync('schemas.json', 'utf-8'));

// TODO: Display the schema using JSON.stringify() with null and 2 as arguments for proper formatting
console.log(JSON.stringify(toolSchemas, null, 2));