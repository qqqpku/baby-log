import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;
const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'logs.json');

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR);
}

// Ensure data file exists
if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([]));
} else {
    // Create backup on startup
    try {
        fs.copyFileSync(DATA_FILE, path.join(DATA_DIR, 'logs.backup.json'));
        console.log('Created backup of logs.json');
    } catch (err) {
        console.error('Failed to create backup:', err);
    }
}

// Routes
app.get('/api/logs', (req, res) => {
    fs.readFile(DATA_FILE, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading logs:', err);
            return res.status(500).json({ error: 'Failed to read logs' });
        }
        try {
            const logs = data ? JSON.parse(data) : [];
            res.json(logs);
        } catch (parseErr) {
            console.error('Error parsing logs:', parseErr);
            res.json([]);
        }
    });
});

app.post('/api/logs', (req, res) => {
    const newLog = req.body;

    fs.readFile(DATA_FILE, 'utf8', (err, data) => {
        let logs = [];
        if (!err && data) {
            try {
                logs = JSON.parse(data);
            } catch (e) {
                logs = [];
            }
        }

        // Add new log to the beginning
        logs.unshift(newLog);

        fs.writeFile(DATA_FILE, JSON.stringify(logs, null, 2), (writeErr) => {
            if (writeErr) {
                console.error('Error writing logs:', writeErr);
                return res.status(500).json({ error: 'Failed to save log' });
            }
            res.json(newLog);
        });
    });
});

app.delete('/api/logs/:id', (req, res) => {
    const { id } = req.params;

    fs.readFile(DATA_FILE, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading logs:', err);
            return res.status(500).json({ error: 'Failed to read logs' });
        }

        let logs = [];
        try {
            logs = JSON.parse(data);
        } catch (e) {
            return res.status(500).json({ error: 'Failed to parse logs' });
        }

        const filteredLogs = logs.filter(log => log.id !== id);

        fs.writeFile(DATA_FILE, JSON.stringify(filteredLogs, null, 2), (writeErr) => {
            if (writeErr) {
                console.error('Error writing logs:', writeErr);
                return res.status(500).json({ error: 'Failed to delete log' });
            }
            res.json({ success: true });
        });
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
