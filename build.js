const fs = require('fs-extra');
const path = require('path');
const { marked } = require('marked');

// Configuration
const config = {
    contentDir: 'content',
    outputDir: 'dist',
    pagesDir: 'pages',
    template: 'template.html'
};

// Ensure output directories exist
fs.ensureDirSync(config.outputDir);
fs.ensureDirSync(path.join(config.outputDir, config.pagesDir));

// Read the template
const template = fs.readFileSync(config.template, 'utf-8');

// Function to convert markdown to HTML
function convertMarkdownToHtml(markdown) {
    return marked(markdown);
}

// Function to wrap content in template
function wrapInTemplate(content, title) {
    return template
        .replace('{{title}}', title)
        .replace('{{content}}', content);
}

// Process all markdown files and copy static index.html
async function build() {
    try {
        // Copy static assets
        await fs.copy('styles', path.join(config.outputDir, 'styles'));
        await fs.copy('scripts', path.join(config.outputDir, 'scripts'));
        
        // Copy the static index.html
        await fs.copy('index.html', path.join(config.outputDir, 'index.html'));

        // Process markdown files (excluding index.md)
        const contentDir = config.contentDir;
        const files = await fs.readdir(contentDir);

        for (const file of files) {
            if (path.extname(file) === '.md' && file !== 'index.md') {
                const markdown = await fs.readFile(path.join(contentDir, file), 'utf-8');
                const html = convertMarkdownToHtml(markdown);
                const title = path.basename(file, '.md');
                const finalHtml = wrapInTemplate(html, title);

                const outputPath = path.join(config.outputDir, config.pagesDir, `${title}.html`);
                
                await fs.writeFile(outputPath, finalHtml);
                console.log(`Built: ${outputPath}`);
            }
        }

        console.log('Build completed successfully!');
    } catch (error) {
        console.error('Build failed:', error);
    }
}

build(); 