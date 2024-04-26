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
function generateIcon(baseDir, componentName, content) {
  const componentDir = path.join(baseDir, "icons"); // toLowerCamelCase(componentName)
  const componentTemplate = `import React from "react";
import { SvgIconProps } from "@mui/material";
import Icon from "./Icon";

const ${componentName}Icon: React.FC<SvgIconProps> = (props) => {
  return (
    <Icon
      render={(color) => (
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          xmlns="http://www.w3.org/2000/svg">
          <g>
            <path d="${content}" fill={color} />
          </g>
        </svg>
      )}
      {...props}></Icon>
  );
};

export default ${componentName}Icon;
`;

  const filePathTs = path.join(componentDir, `${componentName}Icon.tsx`);
  fs.writeFileSync(filePathTs, componentTemplate);

  console.log(`Icon "${componentName}Icon" generated successfully!`);
}

// Get command and component name from command-line arguments
const [command, componentName] = process.argv.slice(2);

if (!componentName) {
  console.error("Please provide a component name.");
  process.exit(1);
}

console.log('process.argv', process.argv)

switch (command) {
  case "icon":
    generateIcon(path.join(__dirname, "src", "components"), componentName, process.argv.length > 4 ? process.argv[4] : "");
    break;
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
