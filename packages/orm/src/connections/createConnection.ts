import { MongoClient, MongoClientOptions } from 'mongodb';

interface MonkkoClientOptions {
  uri: string;
  mongoClientOptions?: MongoClientOptions;
}

export interface MonkkoClient {
  client: MongoClient;
  connect: () => Promise<MongoClient>;
  close: () => Promise<void>;
}

export const createMonkkoClient = (options: MonkkoClientOptions): MonkkoClient => {
  const client = new MongoClient(options.uri, options.mongoClientOptions);

  return {
    client,
    connect: async () => {
      await client.connect();
      return client;
    },
    close: async () => {
      await client.close();
    },
  };
};