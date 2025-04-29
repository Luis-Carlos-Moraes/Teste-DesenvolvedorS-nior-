import { MongoClient } from "mongodb";

export class DatabaseService {
    constructor(url, dbName, collectionName) {
        this.url = url;
        this.dbName = dbName;
        this.collectionName = collectionName;
        this.client = null;
        this.collection = null;
    }

    async connect() {
        this.client = new MongoClient(this.url);
        await this.client.connect();
        this.collection = this.client.db(this.dbName).collection(this.collectionName);
    }

    async createIndex() {
        await this.collection.createIndex(
            { pagador: 1, recebedor: 1, valor: 1, timestamp: 1 },
            { background: true }
        );
    }

    async close() {
        if (this.client) await this.client.close();
    }
}