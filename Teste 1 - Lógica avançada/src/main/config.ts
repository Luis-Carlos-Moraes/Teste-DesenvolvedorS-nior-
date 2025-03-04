import dotenv from 'dotenv';

dotenv.config();

export const config = {
  filePath: process.env.FILE_PATH || '',
  database: {
    user: process.env.DB_USER || '',
    host: process.env.DB_HOST || '',
    database: process.env.DB_NAME || '',
    password: process.env.DB_PASSWORD || '',
    port: parseInt(process.env.DB_PORT || '5432'),
  },
  availableMemory: parseInt(process.env.AVAILABLE_MEMORY || '1000000000'),
  chunkSize: parseInt(process.env.CHUNK_SIZE || '500000'),
  processingMode: process.env.PROCESSING_MODE || 'NODE',
  rustServiceUrl: process.env.RUST_SERVICE_URL || 'http://localhost:3000',
  batchSize: parseInt(process.env.BATCH_SIZE || '5000'),
};