const fs = require('fs');
const path = require('path');

// Find all TypeScript files
function findTsFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat && stat.isDirectory()) {
      // Skip node_modules and .git
      if (!file.startsWith('.') && file !== 'node_modules') {
        results = results.concat(findTsFiles(filePath));
      }
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      results.push(filePath);
    }
  });
  
  return results;
}

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Pattern 1: Fix corrupted error declarations outside functions
  if (content.includes('const error = await response.json();') && 
      !content.includes('async function') && 
      !content.includes('async (') &&
      !content.includes('= async (')) {
    content = content.replace(/^\s*const error = await response\.json\(\);\s*$/gm, '');
    modified = true;
  }
  
  // Pattern 2: Add missing navigate imports and declarations
  if (content.includes('navigate(') && !content.includes('useNavigate')) {
    // Add useNavigate import
    if (content.includes("from 'react-router-dom'")) {
      content = content.replace(
        /import\s*{([^}]+)}\s*from\s*['"]react-router-dom['"]/,
        (match, imports) => {
          if (!imports.includes('useNavigate')) {
            return `import { ${imports.trim()}, useNavigate } from 'react-router-dom'`;
          }
          return match;
        }
      );
    } else if (content.includes("import React")) {
      // Add the import after React import
      content = content.replace(
        /import React[^;]+;/,
        (match) => `${match}\nimport { useNavigate } from 'react-router-dom';`
      );
    }
    
    // Add navigate declaration inside component
    const componentMatch = content.match(/const\s+\w+:\s*React\.FC.*?=\s*\(\)\s*=>\s*{/);
    if (componentMatch && !content.includes('const navigate = useNavigate()')) {
      const insertPoint = componentMatch.index + componentMatch[0].length;
      content = content.slice(0, insertPoint) + 
                '\n  const navigate = useNavigate();' + 
                content.slice(insertPoint);
    }
    modified = true;
  }
  
  // Pattern 3: Fix duplicate error declarations
  const errorDeclarations = content.match(/const\s*\[error,\s*setError\]\s*=\s*useState/g);
  if (errorDeclarations && errorDeclarations.length > 1) {
    // Remove duplicate error declarations (keep the first one)
    let firstFound = false;
    content = content.replace(/const\s*\[error,\s*setError\]\s*=\s*useState[^;]+;/g, (match) => {
      if (!firstFound) {
        firstFound = true;
        return match;
      }
      return ''; // Remove duplicates
    });
    modified = true;
  }
  
  // Pattern 4: Fix standalone error variables that conflict
  if (content.includes('[error, setError]') && content.match(/^\s*const\s+error\s*=/gm)) {
    // Remove standalone error declarations that conflict with useState
    content = content.replace(/^\s*const\s+error\s*=\s*[^;]+;\s*$/gm, '');
    modified = true;
  }
  
  // Pattern 5: Fix 'for (const i = 0; i < quantity; i++)' syntax
  content = content.replace(/for\s*\(\s*const\s+(\w+)\s*=\s*0;\s*\1\s*<\s*([^;]+);\s*\1\+\+\s*\)/g, 
    'for (let $1 = 0; $1 < $2; $1++)');
  if (content !== content.replace(/for\s*\(\s*const\s+(\w+)\s*=\s*0;\s*\1\s*<\s*([^;]+);\s*\1\+\+\s*\)/g, 'for (let $1 = 0; $1 < $2; $1++)')) {
    modified = true;
  }
  
  // Pattern 6: Fix missing fetchPromise variable in Checkout.tsx
  if (filePath.includes('Checkout.tsx') && content.includes('Promise.race([fetchPromise, timeoutPromise])')) {
    if (!content.includes('const fetchPromise =')) {
      content = content.replace(
        /const response = await Promise\.race\(\[fetchPromise, timeoutPromise\]\)/,
        `const fetchPromise = fetch(\`\${API_BASE_URL}/orders/\${orderId}/payment\`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': \`Bearer \${token}\` }),
        },
        signal: controller.signal,
      });
      const response = await Promise.race([fetchPromise, timeoutPromise])`
      );
      modified = true;
    }
  }
  
  return { modified, content };
}

// Main execution
console.log('Starting systematic error fixes...');

const tsFiles = findTsFiles('./src');
console.log(`Found ${tsFiles.length} TypeScript files`);

let filesFixed = 0;

tsFiles.forEach(filePath => {
  try {
    const result = fixFile(filePath);
    if (result.modified) {
      fs.writeFileSync(filePath, result.content);
      filesFixed++;
      console.log(`Fixed: ${filePath}`);
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
  }
});

console.log(`\nFixed ${filesFixed} files out of ${tsFiles.length} total files`);
console.log('Systematic error fixes completed!'); 