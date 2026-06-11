import express from "express";
import { fileURLToPath } from "node:url";
import path from "node:path";
import {
  activateMemberSubscription,
  approveStreamerPpv,
  clearWalletBalances,
  getPublicRuntimeConfig,
  getVidateUserUuid,
  prepareVideoInviteCard,
  refreshFreeOneMinuteCall,
  setAuditStatus,
  setAnchorPassword,
  setSayhiCount,
  setWalletBalances
} from "./db.js";
import { config } from "./config.js";
import { deleteSayhiData, getSayhiQueryInfo, querySayhiRecords } from "./mongo.js";
import { queryIosPackageStatus } from "./appPackage.js";
import { assertMemberEventConfigured, notifyMemberBecameMember } from "./memberEvent.js";
import { assertInviteCardConfigured, sendVideoInviteCard } from "./inviteCard.js";

const app = express();
const publicDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "public");

app.use(express.json({ limit: "16kb" }));
app.use(express.static(publicDir));

function normalizeUserId(value) {
  const userId = String(value ?? "").trim();

  if (!/^\d{1,18}$/.test(userId)) {
    throw Object.assign(new Error("UID 只能包含数字"), {
      statusCode: 400
    });
  }

  return userId;
}

function normalizeBalance(value) {
  const balanceText = String(value ?? "").trim();

  if (!/^\d{1,12}$/.test(balanceText)) {
    throw Object.assign(new Error("目标余额只能填写 0 到 999999999999 之间的整数"), {
      statusCode: 400
    });
  }

  return Number(balanceText);
}

function normalizePositiveCount(value) {
  const countText = String(value ?? "").trim();

  if (!/^\d{1,12}$/.test(countText) || Number(countText) <= 0) {
    throw Object.assign(new Error("sayhi次数只能填写 1 到 999999999999 之间的整数"), {
      statusCode: 400
    });
  }

  return Number(countText);
}

function normalizeDuration(value) {
  const durationText = String(value ?? "").trim();

  if (!/^\d{1,12}$/.test(durationText) || Number(durationText) <= 0) {
    throw Object.assign(new Error("时长只能填写 1 到 999999999999 秒之间的整数"), {
      statusCode: 400
    });
  }

  return Number(durationText);
}

function normalizeUuid(value) {
  const uuid = String(value ?? "").trim();

  if (!/^[A-Za-z0-9_-]{1,128}$/.test(uuid)) {
    throw Object.assign(new Error("UUID 只能包含字母、数字、下划线或中划线，长度不能超过 128"), {
      statusCode: 400
    });
  }

  return uuid;
}

function normalizeAppName(value) {
  const appName = String(value ?? "").trim();

  if (!/^[\p{L}\p{N} ._-]{1,128}$/u.test(appName)) {
    throw Object.assign(new Error("app_name 只能包含字母、数字、空格、点、下划线或中划线，长度不能超过 128"), {
      statusCode: 400
    });
  }

  return appName;
}

function normalizeAuditedAt(value) {
  const auditedAt = Number(String(value ?? "").trim());

  if (!Number.isInteger(auditedAt) || ![0, 1].includes(auditedAt)) {
    throw Object.assign(new Error("防审核状态只能选择审核模式或非审核模式"), {
      statusCode: 400
    });
  }

  return auditedAt;
}

function normalizeAuthToken(value) {
  const token = String(value ?? "").trim();

  if (token === "" || token.length > 4096) {
    throw Object.assign(new Error("主播 token 不能为空且长度不能超过 4096"), {
      statusCode: 400
    });
  }

  return token;
}

function normalizeStreamerPpvStatus(value) {
  const status = Number(String(value ?? "").trim());

  if (!Number.isInteger(status) || ![200, 300].includes(status)) {
    throw Object.assign(new Error("审核状态只能选择审核通过或审核拒绝"), {
      statusCode: 400
    });
  }

  return status;
}

function normalizeReviewCount(value) {
  const countText = String(value ?? "").trim();

  if (!/^\d{1,6}$/.test(countText) || Number(countText) <= 0) {
    throw Object.assign(new Error("审核数量只能填写 1 到 999999 之间的整数"), {
      statusCode: 400
    });
  }

  return Number(countText);
}

app.get("/api/config", (_request, response) => {
  response.json(getPublicRuntimeConfig());
});

app.get("/api/sayhi-records/query-info", (request, response, next) => {
  try {
    response.json(getSayhiQueryInfo());
  } catch (error) {
    next(error);
  }
});

app.get("/api/sayhi-records", async (request, response, next) => {
  try {
    const userId = normalizeUserId(request.query.userId ?? request.query.uid);
    const uuid = await getVidateUserUuid(userId);
    const result = await querySayhiRecords(uuid);

    response.json({
      ok: true,
      userId,
      uuid,
      ...result
    });
  } catch (error) {
    next(error);
  }
});

app.post("/api/sayhi-records/delete", async (request, response, next) => {
  try {
    if (request.body?.confirm !== true) {
      throw Object.assign(new Error("执行前必须确认删除操作"), {
        statusCode: 400
      });
    }

    const userId = normalizeUserId(request.body?.userId);
    const result = await deleteSayhiData(userId);

    response.json({
      ok: true,
      ...result
    });
  } catch (error) {
    next(error);
  }
});

app.get("/api/app-package/info", async (request, response, next) => {
  try {
    const appName = normalizeAppName(request.query.app_name ?? request.query.appName);
    const result = await queryIosPackageStatus(appName);

    response.json({
      ok: true,
      ...result
    });
  } catch (error) {
    next(error);
  }
});

app.post("/api/wallets/set-balance", async (request, response, next) => {
  try {
    if (request.body?.confirm !== true) {
      throw Object.assign(new Error("执行前必须确认更新操作"), {
        statusCode: 400
      });
    }

    const userId = normalizeUserId(request.body?.userId);
    const targetBalance = normalizeBalance(request.body?.balance);
    const result = await setWalletBalances(userId, targetBalance);

    response.json({
      ok: true,
      ...result
    });
  } catch (error) {
    next(error);
  }
});

app.post("/api/wallets/clear-balance", async (request, response, next) => {
  try {
    if (request.body?.confirm !== true) {
      throw Object.assign(new Error("执行前必须确认更新操作"), {
        statusCode: 400
      });
    }

    const userId = normalizeUserId(request.body?.userId);
    const result = await clearWalletBalances(userId);

    response.json({
      ok: true,
      ...result
    });
  } catch (error) {
    next(error);
  }
});

app.post("/api/sayhi-count/set", async (request, response, next) => {
  try {
    if (request.body?.confirm !== true) {
      throw Object.assign(new Error("执行前必须确认更新操作"), {
        statusCode: 400
      });
    }

    const userId = normalizeUserId(request.body?.userId);
    const count = normalizePositiveCount(request.body?.count);
    const result = await setSayhiCount(userId, count);

    response.json({
      ok: true,
      ...result
    });
  } catch (error) {
    next(error);
  }
});

app.post("/api/member-subscription/activate", async (request, response, next) => {
  try {
    if (request.body?.confirm !== true) {
      throw Object.assign(new Error("执行前必须确认更新操作"), {
        statusCode: 400
      });
    }

    assertMemberEventConfigured();

    const userId = normalizeUserId(request.body?.userId);
    const duration = normalizeDuration(request.body?.duration);
    const result = await activateMemberSubscription(userId, duration);
    const callback = await notifyMemberBecameMember(userId);

    response.json({
      ok: true,
      ...result,
      callback
    });
  } catch (error) {
    next(error);
  }
});

app.post("/api/video-invite-card/send", async (request, response, next) => {
  try {
    if (request.body?.confirm !== true) {
      throw Object.assign(new Error("执行前必须确认下发操作"), {
        statusCode: 400
      });
    }

    assertInviteCardConfigured();

    const userId = normalizeUserId(request.body?.userId);
    const streamerId = normalizeUserId(request.body?.streamerId);
    const streamerToken = normalizeAuthToken(request.body?.streamerToken);
    const prepared = await prepareVideoInviteCard(userId, streamerId);
    const delivery = await sendVideoInviteCard(prepared.toUuid, streamerToken);

    response.json({
      ok: true,
      userId: prepared.userId,
      streamerId: prepared.streamerId,
      result: prepared.result,
      delivery
    });
  } catch (error) {
    next(error);
  }
});

app.post("/api/free-one-minute-call/refresh", async (request, response, next) => {
  try {
    if (request.body?.confirm !== true) {
      throw Object.assign(new Error("执行前必须确认更新操作"), {
        statusCode: 400
      });
    }

    const userId = normalizeUserId(request.body?.userId);
    const result = await refreshFreeOneMinuteCall(userId);

    response.json({
      ok: true,
      ...result
    });
  } catch (error) {
    next(error);
  }
});

app.post("/api/streamer-ppv/approve", async (request, response, next) => {
  try {
    if (request.body?.confirm !== true) {
      throw Object.assign(new Error("执行前必须确认更新操作"), {
        statusCode: 400
      });
    }

    const userId = normalizeUserId(request.body?.userId);
    const status = normalizeStreamerPpvStatus(request.body?.status);
    const count = normalizeReviewCount(request.body?.count);
    const result = await approveStreamerPpv(userId, status, count);

    response.json({
      ok: true,
      ...result
    });
  } catch (error) {
    next(error);
  }
});

app.post("/api/anchor-password/set", async (request, response, next) => {
  try {
    if (request.body?.confirm !== true) {
      throw Object.assign(new Error("执行前必须确认设置操作"), {
        statusCode: 400
      });
    }

    const userId = normalizeUserId(request.body?.userId);
    const result = await setAnchorPassword(userId);

    response.json({
      ok: true,
      ...result
    });
  } catch (error) {
    next(error);
  }
});

app.post("/api/audit-status/set", async (request, response, next) => {
  try {
    if (request.body?.confirm !== true) {
      throw Object.assign(new Error("执行前必须确认更新操作"), {
        statusCode: 400
      });
    }

    const appName = normalizeAppName(request.body?.appName ?? request.body?.appname);
    const auditedAt = normalizeAuditedAt(request.body?.auditedAt);
    const result = await setAuditStatus(appName, auditedAt);

    response.json({
      ok: true,
      ...result
    });
  } catch (error) {
    next(error);
  }
});

app.use((error, _request, response, _next) => {
  const statusCode = error.statusCode ?? 500;

  response.status(statusCode).json({
    ok: false,
    error: error.message
  });
});

app.listen(config.port, () => {
  console.log(`Test data platform listening on http://localhost:${config.port}`);
});
