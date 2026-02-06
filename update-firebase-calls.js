// Script untuk update otomatis (jalan sekali saja)
const fs = require('fs');
const path = require('path');

const scriptPath = path.join(__dirname, 'script.js');
let content = fs.readFileSync(scriptPath, 'utf8');

// Pattern replacements
const replacements = [
    // Pattern 1: addDoc
    {
        pattern: /await addDoc\(([^,]+),\s*([^)]+)\)/g,
        replacement: 'await safeAddDoc($1, $2, {\n        operation: "${getOperationName()}",\n        userId: currentUser?.uid\n    })'
    },
    
    // Pattern 2: updateDoc (single line)
    {
        pattern: /await updateDoc\(([^,]+),\s*([^)]+)\)/g,
        replacement: 'await safeUpdateDoc($1, $2, {\n        operation: "${getOperationName()}"\n    })'
    },
    
    // Pattern 3: deleteDoc
    {
        pattern: /await deleteDoc\(([^)]+)\)/g,
        replacement: 'await safeDeleteDoc($1, {\n        operation: "${getOperationName()}"\n    })'
    },
    
    // Pattern 4: setDoc
    {
        pattern: /await setDoc\(([^,]+),\s*([^,]+),\s*([^)]+)\)/g,
        replacement: 'await safeSetDoc($1, $2, $3, {\n        operation: "${getOperationName()}"\n    })'
    },
    
    // Pattern 5: getDocs
    {
        pattern: /await getDocs\(([^)]+)\)/g,
        replacement: 'await safeGetDocs($1, {\n        operation: "${getOperationName()}"\n    })'
    },
    
    // Pattern 6: batch.commit()
    {
        pattern: /await batch\.commit\(\)/g,
        replacement: 'await safeBatchCommit(batch, {\n        operation: "${getOperationName()}"\n    })'
    }
];

// Apply replacements
replacements.forEach(({pattern, replacement}) => {
    content = content.replace(pattern, replacement);
});

// Simpan backup
fs.writeFileSync(scriptPath + '.backup', fs.readFileSync(scriptPath));
// Update file
fs.writeFileSync(scriptPath, content);

console.log('✅ Firebase calls updated! Backup saved as script.js.backup');