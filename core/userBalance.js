import { HEADERS } from "../lib/config.js";

export async function UserBalance(refreshToken) {
  try {
    const url = "https://api-web.tomarket.ai/tomarket-game/v1/user/balance";

    const options = {
      method: "POST",
      headers: {
        ...HEADERS.headers,
        authorization: refreshToken,
        "cache-control": "no-cache",
        "user-agent": "",
        "Content-Type": "application/json",
      },
    };

    const response = await fetch(url, options);
    if (!response.ok) {
      console.warn(
        `[ERROR] TaskClaim: ${response.status} ${response.statusText}`
      );
      return null;
    }
    const responseData = await response.json();
    return responseData;
  } catch (_e) {
    console.error(_e);
    return null;
  }
}
