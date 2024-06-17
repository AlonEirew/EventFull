const express = require('express');
const path = require('path');
const fs = require('fs/promises');
const app = express();
const port = 3000;

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/api/content/:fileName', async (req, res) => {
    try {
        // Replace 'source.html' with your actual file path
        const fileName = req.params.fileName;
        const instFile = path.join(__dirname, 'public/instructions', fileName);
        const fileContent = await fs.readFile(instFile, 'utf-8');
        res.send(fileContent);
    } catch (error) {
        console.error('Failed to read the HTML file:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});