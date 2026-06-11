import { config, getMissingMemberEventConfigKeys } from "./config.js";

export function assertMemberEventConfigured() {
  const missingKeys = getMissingMemberEventConfigKeys();

  if (missingKeys.length > 0) {
    throw Object.assign(new Error(`Missing member event config: ${missingKeys.join(", ")}`), {
      statusCode: 500
    });
  }
}

export async function notifyMemberBecameMember(userId) {
  assertMemberEventConfigured();

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), config.memberEvent.timeoutMs);

  try {
    const response = await fetch(config.memberEvent.url, {
      method: "POST",
      headers: {
        "Z-User-Agent": "Vida/1.0.0 Android/15 (SM-F711U)",
        "Z-App-Info": "",
        "Z-Client-Id": "",
        "Z-Lon": "0",
        "Z-Lat": "0",
        "Z-Timezone": "",
        "Z-Language": "en-us",
        "Z-Auth-Token": config.memberEvent.authToken,
        "User-Agent": "",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        event_type: "member.become_member",
        payload: {
          user_id: String(userId)
        }
      }),
      signal: controller.signal
    });
    const responseText = await response.text();

    if (!response.ok) {
      throw Object.assign(new Error(`会员事件回调失败，HTTP ${response.status}`), {
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
      throw Object.assign(new Error("会员事件回调超时"), {
        statusCode: 504
      });
    }

    throw error;
  } finally {
    clearTimeout(timeout);
  }
}
