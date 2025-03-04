import fs from 'fs';
import path from 'path';
import { chain } from 'stream-chain';
import { parser } from 'stream-json';
import { streamArray } from 'stream-json/streamers/StreamArray';

export async function splitIntoChunks(filePath: string, chunkSize: number): Promise<string[]> {
  const chunks: string[] = [];
  let chunkIndex = 0;
  let transactionCount = 0;
  let writeStream: fs.WriteStream | null = null;

  const pipeline = chain([
    fs.createReadStream(filePath),
    parser(),
    streamArray(),
  ]);

  for await (const { value } of pipeline) {
    if (transactionCount === 0) {
      const chunkPath = path.join(__dirname, `chunk_${chunkIndex}.jsonl`);
      writeStream = fs.createWriteStream(chunkPath);
      chunks.push(chunkPath);
    }

    writeStream!.write(JSON.stringify(value) + '\n');
    transactionCount++;

    if (transactionCount >= chunkSize) {
      writeStream!.end();
      transactionCount = 0;
      chunkIndex++;
    }
  }

  if (writeStream && !writeStream.writableEnded) {
    writeStream.end();
  }

  return chunks;
}