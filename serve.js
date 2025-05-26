const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

// Serve static files from the dist directory
app.use(express.static('dist'));

// Serve index.html for the root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Serve pages from the /pages directory
app.get('/pages/:page', (req, res) => {
    const page = req.params.page;
    res.sendFile(path.join(__dirname, 'dist', 'pages', `${page}.html`));
});

// Serve blog posts from the /blog directory
app.get('/blog/:post', (req, res) => {
    const post = req.params.post;
    res.sendFile(path.join(__dirname, 'dist', 'blog', `${post}.html`));
});

// Serve other static files (like styles and scripts copied to dist)
app.use(express.static('dist'));

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
}); 