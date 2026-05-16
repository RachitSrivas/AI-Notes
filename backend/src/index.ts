import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import notesRoutes from './routes/notes'; 

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());


app.use('/auth', authRoutes);
app.use('/notes', notesRoutes); 

app.get('/', (req, res) => {
  res.send('Peblo Notes API is running');
});

const PORT = process.env.PORT || 5000;

import sharedRoutes from './routes/shared';

app.use('/shared', sharedRoutes);

app.listen(PORT, () => {
  console.log(`Server running securely on port ${PORT}`);
});