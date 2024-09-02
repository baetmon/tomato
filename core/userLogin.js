import { HEADERS } from "../lib/config.js";

export async function UserLogin(query) {
  try {
    const params = new URLSearchParams();
    params.append("init_data", query);
    const url = `https://api-web.tomarket.ai/tomarket-game/v1/user/login?${params.toString()}`;

    const options = {
      method: "POST",
      headers: {
        ...HEADERS.headers,
        "cache-control": "no-cache",
        "user-agent":
          "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36",
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
