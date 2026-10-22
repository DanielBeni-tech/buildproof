import express from 'express';
import { initSchema } from './repository/index';
import requirementsRouter from './routes/requirements';
import scenariosRouter from './routes/scenarios';
import runsRouter from './routes/runs';
import reportRouter from './routes/report';
import executeRouter from './routes/execute';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

initSchema();

app.use('/api', requirementsRouter);
app.use('/api', scenariosRouter);
app.use('/api', runsRouter);
app.use('/api', reportRouter);
app.use('/api', executeRouter);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'buildproof' });
});

app.listen(PORT, () => {
  console.log(`BuildProof API listening on http://localhost:${PORT}`);
});

export default app;