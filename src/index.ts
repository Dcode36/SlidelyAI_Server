import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import fs from 'fs';

const app = express();
const port = 3000;
const dbFilePath = './src/db.json';

app.use(bodyParser.json());

interface Submission {
    name: string;
    email: string;
    phone: string;
    github_link: string;
    stopwatch_time: string;
}

// Function to read submissions from the database file
const readDatabase = (): Submission[] => {
    try {
        if (!fs.existsSync(dbFilePath)) {
            return [];
        }

        const data = fs.readFileSync(dbFilePath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        console.error(`Error reading database: ${error}`);
        return [];
    }
};

// Function to write submissions to the database file
const writeDatabase = (submissions: Submission[]): void => {
    fs.writeFileSync(dbFilePath, JSON.stringify(submissions, null, 2));
};

// Endpoint to handle submission creation
app.post('/submit', (req: Request, res: Response) => {
    try {
        const { name, email, phone, github_link, stopwatch_time } = req.body as Submission;

        let submissions = readDatabase();

        submissions.push({ name, email, phone, github_link, stopwatch_time });

        writeDatabase(submissions);

        res.status(200).json({ success: true });
    } catch (error) {
        console.error(`Error processing submission: ${error}`);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Endpoint to handle submission retrieval by index
app.get('/read', (req: Request, res: Response) => {
    const index = parseInt(req.query.index as string, 10);

    try {
        let submissions = readDatabase();

        if (index >= 0 && index < submissions.length) {
            res.json(submissions[index]);
        } else {
            res.status(404).json({ message: 'Submission not found' });
        }
    } catch (error) {
        console.error(`Error reading submissions: ${error}`);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Endpoint for health check
app.get('/ping', (req: Request, res: Response) => {
    res.send(true);
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
