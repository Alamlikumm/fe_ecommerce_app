const fs = require('fs');
const path = require('path');

function processDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDir(fullPath);
        } else if (fullPath.match(/\.(tsx|ts|jsx|js)$/)) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let modified = false;
            
            // Replace "http://localhost:8000/api..."
            if (content.includes('"http://localhost:8000/api')) {
                content = content.replace(/"http:\/\/localhost:8000\/api([^"]*)"/g, '`${process.env.NEXT_PUBLIC_API_URL}$1`');
                modified = true;
            }
            // Replace `http://localhost:8000/api...`
            if (content.includes('`http://localhost:8000/api')) {
                content = content.replace(/`http:\/\/localhost:8000\/api/g, '`${process.env.NEXT_PUBLIC_API_URL}');
                modified = true;
            }
            // Replace `http://localhost:8000...`
            if (content.includes('`http://localhost:8000')) {
                content = content.replace(/`http:\/\/localhost:8000/g, '`${process.env.NEXT_PUBLIC_BACKEND_URL}');
                modified = true;
            }
            // Replace "http://localhost:8000"
            if (content.includes('"http://localhost:8000"')) {
                content = content.replace(/"http:\/\/localhost:8000"/g, 'process.env.NEXT_PUBLIC_BACKEND_URL');
                modified = true;
            }

            if (modified) {
                fs.writeFileSync(fullPath, content);
                console.log('Updated: ' + fullPath);
            }
        }
    }
}

processDir(path.join(__dirname, 'src'));
