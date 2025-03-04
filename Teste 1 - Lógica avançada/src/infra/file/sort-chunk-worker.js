const { parentPort, workerData } = require('worker_threads');
const fs = require('fs');
const readline = require('readline');

async function sortChunk(chunkPath) {
  const transactions = [];
  const readInterface = readline.createInterface({
    input: fs.createReadStream(chunkPath),
    crlfDelay: Infinity,
  });

  for await (const line of readInterface) {
    const transaction = JSON.parse(line);
    transaction.ms = new Date(transaction.timestamp).getTime();
    transactions.push(transaction);
  }

  transactions.sort((a, b) => a.ms - b.ms);

  const writeStream = fs.createWriteStream(chunkPath);
  for (const transaction of transactions) {
    writeStream.write(JSON.stringify(transaction) + '\n');
  }
  writeStream.end();

  writeStream.on('finish', () => parentPort.postMessage('Chunk sorted'));
  writeStream.on('error', (error) => parentPort.postMessage(`Error: ${error.message}`));
}

sortChunk(workerData).catch((error) =>
  parentPort.postMessage(`Error: ${error.message}`)
);