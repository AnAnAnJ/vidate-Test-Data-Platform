import { config, getMissingInviteCardConfigKeys } from "./config.js";

export function assertInviteCardConfigured() {
  const missingKeys = getMissingInviteCardConfigKeys();

  if (missingKeys.length > 0) {
    throw Object.assign(new Error(`Missing invite card config: ${missingKeys.join(", ")}`), {
      statusCode: 500
    });
  }
}

export async function sendVideoInviteCard(toUuid, authToken) {
  assertInviteCardConfigured();

  const token = String(authToken ?? "").trim();

  if (token === "") {
    throw Object.assign(new Error("缺少主播 token，无法下发视频邀请卡"), {
      statusCode: 400
    });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), config.inviteCard.timeoutMs);

  try {
    const response = await fetch(config.inviteCard.url, {
      method: "POST",
      headers: {
        "Z-User-Agent": "Vida/1.0.0 Android/15 (SM-F711U)",
        "Z-App-Info": "",
        "Z-Client-Id": config.inviteCard.clientId,
        "Z-Lon": "0",
        "Z-Lat": "0",
        "Z-Timezone": "",
        "Z-Language": "en-us",
        "Z-Auth-Token": token,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        to_uuid: String(toUuid)
      }),
      signal: controller.signal
    });
    const responseText = await response.text();

    if (!response.ok) {
      const details = responseText.trim() ? `：${responseText.slice(0, 300)}` : "";

      throw Object.assign(new Error(`视频邀请卡下发失败，HTTP ${response.status}${details}`), {
        statusCode: 502
      });
    }

    return {
      ok: true,
      httpStatus: response.status,
      responseText: responseText.slice(0, 300)
    };
  } catch (error) {
    if (error.name === "AbortError") {
      throw Object.assign(new Error("视频邀请卡下发超时"), {
        statusCode: 504
      });
    }

    throw error;
  } finally {
    clearTimeout(timeout);
  }
}
