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

// Serve other HTML files
app.get('/:page', (req, res) => {
    const page = req.params.page;
    res.sendFile(path.join(__dirname, 'dist', `${page}.html`));
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
}); 