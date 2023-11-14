#!/usr/bin/env node
/* eslint-disable no-undef */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function generateComponent(baseDir, componentName) {
  const componentDir = path.join(baseDir); // toLowerCamelCase(componentName)
  const componentTemplate = `import React, {useState} from 'react';

export interface ${componentName}Props {

}

const ${componentName}: React.FC<${componentName}Props> = ({}) => {

  return (<div></div>);
};

export default ${componentName};
`;

  const filePathTs = path.join(componentDir, `${componentName}.tsx`);
  fs.writeFileSync(filePathTs, componentTemplate);

  console.log(`Component "${componentName}" generated successfully!`);
}

// Get command and component name from command-line arguments
const [command, componentName] = process.argv.slice(2);

if (!componentName) {
  console.error("Please provide a component name.");
  process.exit(1);
}

switch (command) {
  case "component":
    generateComponent(path.join(__dirname, "src", "components"), componentName);
    break;
  case "page":
    generateComponent(path.join(__dirname, "src", "pages"), componentName);
    break;
  default:
    console.error('Invalid command. Please use "component" or "page" command.');
    process.exit(1);
}
