const fs = require('fs');
const path = require('path');
const glob = require('glob'); // You might need to install glob if not present, or use recursive readdir

const srcDir = path.join(__dirname, '../src');

// Keywords that suggest a database query
const QUERY_METHODS = [
  'findAll',
  'findOne',
  'findAndCountAll',
  'count',
  'sum',
  'findByPk' // This one is tricky, usually needs explicit check if not just by ID
];

// Files to exclude (e.g., TenancyService itself, Auth, etc.)
const EXCLUDES = [
  'TenancyService.js',
  'AuthService.js',
  'auth.js', // middleware
  'init-db.js',
  'ensure-db-init.js'
];

function getAllFiles(dirPath, arrayOfFiles) {
  files = fs.readdirSync(dirPath);

  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function(file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
    } else {
      if (file.endsWith('.js')) {
        arrayOfFiles.push(path.join(dirPath, file));
      }
    }
  });

  return arrayOfFiles;
}

function checkFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const filename = path.basename(filePath);
  
  if (EXCLUDES.includes(filename)) return [];

  const lines = content.split('\n');
  const issues = [];

  lines.forEach((line, index) => {
    const lineNum = index + 1;
    
    // Check for query methods
    const hasQuery = QUERY_METHODS.some(method => line.includes(`.${method}(`));
    
    if (hasQuery) {
      // It's a query. Now check if it has tenancy protection.
      // 1. Uses TenancyService
      const usesTenancyService = line.includes('TenancyService.addTenancyFilter') || 
                                 content.includes('TenancyService.findWithTenancy'); // content check is broad, but line check is specific
      
      // 2. Explicit businessId filter (simple string check)
      const hasBusinessId = line.includes('businessId') || 
                            (lines[index+1] && lines[index+1].includes('businessId')) || // Check next few lines for context
                            (lines[index+2] && lines[index+2].includes('businessId'));

      // 3. Check if it's a "findByPk" which might be valid without businessId if checked later, 
      // but strictly speaking should be validated.
      
      // If it looks like a query but no tenancy context is found nearby
      if (!usesTenancyService && !hasBusinessId) {
        // Filter out common false positives or system queries
        if (!line.includes('User.findOne') && // Auth often looks up by email
            !line.includes('where: { id:')) { // Simple ID lookups might be okay if validated later, but flagging for review
             
             // We'll flag it as a warning/potential issue
             issues.push({
               line: lineNum,
               content: line.trim()
             });
        }
      }
    }
  });

  return issues;
}

function run() {
  const files = getAllFiles(srcDir);
  let totalIssues = 0;

  console.log('Scanning for potentially unsafe database queries...');

  files.forEach(file => {
    const issues = checkFile(file);
    if (issues.length > 0) {
      console.log(`\n📄 ${path.relative(srcDir, file)}`);
      issues.forEach(issue => {
        console.log(`  ⚠️  Line ${issue.line}: ${issue.content}`);
      });
      totalIssues += issues.length;
    }
  });

  console.log(`\nScan complete. Found ${totalIssues} potential issues to review.`);
  console.log('Note: This is a static heuristic scan. Some flagged items may be valid (e.g., system queries).');
}

run();
