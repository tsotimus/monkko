import { MongoClient, MongoClientOptions } from 'mongodb';

interface MonkoClientOptions {
  uri: string;
  mongoClientOptions?: MongoClientOptions;
}

export interface MonkoClient {
  client: MongoClient;
  connect: () => Promise<MongoClient>;
  close: () => Promise<void>;
}

export const createMonkoClient = (options: MonkoClientOptions): MonkoClient => {
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