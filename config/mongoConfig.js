import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();                           

export const connectMongoDB = () => {
  mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  // mongoose.set('debug', true);

  const db = mongoose.connection;

  db.on('open', () => {
    console.log('MongoDB Connection Successful');
  });

  db.on('error', (error) => {
    console.error('MongoDB Connection Error:', error);
  });
};