

export async function getMe(botToken) {
  try {
    const options = { method: "GET" };

    const response = await fetch(
      `http://api.telegram.org/bot${botToken}/getMe`,
      options
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data;
  } catch (_error) {
    return null;
  }
}
export async function getChat(
  botToken,
  chatId
) {
  try {
    const options = { method: "GET" };

    const response = await fetch(
      `http://api.telegram.org/bot${botToken}/getChat?chat_id=${chatId}`,
      options
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data;
  } catch (_error) {
    return null;
  }
}
