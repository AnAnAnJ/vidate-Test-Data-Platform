const APP_PACKAGE_INFO_ENDPOINT = "https://api.joyhappier.com/internal/api/v1/app_package/info";
const REQUEST_TIMEOUT_MS = 10000;

const truthyStatusValues = new Set([
  "1",
  "true",
  "yes",
  "online",
  "on",
  "active",
  "enabled",
  "enable",
  "available",
  "listed",
  "approved",
  "pass",
  "published",
  "up",
  "在架",
  "上架",
  "已上架",
  "已发布"
]);

const falsyStatusValues = new Set([
  "0",
  "false",
  "no",
  "offline",
  "off",
  "inactive",
  "disabled",
  "disable",
  "unavailable",
  "unlisted",
  "rejected",
  "removed",
  "down",
  "下架",
  "未上架",
  "已下架",
  "未发布"
]);

function parseResponseBody(text) {
  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function isPlainObject(value) {
  return Object.prototype.toString.call(value) === "[object Object]";
}

function isStatusKey(key) {
  return /status|state|online|shelf|listed|available|enable|publish|release|close_at|架/i.test(key);
}

function collectStatusFields(value, path = "", result = []) {
  if (result.length >= 12 || value === null || value === undefined) {
    return result;
  }

  if (Array.isArray(value)) {
    value.slice(0, 5).forEach((item, index) => {
      collectStatusFields(item, `${path}[${index}]`, result);
    });
    return result;
  }

  if (!isPlainObject(value)) {
    return result;
  }

  for (const [key, child] of Object.entries(value)) {
    const nextPath = path ? `${path}.${key}` : key;

    if (isStatusKey(key) && (typeof child !== "object" || child === null)) {
      result.push({
        name: nextPath,
        value: String(child)
      });
    }

    collectStatusFields(child, nextPath, result);
  }

  return result;
}

function normalizeStatusValue(value) {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "number") {
    if (value === 1) {
      return true;
    }

    if (value === 0) {
      return false;
    }
  }

  const normalized = String(value ?? "").trim().toLowerCase();

  if (truthyStatusValues.has(normalized)) {
    return true;
  }

  if (falsyStatusValues.has(normalized)) {
    return false;
  }

  return null;
}

function resolvePackageStatus(payload) {
  const fields = collectStatusFields(payload);
  const closeAtField = fields.find((field) => /(^|\.)close_at$/i.test(field.name));

  if (closeAtField) {
    const closeAt = Number(closeAtField.value);

    if (Number.isFinite(closeAt)) {
      const isListed = closeAt === 0;

      return {
        isListed,
        statusText: isListed ? "在架" : "不在架",
        matchedField: closeAtField,
        statusFields: fields
      };
    }
  }

  for (const field of fields) {
    const status = normalizeStatusValue(field.value);

    if (status !== null) {
      return {
        isListed: status,
        statusText: status ? "在架" : "不在架",
        matchedField: field,
        statusFields: fields
      };
    }
  }

  return {
    isListed: null,
    statusText: "未识别在架状态",
    matchedField: null,
    statusFields: fields
  };
}

export async function queryIosPackageStatus(appName) {
  const url = new URL(APP_PACKAGE_INFO_ENDPOINT);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  url.searchParams.set("app_name", appName);

  try {
    const response = await fetch(url, {
      headers: {
        Accept: "application/json"
      },
      signal: controller.signal
    });
    const body = parseResponseBody(await response.text());

    if (!response.ok) {
      throw Object.assign(new Error(`包信息查询失败，HTTP ${response.status}`), {
        statusCode: 502
      });
    }

    return {
      appName,
      checkedAt: new Date().toISOString(),
      httpStatus: response.status,
      ...resolvePackageStatus(body)
    };
  } catch (error) {
    if (error.name === "AbortError") {
      throw Object.assign(new Error("包信息查询超时"), {
        statusCode: 504
      });
    }

    throw error;
  } finally {
    clearTimeout(timeout);
  }
}
