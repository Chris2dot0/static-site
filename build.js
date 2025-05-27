const fs = require('fs-extra');
const path = require('path');
const { marked } = require('marked');

// Configuration
const config = {
    contentDir: 'content',
    blogDir: 'blog',
    outputDir: 'dist',
    pagesDir: 'pages',
    blogOutputDir: 'blog',
    template: 'template.html',
    blogTemplate: 'blog-template.html'
};

// Ensure output directories exist
fs.ensureDirSync(config.outputDir);
fs.ensureDirSync(path.join(config.outputDir, config.pagesDir));
fs.ensureDirSync(path.join(config.outputDir, config.blogOutputDir));

// Read the templates
const template = fs.readFileSync(config.template, 'utf-8');
const blogTemplate = fs.readFileSync(config.blogTemplate, 'utf-8');
const headerHtml = fs.readFileSync('header.html', 'utf-8');
const footerHtml = fs.readFileSync('footer.html', 'utf-8');

// Function to convert markdown to HTML
function convertMarkdownToHtml(markdown) {
    return marked(markdown);
}

// Function to wrap content in template
function wrapInTemplate(content, title, templateContent) {
    return templateContent
        .replace('{{title}}', title)
        .replace('{{content}}', content)
        .replace('{{header}}', headerHtml)
        .replace('{{footer}}', footerHtml);
}

// Process markdown files and copy static index.html
async function build() {
    try {
        // Copy static assets
        await fs.copy('styles', path.join(config.outputDir, 'styles'));
        await fs.copy('scripts', path.join(config.outputDir, 'scripts'));

        // Process markdown files in content/ (excluding index.md and blog dir)
        const contentDir = config.contentDir;
        let files = await fs.readdir(contentDir);

        for (const file of files) {
            const filePath = path.join(contentDir, file);
            const stat = await fs.stat(filePath);
            if (stat.isFile() && path.extname(file) === '.md') {
                const markdown = await fs.readFile(filePath, 'utf-8');
                const html = convertMarkdownToHtml(markdown);
                const title = path.basename(file, '.md');
                const finalHtml = wrapInTemplate(html, title, template);

                const outputPath = file === 'index.md' 
                    ? path.join(config.outputDir, 'index.html') 
                    : path.join(config.outputDir, config.pagesDir, `${title}.html`);

                await fs.writeFile(outputPath, finalHtml);
                console.log(`Built: ${outputPath}`);
            }
        }

        // Process markdown files in content/blog/
        const blogContentDir = path.join(config.contentDir, config.blogDir);
        const blogFiles = await fs.readdir(blogContentDir);

        for (const file of blogFiles) {
             const filePath = path.join(blogContentDir, file);
             const stat = await fs.stat(filePath);
             if (stat.isFile() && path.extname(file) === '.md') {
                 const markdown = await fs.readFile(filePath, 'utf-8');
                 const html = convertMarkdownToHtml(markdown);
                 const title = path.basename(file, '.md');
                 const finalHtml = wrapInTemplate(html, title, blogTemplate);

                 const outputPath = path.join(config.outputDir, config.blogOutputDir, `${title}.html`);

                 await fs.writeFile(outputPath, finalHtml);
                 console.log(`Built: ${outputPath}`);
             }
         }

        // Generate blog index page
        const blogIndexContentDir = path.join(config.contentDir, config.blogDir);
        const blogIndexFiles = await fs.readdir(blogIndexContentDir);
        let blogListHtml = '<h1>Blog Posts</h1><ul>';
        for (const file of blogIndexFiles) {
            if (path.extname(file) === '.md') {
                const title = path.basename(file, '.md');
                const link = `/blog/${title}.html`;
                blogListHtml += `<li><a href="${link}">${title}</a></li>`;
            }
        }
        blogListHtml += '</ul>';

        const blogIndexFinalHtml = wrapInTemplate(blogListHtml, 'Blog', template);
        const blogIndexOutputPath = path.join(config.outputDir, config.blogOutputDir, 'index.html');
        await fs.writeFile(blogIndexOutputPath, blogIndexFinalHtml);
        console.log(`Built: ${blogIndexOutputPath}`);

        console.log('Build completed successfully!');
    } catch (error) {
        console.error('Build failed:', error);
    }
}

build(); 