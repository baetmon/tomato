import { HEADERS } from "../lib/config.js";

export async function GameClaim(refreshToken, points) {
  try {
    const url = "https://api-web.tomarket.ai/tomarket-game/v1/game/claim";
    const payload = JSON.stringify({
      game_id: "59bcd12e-04e2-404c-a172-311a0084587d",
      points: points,
    });
    const options = {
      method: "POST",
      headers: {
        ...HEADERS.headers,
        authorization: refreshToken,
        "cache-control": "no-cache",
        "user-agent":
          "Mozilla/5.0 (Linux; Android 14; K) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/127.0.6533.103 Mobile Safari/537.36",
        "Content-Type": "application/json",
        "content-length": payload.length.toString(),
      },
      body: payload,
    };

    const response = await fetch(url, options);
    if (!response.ok) {
      console.warn(
        `[ERROR] GameClaim: ${response.status} ${response.statusText}`
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
