import { MongoClient } from "mongodb";
import { config, getMissingMongoConfigKeys } from "./config.js";

let client;

function getClient() {
  const missingKeys = getMissingMongoConfigKeys();

  if (missingKeys.length > 0) {
    throw Object.assign(new Error(`Missing Mongo config: ${missingKeys.join(", ")}`), {
      statusCode: 500
    });
  }

  if (!client) {
    client = new MongoClient(config.mongo.uri, {
      maxPoolSize: 4
    });
  }

  return client;
}

export function getSayhiQueryInfo(uuid = "<uuid>") {
  return {
    configured: getMissingMongoConfigKeys().length === 0,
    missingKeys: getMissingMongoConfigKeys(),
    filter: {
      from_uuid: uuid
    },
    limit: config.mongo.sayhiLimit,
    skip: config.mongo.sayhiSkip
  };
}

export async function querySayhiRecords(uuid) {
  const mongoClient = getClient();

  await mongoClient.connect();

  const database = mongoClient.db(config.mongo.database);
  const collection = database.collection(config.mongo.sayhiCollection);
  const filter = {
    from_uuid: uuid
  };
  const records = await collection
    .find(filter)
    .limit(config.mongo.sayhiLimit)
    .skip(config.mongo.sayhiSkip)
    .toArray();

  return {
    ...getSayhiQueryInfo(uuid),
    records,
    count: records.length
  };
}

export async function deleteSayhiData(userId) {
  const mongoClient = getClient();

  await mongoClient.connect();

  const numericUserId = Number(userId);
  const database = mongoClient.db(config.mongo.database);
  const filter = {
    user_id: {
      $in: [numericUserId, String(userId)]
    }
  };
  const [strategyResult, recordResult] = await Promise.all([
    database.collection(config.mongo.sayhiStrategyCollection).deleteMany(filter),
    database.collection(config.mongo.sayhiCollection).deleteMany(filter)
  ]);

  return {
    userId,
    totalDeleted: strategyResult.deletedCount + recordResult.deletedCount,
    results: [
      {
        name: "消息策略",
        deletedCount: strategyResult.deletedCount
      },
      {
        name: "sayhi记录",
        deletedCount: recordResult.deletedCount
      }
    ]
  };
}
