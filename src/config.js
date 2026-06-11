import dotenv from "dotenv";

dotenv.config();

function readPositiveInteger(name, fallback) {
  const rawValue = process.env[name] ?? String(fallback);
  const value = Number(rawValue);

  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`${name} must be a positive integer`);
  }

  return value;
}

function readNonNegativeInteger(name, fallback) {
  const rawValue = process.env[name] ?? String(fallback);
  const value = Number(rawValue);

  if (!Number.isInteger(value) || value < 0) {
    throw new Error(`${name} must be a non-negative integer`);
  }

  return value;
}

export const config = {
  port: readPositiveInteger("PORT", 3000),
  db: {
    host: process.env.DB_HOST ?? "10.10.12.20",
    port: readPositiveInteger("DB_PORT", 3306),
    user: process.env.DB_USER ?? "root",
    password: process.env.DB_PASSWORD,
    connectionLimit: readPositiveInteger("DB_CONNECTION_LIMIT", 4)
  },
  mongo: {
    uri: process.env.MONGO_URI,
    database: process.env.MONGO_DB_NAME,
    sayhiCollection: process.env.MONGO_SAYHI_COLLECTION ?? "user_sayhi_record",
    sayhiStrategyCollection: process.env.MONGO_SAYHI_STRATEGY_COLLECTION ?? "user_message_strategy",
    sayhiLimit: readPositiveInteger("SAYHI_QUERY_LIMIT", 50),
    sayhiSkip: readNonNegativeInteger("SAYHI_QUERY_SKIP", 0)
  },
  memberEvent: {
    url: process.env.MEMBER_EVENT_URL ?? "https://test-api.vidatee.com/vidate/callback/eventhub/event",
    authToken: process.env.MEMBER_EVENT_AUTH_TOKEN,
    timeoutMs: readPositiveInteger("MEMBER_EVENT_TIMEOUT_MS", 10000)
  },
  inviteCard: {
    url: process.env.INVITE_CARD_URL ?? "https://test-api.vidatee.com/vidate/streamer/v1/conversation/invite_card/send",
    authToken: process.env.INVITE_CARD_AUTH_TOKEN,
    clientId: process.env.INVITE_CARD_CLIENT_ID ?? "dev_a4972fc116bc84376ce4f2ecb1f48337",
    timeoutMs: readPositiveInteger("INVITE_CARD_TIMEOUT_MS", 10000)
  }
};

export const walletTargets = [
  {
    name: "Vidate coin wallet",
    database: "vidate_test",
    table: "coin_wallet",
    userColumn: "user_id",
    balanceColumn: "balance"
  },
  {
    name: "Joymeet wallet",
    database: "joymeet_test",
    table: "wallet",
    userColumn: "user_id",
    balanceColumn: "balance"
  }
];

export function getMissingDbConfigKeys() {
  return [
    ["DB_HOST", config.db.host],
    ["DB_PORT", config.db.port],
    ["DB_USER", config.db.user],
    ["DB_PASSWORD", config.db.password]
  ]
    .filter(([, value]) => value === undefined || value === "")
    .map(([key]) => key);
}

export function getMissingMongoConfigKeys() {
  return [
    ["MONGO_URI", config.mongo.uri],
    ["MONGO_DB_NAME", config.mongo.database]
  ]
    .filter(([, value]) => value === undefined || value === "")
    .map(([key]) => key);
}

export function getMissingMemberEventConfigKeys() {
  return [
    ["MEMBER_EVENT_URL", config.memberEvent.url],
    ["MEMBER_EVENT_AUTH_TOKEN", config.memberEvent.authToken]
  ]
    .filter(([, value]) => value === undefined || value === "")
    .map(([key]) => key);
}

export function getMissingInviteCardConfigKeys() {
  return [
    ["INVITE_CARD_URL", config.inviteCard.url],
    ["INVITE_CARD_CLIENT_ID", config.inviteCard.clientId]
  ]
    .filter(([, value]) => value === undefined || value === "")
    .map(([key]) => key);
}
