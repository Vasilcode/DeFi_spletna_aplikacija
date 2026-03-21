import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';

dotenv.config();

const app = express();
const port = Number(process.env.PORT) || 3001;
const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173';

app.use(cors({ origin: corsOrigin }));
app.use(express.json());

app.get('/api/health', (_req, res) => {
	res.status(200).json({
		status: 'ok',
		service: 'backend',
	});
});

app.listen(port, () => {
	console.log(`Backend listening on http://localhost:${port}`);
});
