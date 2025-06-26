const fs = require('fs');
const path = require('path');

// Configuration
const rootDir = './frontend/src';
const extensions = ['.ts', '.tsx', '.js', '.jsx'];
let totalFilesProcessed = 0;
let totalFilesChanged = 0;

function getAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      getAllFiles(filePath, fileList);
    } else if (extensions.includes(path.extname(file))) {
      fileList.push(filePath);
    }
  }
  
  return fileList;
}

function fixCorruptedFetchCalls(content) {
  let changed = false;
  
  // Pattern 1: Fix separated fetch calls like "await fetch(url); {"
  const fetchPattern1 = /(\s*const\s+\w+\s*=\s*await\s+fetch\([^)]+\));\s*\{/g;
  if (fetchPattern1.test(content)) {
    content = content.replace(fetchPattern1, '$1, {');
    changed = true;
  }
  
  // Pattern 2: Fix fetch calls without assignment like "await fetch(url); {"
  const fetchPattern2 = /(await\s+fetch\([^)]+\));\s*\{/g;
  if (fetchPattern2.test(content)) {
    content = content.replace(fetchPattern2, '$1, {');
    changed = true;
  }
  
  // Pattern 3: Fix response assignments that were corrupted like "const }"
  const responsePattern1 = /const\s*\}/g;
  if (responsePattern1.test(content)) {
    content = content.replace(responsePattern1, 'const response = await fetch(API_BASE_URL + \'/api\', {');
    changed = true;
  }
  
  // Pattern 4: Fix incomplete variable declarations followed by timeoutPromise
  const timeoutPattern = /const\s+timeoutPromise\]\)\s*as\s*Response;/g;
  if (timeoutPattern.test(content)) {
    content = content.replace(timeoutPattern, 'const response = await Promise.race([fetchPromise, timeoutPromise]) as Response;');
    changed = true;
  }
  
  // Pattern 5: Fix Promise.race patterns
  const racePattern = /const\s+([^,\s]+)\s*,\s*timeoutPromise\]\)\s*as\s*Response;/g;
  if (racePattern.test(content)) {
    content = content.replace(racePattern, 'const response = await Promise.race([$1, timeoutPromise]) as Response;');
    changed = true;
  }
  
  // Pattern 6: Fix malformed response assignments in Promise.race
  const racePattern2 = /const\s+([^=]+)=\s*await\s+Promise\.race\(\[\s*,\s*timeoutPromise/g;
  if (racePattern2.test(content)) {
    content = content.replace(racePattern2, 'const response = await Promise.race([fetchPromise, timeoutPromise');
    changed = true;
  }
  
  // Pattern 7: Fix broken fetch calls in template literals
  const templatePattern = /fetch\(\`[^`]*\`\);\s*\{/g;
  if (templatePattern.test(content)) {
    content = content.replace(templatePattern, (match) => {
      return match.replace('); {', ', {');
    });
    changed = true;
  }
  
  return { content, changed };
}

function addMissingAPIBaseURL(content) {
  let changed = false;
  
  // Check if API_BASE_URL is used but not imported/defined
  if (content.includes('API_BASE_URL') && !content.includes('const API_BASE_URL') && !content.includes('import') && !content.includes('from')) {
    // Add API_BASE_URL constant at the top
    const apiConstant = 'const API_BASE_URL = import.meta.env.VITE_API_URL || \'http://localhost:5000/api\';\n\n';
    content = apiConstant + content;
    changed = true;
  }
  
  return { content, changed };
}

function processFile(filePath) {
  totalFilesProcessed++;
  
  try {
    let content = fs.readFileSync(filePath, 'utf-8');
    let fileChanged = false;
    
    // Fix corrupted fetch calls
    const fetchResult = fixCorruptedFetchCalls(content);
    content = fetchResult.content;
    fileChanged = fetchResult.changed || fileChanged;
    
    // Add missing API_BASE_URL if needed
    const apiResult = addMissingAPIBaseURL(content);
    content = apiResult.content;
    fileChanged = apiResult.changed || fileChanged;
    
    if (fileChanged) {
      fs.writeFileSync(filePath, content, 'utf-8');
      console.log(`✅ Fixed: ${filePath}`);
      totalFilesChanged++;
    }
    
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
}

function main() {
  console.log('🔧 Starting comprehensive syntax error fixes...\n');
  
  const files = getAllFiles(rootDir);
  
  for (const file of files) {
    processFile(file);
  }
  
  console.log(`\n📊 Processing complete!`);
  console.log(`📁 Total files processed: ${totalFilesProcessed}`);
  console.log(`✅ Files changed: ${totalFilesChanged}`);
  console.log(`📉 Success rate: ${((totalFilesChanged / totalFilesProcessed) * 100).toFixed(1)}%`);
}

main(); 