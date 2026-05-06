const fs = require('fs');
const path = require('path');

const wwwDir = path.join(__dirname, 'www');
const pagesDir = path.join(wwwDir, 'pages');

if (!fs.existsSync(pagesDir)) {
    fs.mkdirSync(pagesDir);
}

const htmlFiles = fs.readdirSync(wwwDir).filter(file => file.endsWith('.html') && file !== 'index.html');

for (const file of htmlFiles) {
    const oldPath = path.join(wwwDir, file);
    const newPath = path.join(pagesDir, file);
    fs.renameSync(oldPath, newPath);
}

// Now update all links in all HTML files
const updateLinks = (filePath, isRoot) => {
    let content = fs.readFileSync(filePath, 'utf-8');
    
    if (isRoot) {
        // index.html needs to point to pages/ for other html files
        htmlFiles.forEach(hf => {
            content = content.replace(new RegExp(`href=["']${hf}["']`, 'g'), `href="pages/${hf}"`);
            content = content.replace(new RegExp(`href=["']\\./${hf}["']`, 'g'), `href="pages/${hf}"`);
            content = content.replace(new RegExp(`window\\.location\\.href\\s*=\\s*["']${hf}["']`, 'g'), `window.location.href = "pages/${hf}"`);
        });
    } else {
        // pages/*.html needs to point to ../ for css, js, images, and ../index.html
        content = content.replace(/href="css\//g, 'href="../css/');
        content = content.replace(/src="js\//g, 'src="../js/');
        content = content.replace(/src="images\//g, 'src="../images/');
        content = content.replace(/href="manifest\.json"/g, 'href="../manifest.json"');
        content = content.replace(/href="index\.html"/g, 'href="../index.html"');
        content = content.replace(/window\.location\.href\s*=\s*["']index\.html["']/g, 'window.location.href = "../index.html"');
    }
    
    fs.writeFileSync(filePath, content);
};

updateLinks(path.join(wwwDir, 'index.html'), true);
htmlFiles.forEach(file => updateLinks(path.join(pagesDir, file), false));

// Also need to update JS files that redirect
const jsDir = path.join(wwwDir, 'js');
const jsFiles = fs.readdirSync(jsDir).filter(file => file.endsWith('.js'));
for (const file of jsFiles) {
    const filePath = path.join(jsDir, file);
    let content = fs.readFileSync(filePath, 'utf-8');
    htmlFiles.forEach(hf => {
        content = content.replace(new RegExp(`window\\.location\\.href\\s*=\\s*["']${hf}["']`, 'g'), `window.location.href = "${hf}"`);
        content = content.replace(new RegExp(`window\\.location\\.href\\s*=\\s*["']\\.\\/${hf}["']`, 'g'), `window.location.href = "${hf}"`);
    });
    content = content.replace(/window\.location\.href\s*=\s*["']index\.html["']/g, 'window.location.href = "../index.html"');
    fs.writeFileSync(filePath, content);
}
