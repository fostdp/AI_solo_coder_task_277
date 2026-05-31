const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const DATA_DIR = path.join(__dirname, 'data');

if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR);
}

app.get('/api/ecosystems', (req, res) => {
    try {
        const files = fs.readdirSync(DATA_DIR);
        const ecosystems = files.map(file => {
            const content = fs.readFileSync(path.join(DATA_DIR, file), 'utf8');
            return JSON.parse(content);
        });
        res.json(ecosystems);
    } catch (error) {
        res.status(500).json({ error: 'Failed to load ecosystems' });
    }
});

app.get('/api/ecosystems/:id', (req, res) => {
    try {
        const filePath = path.join(DATA_DIR, `${req.params.id}.json`);
        if (fs.existsSync(filePath)) {
            const content = fs.readFileSync(filePath, 'utf8');
            res.json(JSON.parse(content));
        } else {
            res.status(404).json({ error: 'Ecosystem not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to load ecosystem' });
    }
});

app.post('/api/ecosystems', (req, res) => {
    try {
        const ecosystem = req.body;
        ecosystem.id = Date.now().toString();
        ecosystem.createdAt = new Date().toISOString();
        const filePath = path.join(DATA_DIR, `${ecosystem.id}.json`);
        fs.writeFileSync(filePath, JSON.stringify(ecosystem, null, 2));
        res.json(ecosystem);
    } catch (error) {
        res.status(500).json({ error: 'Failed to save ecosystem' });
    }
});

app.put('/api/ecosystems/:id', (req, res) => {
    try {
        const filePath = path.join(DATA_DIR, `${req.params.id}.json`);
        if (fs.existsSync(filePath)) {
            const ecosystem = { ...req.body, updatedAt: new Date().toISOString() };
            fs.writeFileSync(filePath, JSON.stringify(ecosystem, null, 2));
            res.json(ecosystem);
        } else {
            res.status(404).json({ error: 'Ecosystem not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to update ecosystem' });
    }
});

app.delete('/api/ecosystems/:id', (req, res) => {
    try {
        const filePath = path.join(DATA_DIR, `${req.params.id}.json`);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            res.json({ success: true });
        } else {
            res.status(404).json({ error: 'Ecosystem not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete ecosystem' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
