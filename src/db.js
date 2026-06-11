import mysql from "mysql2/promise";
import {
  config,
  getMissingDbConfigKeys,
  getMissingInviteCardConfigKeys,
  getMissingMemberEventConfigKeys,
  getMissingMongoConfigKeys,
  walletTargets
} from "./config.js";

let pool;

const sayhiCountTarget = {
  name: "Vidate sayhi count",
  database: "vidate_test",
  table: "user_sayhi_count",
  userColumn: "user_id",
  countColumn: "count",
  refreshColumn: "refresh_at",
  createdColumn: "created_at",
  updatedColumn: "updated_at",
  deletedColumn: "deleted_at"
};

const auditStatusTarget = {
  name: "Joymeet version audit status",
  database: "joymeet_test",
  table: "version",
  appNameColumn: "appname",
  auditedAtColumn: "audited_at"
};

const memberTarget = {
  name: "Joymeet member",
  database: "joymeet_test",
  table: "member",
  userColumn: "user_id",
  durationColumn: "duration",
  startAtColumn: "start_at"
};

const memberRecordTarget = {
  name: "Joymeet member record",
  database: "joymeet_test",
  table: "member_record"
};

const userConnectionTarget = {
  name: "Vidate user connection",
  database: "vidate_test",
  table: "user_connection",
  userColumn: "user_id",
  streamerColumn: "streamer_id",
  inviteCardColumn: "invite_card_count"
};

const joymeetUserTarget = {
  name: "Joymeet user",
  database: "joymeet_test",
  table: "user",
  idColumn: "id",
  uuidColumn: "uuid"
};

const datingUserTarget = {
  name: "Vidate dating user",
  database: "vidate_test",
  table: "dating_user",
  idColumn: "user_id",
  refreshColumn: "free_call_today_refresh_at"
};

const streamerPpvTarget = {
  name: "Vidate streamer ppv",
  database: "vidate_test",
  table: "streamer_ppv",
  idColumn: "id",
  userColumn: "user_id",
  statusColumn: "status"
};

const userAuthTarget = {
  name: "Vidate user auth",
  database: "vidate_test",
  table: "user_auth"
};

const vidateUserTarget = {
  name: "Vidate user",
  database: "vidate_test",
  table: "user",
  idColumn: "id",
  uuidColumn: "uuid",
  numberColumn: "number"
};

const anchorPasswordConfig = {
  appName: "vida",
  type: 800,
  password: "106158",
  secret: "$2y$10$NOmr1u9s0ELr.hkWlbNk0.LOwP/e5yLE/trPFv55aX.vxzYYPHjC.",
  timestamp: 1774349346
};

function assertIdentifier(value) {
  if (!/^[A-Za-z0-9_]+$/.test(value)) {
    throw new Error(`Unsafe SQL identifier: ${value}`);
  }

  return `\`${value}\``;
}

function tableReference(target) {
  return `${assertIdentifier(target.database)}.${assertIdentifier(target.table)}`;
}

function getPool() {
  const missingKeys = getMissingDbConfigKeys();

  if (missingKeys.length > 0) {
    throw Object.assign(new Error(`Missing database config: ${missingKeys.join(", ")}`), {
      statusCode: 500
    });
  }

  if (!pool) {
    pool = mysql.createPool({
      host: config.db.host,
      port: config.db.port,
      user: config.db.user,
      password: config.db.password,
      waitForConnections: true,
      connectionLimit: config.db.connectionLimit,
      namedPlaceholders: false
    });
  }

  return pool;
}

async function readWalletBalance(connection, target, userId) {
  const sql = [
    `SELECT ${assertIdentifier(target.userColumn)} AS userId,`,
    `${assertIdentifier(target.balanceColumn)} AS balance`,
    `FROM ${tableReference(target)}`,
    `WHERE ${assertIdentifier(target.userColumn)} = ?`,
    "LIMIT 1"
  ].join(" ");

  const [rows] = await connection.execute(sql, [userId]);
  return rows[0] ?? null;
}

async function updateWalletBalance(connection, target, userId, targetBalance) {
  const sql = [
    `UPDATE ${tableReference(target)}`,
    `SET ${assertIdentifier(target.balanceColumn)} = ?`,
    `WHERE ${assertIdentifier(target.userColumn)} = ?`
  ].join(" ");

  const [result] = await connection.execute(sql, [targetBalance, userId]);
  return result;
}

async function readSayhiCount(connection, userId) {
  const sql = [
    `SELECT ${assertIdentifier(sayhiCountTarget.userColumn)} AS userId,`,
    `${assertIdentifier(sayhiCountTarget.countColumn)} AS count`,
    `FROM ${tableReference(sayhiCountTarget)}`,
    `WHERE ${assertIdentifier(sayhiCountTarget.userColumn)} = ?`,
    "LIMIT 1"
  ].join(" ");

  const [rows] = await connection.execute(sql, [userId]);
  return rows[0] ?? null;
}

async function updateSayhiCount(connection, userId, count) {
  const sql = [
    `UPDATE ${tableReference(sayhiCountTarget)}`,
    `SET ${assertIdentifier(sayhiCountTarget.countColumn)} = ?`,
    `WHERE ${assertIdentifier(sayhiCountTarget.userColumn)} = ?`
  ].join(" ");

  const [result] = await connection.execute(sql, [count, userId]);
  return result;
}

async function insertSayhiCount(connection, userId, count) {
  const sql = [
    `INSERT INTO ${tableReference(sayhiCountTarget)}`,
    "(",
    [
      sayhiCountTarget.userColumn,
      sayhiCountTarget.countColumn,
      sayhiCountTarget.refreshColumn,
      sayhiCountTarget.createdColumn,
      sayhiCountTarget.updatedColumn,
      sayhiCountTarget.deletedColumn
    ]
      .map(assertIdentifier)
      .join(", "),
    ")",
    "VALUES (?, ?, UNIX_TIMESTAMP(), UNIX_TIMESTAMP(), UNIX_TIMESTAMP(), 0)"
  ].join(" ");

  const [result] = await connection.execute(sql, [userId, count]);
  return result;
}

async function readAuditStatus(connection, appName) {
  const sql = [
    `SELECT ${assertIdentifier(auditStatusTarget.appNameColumn)} AS appName,`,
    `${assertIdentifier(auditStatusTarget.auditedAtColumn)} AS auditedAt`,
    `FROM ${tableReference(auditStatusTarget)}`,
    `WHERE ${assertIdentifier(auditStatusTarget.appNameColumn)} = ?`,
    "LIMIT 1"
  ].join(" ");

  const [rows] = await connection.execute(sql, [appName]);
  return rows[0] ?? null;
}

async function updateAuditStatus(connection, appName, auditedAt) {
  const sql = [
    `UPDATE ${tableReference(auditStatusTarget)}`,
    `SET ${assertIdentifier(auditStatusTarget.auditedAtColumn)} = ?`,
    `WHERE ${assertIdentifier(auditStatusTarget.appNameColumn)} = ?`
  ].join(" ");

  const [result] = await connection.execute(sql, [auditedAt, appName]);
  return result;
}

async function readMember(connection, userId) {
  const sql = [
    `SELECT ${assertIdentifier(memberTarget.userColumn)} AS userId,`,
    `${assertIdentifier(memberTarget.durationColumn)} AS duration,`,
    `${assertIdentifier(memberTarget.startAtColumn)} AS startAt`,
    `FROM ${tableReference(memberTarget)}`,
    `WHERE ${assertIdentifier(memberTarget.userColumn)} = ?`,
    "LIMIT 1"
  ].join(" ");

  const [rows] = await connection.execute(sql, [userId]);
  return rows[0] ?? null;
}

async function updateMember(connection, userId, duration) {
  const sql = [
    `UPDATE ${tableReference(memberTarget)}`,
    `SET ${assertIdentifier(memberTarget.durationColumn)} = ?,`,
    `${assertIdentifier(memberTarget.startAtColumn)} = UNIX_TIMESTAMP()`,
    `WHERE ${assertIdentifier(memberTarget.userColumn)} = ?`
  ].join(" ");

  const [result] = await connection.execute(sql, [duration, userId]);
  return result;
}

async function insertMember(connection, userId, duration) {
  const sql = [
    `INSERT INTO ${tableReference(memberTarget)}`,
    "(",
    "`user_id`, `card_id`, `continuous`, `start_at`, `duration`, `created_at`, `updated_at`, `deleted_at`",
    ")",
    "VALUES (",
    "?, 0, 0, UNIX_TIMESTAMP(), ?, UNIX_TIMESTAMP(), UNIX_TIMESTAMP(), 0",
    ")"
  ].join(" ");

  const [result] = await connection.execute(sql, [userId, duration]);
  return result;
}

async function insertMemberRecord(connection, userId, duration) {
  const sql = [
    `INSERT INTO ${tableReference(memberRecordTarget)}`,
    "(",
    "`type`, `user_id`, `pay_id`, `first_start_at`, `duration`, `expired_at`,",
    "`next_cycle_at`, `status`, `certificate`, `created_at`, `updated_at`, `deleted_at`",
    ")",
    "VALUES (",
    "100, ?, 0, UNIX_TIMESTAMP(), ?, UNIX_TIMESTAMP() + ?,",
    "0, 0, '', UNIX_TIMESTAMP(), UNIX_TIMESTAMP(), 0",
    ")"
  ].join(" ");

  const [result] = await connection.execute(sql, [userId, duration, duration]);
  return result;
}

async function readUserConnection(connection, userId, streamerId) {
  const sql = [
    `SELECT ${assertIdentifier(userConnectionTarget.userColumn)} AS userId,`,
    `${assertIdentifier(userConnectionTarget.streamerColumn)} AS streamerId,`,
    `${assertIdentifier(userConnectionTarget.inviteCardColumn)} AS inviteCardCount`,
    `FROM ${tableReference(userConnectionTarget)}`,
    `WHERE ${assertIdentifier(userConnectionTarget.userColumn)} = ?`,
    `AND ${assertIdentifier(userConnectionTarget.streamerColumn)} = ?`,
    "LIMIT 1"
  ].join(" ");

  const [rows] = await connection.execute(sql, [userId, streamerId]);
  return rows[0] ?? null;
}

async function insertUserConnection(connection, userId, streamerId) {
  const sql = [
    `INSERT INTO ${tableReference(userConnectionTarget)}`,
    "(",
    "`user_id`, `streamer_id`, `streamer_type`, `invite_card_count`,",
    "`user_send_msg_count`, `user_pp_count`, `user_unlock_pp_count`, `user_unlock_pv_count`,",
    "`streamer_pp_count`, `streamer_pv_count`, `created_at`, `updated_at`, `deleted_at`",
    ")",
    "VALUES (",
    "?, ?, 'video', 10, 20, 1, 2, 0, 2, 0, UNIX_TIMESTAMP(), UNIX_TIMESTAMP(), 0",
    ")"
  ].join(" ");

  const [result] = await connection.execute(sql, [userId, streamerId]);
  return result;
}

async function updateUserConnectionInviteCard(connection, userId, streamerId) {
  const sql = [
    `UPDATE ${tableReference(userConnectionTarget)}`,
    `SET ${assertIdentifier(userConnectionTarget.inviteCardColumn)} = 20,`,
    "`updated_at` = UNIX_TIMESTAMP()",
    `WHERE ${assertIdentifier(userConnectionTarget.userColumn)} = ?`,
    `AND ${assertIdentifier(userConnectionTarget.streamerColumn)} = ?`
  ].join(" ");

  const [result] = await connection.execute(sql, [userId, streamerId]);
  return result;
}

async function readJoymeetUserUuid(connection, userId) {
  const sql = [
    `SELECT CAST(${assertIdentifier(joymeetUserTarget.uuidColumn)} AS CHAR) AS uuid`,
    `FROM ${tableReference(joymeetUserTarget)}`,
    `WHERE ${assertIdentifier(joymeetUserTarget.idColumn)} = ?`,
    "LIMIT 1"
  ].join(" ");

  const [rows] = await connection.execute(sql, [userId]);
  return rows[0]?.uuid ?? null;
}

async function readVidateUserUuid(connection, userId) {
  const sql = [
    `SELECT CAST(${assertIdentifier(vidateUserTarget.uuidColumn)} AS CHAR) AS uuid`,
    `FROM ${tableReference(vidateUserTarget)}`,
    `WHERE ${assertIdentifier(vidateUserTarget.idColumn)} = ?`,
    "LIMIT 1"
  ].join(" ");

  const [rows] = await connection.execute(sql, [userId]);
  return rows[0]?.uuid ?? null;
}

async function readFreeCallRefreshAt(connection, userId) {
  const sql = [
    `SELECT ${assertIdentifier(datingUserTarget.idColumn)} AS userId,`,
    `${assertIdentifier(datingUserTarget.refreshColumn)} AS refreshAt`,
    `FROM ${tableReference(datingUserTarget)}`,
    `WHERE ${assertIdentifier(datingUserTarget.idColumn)} = ?`,
    "LIMIT 1"
  ].join(" ");

  const [rows] = await connection.execute(sql, [userId]);
  return rows[0] ?? null;
}

async function updateFreeCallRefreshAt(connection, userId) {
  const sql = [
    `UPDATE ${tableReference(datingUserTarget)}`,
    `SET ${assertIdentifier(datingUserTarget.refreshColumn)} = UNIX_TIMESTAMP()`,
    `WHERE ${assertIdentifier(datingUserTarget.idColumn)} = ?`
  ].join(" ");

  const [result] = await connection.execute(sql, [userId]);
  return result;
}

function getStreamerPpvStatusName(status) {
  return {
    100: "待审核",
    200: "已审核",
    300: "已拒绝"
  }[status] ?? "未知";
}

async function selectStreamerPpvIdsForTarget(connection, userId, targetStatus, count) {
  const sql = [
    `SELECT ${assertIdentifier(streamerPpvTarget.idColumn)} AS id`,
    `FROM ${tableReference(streamerPpvTarget)}`,
    `WHERE ${assertIdentifier(streamerPpvTarget.userColumn)} = ?`,
    `AND ${assertIdentifier(streamerPpvTarget.statusColumn)} != ?`,
    "AND `deleted_at` = 0",
    `ORDER BY ${assertIdentifier(streamerPpvTarget.idColumn)} ASC`,
    `LIMIT ${count}`
  ].join(" ");
  const params = [userId, targetStatus];

  const [rows] = await connection.execute(sql, params);

  return {
    ids: rows.map((row) => row.id),
    sql,
    params
  };
}

async function updateStreamerPpvStatusByIds(connection, ids, targetStatus) {
  if (ids.length === 0) {
    return {
      result: {
        affectedRows: 0,
        changedRows: 0,
        info: ""
      },
      sql: "",
      params: []
    };
  }

  const placeholders = ids.map(() => "?").join(", ");
  const sql = [
    `UPDATE ${tableReference(streamerPpvTarget)}`,
    `SET ${assertIdentifier(streamerPpvTarget.statusColumn)} = ?`,
    `WHERE ${assertIdentifier(streamerPpvTarget.idColumn)} IN (${placeholders})`
  ].join(" ");
  const params = [targetStatus, ...ids];

  const [result] = await connection.execute(sql, params);

  return {
    result,
    sql,
    params
  };
}

async function insertAnchorPassword(connection, userId) {
  const sql = [
    `INSERT INTO ${tableReference(userAuthTarget)}`,
    "(",
    "`app_name`, `user_id`, `type`, `secret`, `created_at`, `updated_at`, `deleted_at`",
    ")",
    "VALUES (?, ?, ?, ?, ?, ?, 0)"
  ].join(" ");

  const [result] = await connection.execute(sql, [
    anchorPasswordConfig.appName,
    userId,
    anchorPasswordConfig.type,
    anchorPasswordConfig.secret,
    anchorPasswordConfig.timestamp,
    anchorPasswordConfig.timestamp
  ]);
  return result;
}

async function readVidateUserNumber(connection, userId) {
  const sql = [
    `SELECT CAST(${assertIdentifier(vidateUserTarget.numberColumn)} AS CHAR) AS number`,
    `FROM ${tableReference(vidateUserTarget)}`,
    `WHERE ${assertIdentifier(vidateUserTarget.idColumn)} = ?`,
    "LIMIT 1"
  ].join(" ");

  const [rows] = await connection.execute(sql, [userId]);
  return rows[0]?.number ?? null;
}

export async function setWalletBalances(userId, targetBalance) {
  const connection = await getPool().getConnection();

  try {
    await connection.beginTransaction();

    const results = [];

    for (const target of walletTargets) {
      const before = await readWalletBalance(connection, target, userId);
      const updateResult = await updateWalletBalance(connection, target, userId, targetBalance);
      const after = await readWalletBalance(connection, target, userId);

      results.push({
        name: target.name,
        target: `${target.database}.${target.table}`,
        affectedRows: updateResult.affectedRows,
        changedRows: updateResult.changedRows,
        beforeBalance: before?.balance ?? null,
        afterBalance: after?.balance ?? null
      });
    }

    await connection.commit();

    return {
      userId,
      targetBalance,
      results
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function clearWalletBalances(userId) {
  return setWalletBalances(userId, 0);
}

export async function setSayhiCount(userId, count) {
  const connection = await getPool().getConnection();

  try {
    await connection.beginTransaction();

    const before = await readSayhiCount(connection, userId);
    const writeResult = before
      ? await updateSayhiCount(connection, userId, count)
      : await insertSayhiCount(connection, userId, count);
    const after = await readSayhiCount(connection, userId);

    await connection.commit();

    return {
      userId,
      targetCount: count,
      result: {
        name: sayhiCountTarget.name,
        target: "sayhi次数",
        action: before ? "更新sayhi次数" : "新增sayhi次数",
        affectedRows: writeResult.affectedRows,
        changedRows: writeResult.changedRows ?? null,
        insertedId: writeResult.insertId ?? null,
        beforeCount: before?.count ?? null,
        afterCount: after?.count ?? null
      }
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function getVidateUserUuid(userId) {
  const connection = await getPool().getConnection();

  try {
    const uuid = await readVidateUserUuid(connection, userId);

    if (!uuid) {
      throw Object.assign(new Error("未找到用户 uuid"), {
        statusCode: 404
      });
    }

    return uuid;
  } finally {
    connection.release();
  }
}

export async function setAuditStatus(appName, auditedAt) {
  const connection = await getPool().getConnection();

  try {
    await connection.beginTransaction();

    const before = await readAuditStatus(connection, appName);
    const updateResult = await updateAuditStatus(connection, appName, auditedAt);
    const after = await readAuditStatus(connection, appName);

    await connection.commit();

    return {
      appName,
      targetAuditedAt: auditedAt,
      modeName: auditedAt === 0 ? "审核模式" : "非审核模式",
      result: {
        name: auditStatusTarget.name,
        target: `${auditStatusTarget.database}.${auditStatusTarget.table}`,
        affectedRows: updateResult.affectedRows,
        changedRows: updateResult.changedRows,
        beforeAuditedAt: before?.auditedAt ?? null,
        afterAuditedAt: after?.auditedAt ?? null
      }
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function activateMemberSubscription(userId, duration) {
  const connection = await getPool().getConnection();

  try {
    await connection.beginTransaction();

    const before = await readMember(connection, userId);
    const memberResult = before
      ? await updateMember(connection, userId, duration)
      : await insertMember(connection, userId, duration);
    const recordResult = await insertMemberRecord(connection, userId, duration);
    const after = await readMember(connection, userId);

    await connection.commit();

    return {
      userId,
      duration,
      result: {
        name: memberTarget.name,
        target: "会员订阅",
        action: before ? "更新会员主记录" : "新增会员主记录",
        affectedRows: memberResult.affectedRows,
        changedRows: memberResult.changedRows ?? null,
        insertedRows: recordResult.affectedRows,
        recordId: recordResult.insertId,
        beforeDuration: before?.duration ?? null,
        afterDuration: after?.duration ?? null,
        beforeStartAt: before?.startAt ?? null,
        afterStartAt: after?.startAt ?? null
      }
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function prepareVideoInviteCard(userId, streamerId) {
  const connection = await getPool().getConnection();

  try {
    await connection.beginTransaction();

    const before = await readUserConnection(connection, userId, streamerId);
    const connectionResult = before
      ? await updateUserConnectionInviteCard(connection, userId, streamerId)
      : await insertUserConnection(connection, userId, streamerId);
    const toUuid = await readJoymeetUserUuid(connection, userId);

    if (!toUuid) {
      throw Object.assign(new Error("未找到用户 uuid，无法下发视频邀请卡"), {
        statusCode: 404
      });
    }

    await connection.commit();

    return {
      userId,
      streamerId,
      toUuid,
      result: {
        action: before ? "更新会话" : "新增会话",
        affectedRows: connectionResult.affectedRows,
        changedRows: connectionResult.changedRows ?? null,
        insertedId: connectionResult.insertId ?? null
      }
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function refreshFreeOneMinuteCall(userId) {
  const connection = await getPool().getConnection();

  try {
    await connection.beginTransaction();

    const before = await readFreeCallRefreshAt(connection, userId);

    if (!before) {
      throw Object.assign(new Error("未找到 user_id 对应的免费一分钟记录"), {
        statusCode: 404
      });
    }

    const updateResult = await updateFreeCallRefreshAt(connection, userId);
    const after = await readFreeCallRefreshAt(connection, userId);

    await connection.commit();

    return {
      userId,
      result: {
        name: datingUserTarget.name,
        target: "免费一分钟才发",
        affectedRows: updateResult.affectedRows,
        changedRows: updateResult.changedRows,
        beforeRefreshAt: before?.refreshAt ?? null,
        afterRefreshAt: after?.refreshAt ?? null
      }
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function approveStreamerPpv(userId, targetStatus, count) {
  const connection = await getPool().getConnection();

  try {
    await connection.beginTransaction();

    const selection = await selectStreamerPpvIdsForTarget(connection, userId, targetStatus, count);
    const update = await updateStreamerPpvStatusByIds(connection, selection.ids, targetStatus);
    const updateResult = update.result;
    const successCount = Number(updateResult.changedRows ?? 0);
    const failureCount = Math.max(count - successCount, 0);
    const resultStatus = failureCount === 0 ? "成功" : "失败";
    const targetStatusName = getStreamerPpvStatusName(targetStatus);
    const failureReason =
      failureCount === 0
        ? ""
        : selection.ids.length === 0
          ? `未找到可设置为${targetStatusName}的 pp 记录`
          : `选中 ${selection.ids.length} 张，实际变更 ${successCount} 张，未达到请求数量 ${count}`;

    await connection.commit();

    return {
      userId,
      targetStatus,
      targetStatusName,
      count,
      result: {
        name: streamerPpvTarget.name,
        target: "主播pp审核",
        status: resultStatus,
        successCount,
        failureCount,
        failureReason,
        affectedRows: updateResult.affectedRows,
        changedRows: updateResult.changedRows,
        selectedIds: selection.ids,
        sqlDebug: {
          select: {
            sql: selection.sql,
            params: selection.params
          },
          update: {
            sql: update.sql,
            params: update.params
          },
          updateInfo: updateResult.info ?? ""
        }
      }
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function setAnchorPassword(userId) {
  const connection = await getPool().getConnection();

  try {
    await connection.beginTransaction();

    const insertResult = await insertAnchorPassword(connection, userId);
    const number = await readVidateUserNumber(connection, userId);

    if (!number) {
      throw Object.assign(new Error("未找到主播 number"), {
        statusCode: 404
      });
    }

    await connection.commit();

    return {
      userId,
      number,
      password: anchorPasswordConfig.password,
      result: {
        name: userAuthTarget.name,
        target: "主播账户密码",
        status: insertResult.affectedRows === 1 ? "成功" : "失败",
        affectedRows: insertResult.affectedRows,
        insertedId: insertResult.insertId
      }
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export function getPublicRuntimeConfig() {
  const missingKeys = getMissingDbConfigKeys();

  return {
    dbHost: config.db.host,
    dbPort: config.db.port,
    dbUser: config.db.user,
    configured: missingKeys.length === 0,
    missingKeys,
    sayhiQuery: {
      mongoConfigured: getMissingMongoConfigKeys().length === 0,
      missingMongoKeys: getMissingMongoConfigKeys()
    },
    memberEvent: {
      configured: getMissingMemberEventConfigKeys().length === 0,
      missingKeys: getMissingMemberEventConfigKeys()
    },
    inviteCard: {
      configured: getMissingInviteCardConfigKeys().length === 0,
      missingKeys: getMissingInviteCardConfigKeys()
    }
  };
}
