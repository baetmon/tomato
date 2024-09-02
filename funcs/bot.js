import { Bot, GrammyError, HttpError, InlineKeyboard } from "grammy";

import {
  chunkArray,
  createFileWithDir,
  deleteAllFiles,
  deleteFile,
  ExtractAuthString,
  listTxtFiles,
  parseUserQuery,
  readTextFile,
} from "../lib/utils.js";

const botToken = readTextFile("bot_token.txt");

if (!botToken) {
  console.error("❌ Bot token not found. Please run bot setup.js first.");
  process.exit(1);
}


// Create an instance of the `Bot` class and pass your bot token to it.
export const bot = new Bot(botToken); // <-- put your bot token between the ""

bot.api.setMyShortDescription("Powered by @baetmon70");

bot.api.setMyDescription(
  "Hey there I'm your 🍅 bot. Contact @baetmon70 if you have any issue."
);

bot.api.setMyCommands([
  {
    command: "start",
    description: "Start the bot",
  },
  {
    command: "add",
    description: "Add new user.",
  },
  {
    command: "id",
    description: "Get your chat id",
  },
  {
    command: "help",
    description: "Get help",
  },
  {
    command: "users",
    description: "Get all users",
  },
  {
    command: "done",
    description: "Stop bot, only Admin",
  },
]);
// Handle the /start command.
bot.chatType("private").command("start", (ctx) => {
  const msg = `🍅 <b>Welcome, ${ctx.message?.from.first_name}!</b> 🍅\n\nHi ${ctx.message?.from.first_name}! I'm so glad you're here. If you need any help ask @Baetmon70. I'm here to assist you and make sure you have a great experience.\n\nLooking forward to helping you out! 🌟`;
  ctx.react("🎉");
  return ctx.reply(msg, {
    reply_parameters: { message_id: ctx.message?.message_id },
    parse_mode: "HTML",
  });
});

bot.chatType("private").command("id", (ctx) => {
  ctx.react("👀");
  return ctx.reply(`Your Chat ID is: ${ctx.message?.from.id}`);
});

bot.chatType("private").command("help", (ctx) => {
  ctx.react("👍");
  return ctx.reply("https://www.youtube.com/shorts/S0apuiFTyuI");
});

bot.chatType("private").command("users", async (ctx) => {
  const chatId = readTextFile("admin_id.txt");
  if (chatId === "") {
    ctx.react("💩");
    await ctx.reply("🚨 If  you are admin. Please run bot setup first.");
    return;
  }
  const uid = ctx.from.id;
  if (uid !== Number(chatId)) {
    ctx.react("😐");
    return ctx.reply("🚨 You are not admin.");
  }

  const currentDir = process.cwd();
  const filesPath = `${currentDir}/users`;
  const listUsers = await listTxtFiles(filesPath);

  if (listUsers.length > 0) {
    const chunkedArray = chunkArray(listUsers, 2); // Chunk array into subarrays of 2 elements each

    const buttonRows = chunkedArray.map((chunk) =>
      chunk.map((label) =>
        InlineKeyboard.text(label.split(".")[0], `user_${label}`)
      )
    );

    const keyboard = InlineKeyboard.from(buttonRows)
      .row()
      .add(InlineKeyboard.text("🚮 Delete All", "clear"));

    await ctx.reply("✅ List of 🍅 user profile.", {
      reply_markup: keyboard,
    });
    return;
  } else {
    return ctx.reply("🚨 No users found.");
  }
});

bot.chatType("private").command("add", async (ctx) => {
  const chatId = readTextFile("admin_id.txt");
  if (chatId === "") {
    ctx.react("💩");
    await ctx.reply("🚨 If  you are admin. Please run bot setup first.");
    return;
  }
  const uid = ctx.from.id;
  if (uid !== Number(chatId)) {
    ctx.react("😐");
    return ctx.reply("🚨 You are not admin.");
  }

  ctx.react("🫡");
  ctx.reply("Send me your auth string to add.");
  return;
});

bot.chatType("private").command("done", async (ctx) => {
  const chatId = readTextFile("admin_id.txt");
  if (chatId === "") {
    await ctx.reply("🚨 If  you are admin. Please run bot setup first.");
    return;
  }
  const uid = ctx.from.id;
  if (uid !== Number(chatId)) {
    return ctx.reply("🚨 You are not admin.");
  }

  bot.stop();
  process.exit(1);
});

// Wait for click events with specific callback data.
bot.callbackQuery("clear", async (ctx) => {
  await ctx.answerCallbackQuery();
  const chatId = readTextFile("admin_id.txt");
  if (chatId === "") {
    await ctx.reply("🚨 If  you are admin. Please run bot setup first.");
    return;
  }
  const uid = ctx.callbackQuery.from.id;
  if (uid !== Number(chatId)) {
    return ctx.editMessageText("🚨 You are not admin.");
  }

  const btns = new InlineKeyboard()
    .text("✅ Confirm Delete", "clear_confirm")
    .text("❌ Cancel", "clear_cancel");
  return await ctx.editMessageText(
    "⛔ Are you sure you want to delete all users?",
    {
      reply_markup: btns,
    }
  );
});

bot.callbackQuery(/^clear_(confirm|cancel)$/, async (ctx) => {
  await ctx.answerCallbackQuery();

  const chatId = readTextFile("admin_id.txt");
  if (chatId === "") {
    await ctx.reply("🚨 If  you are admin. Please run bot setup first.");
    return;
  }
  const uid = ctx.callbackQuery.from.id;
  if (uid !== Number(chatId)) {
    return ctx.editMessageText("🚨 You are not admin.");
  }

  const data = ctx.callbackQuery.data;

  if (data === "clear_confirm") {
    const currentDir = process.cwd();

    await deleteAllFiles(`${currentDir}/users`);
    await deleteAllFiles(`${currentDir}/creds`);
    return ctx.editMessageText("✅ Cleared all users.");
  } else {
    return await ctx.editMessageText("❌ Cancelled.");
  }
});

bot.callbackQuery(/^user_[0-9]{1,39}\.txt$/, async (ctx) => {
  await ctx.answerCallbackQuery();
  const data = ctx.callbackQuery.data;
  const uid = ctx.callbackQuery.from.id;
  const chatId = readTextFile("admin_id.txt");
  if (chatId === "") {
    await ctx.reply("🚨 If  you are admin. Please run bot setup first.");
    return;
  }
  if (uid !== Number(chatId)) {
    return ctx.editMessageText("🚨 You are not admin.");
  }
  const btns = new InlineKeyboard()
    .add(InlineKeyboard.text("✅ Confirm Delete", `delete_${data}`))
    .add(InlineKeyboard.text("❌ Cancel", `cancel_${data}`));

  return ctx.editMessageText(
    `⛔ Are you sure you want to delete <code>${data.split("_")[1]
    }</code> user?`,
    { parse_mode: "HTML", reply_markup: btns }
  );
});

bot.callbackQuery(/^(cancel|delete)_user_\d+\.txt$/, async (ctx) => {
  await ctx.answerCallbackQuery();

  const chatId = readTextFile("admin_id.txt");
  if (chatId === "") {
    await ctx.reply("🚨 If  you are admin. Please run bot setup first.");
    return;
  }
  const uid = ctx.callbackQuery.from.id;
  if (uid !== Number(chatId)) {
    return ctx.editMessageText("🚨 You are not admin.");
  }

  const data = ctx.callbackQuery.data;

  if (data.startsWith("delete")) {
    const [_action, _user, file] = data.split("_");
    const currentDir = process.cwd();
    await deleteFile(`${currentDir}/users`, file);
    await deleteFile(`${currentDir}/creds`, file.split(".")[0] + ".bin");
    return ctx.editMessageText(`✅ Deleted <code>${file}</code> user.`, {
      parse_mode: "HTML",
    });
  } else {
    return await ctx.editMessageText("❌ Cancelled.");
  }
});

bot.on("callback_query:data", async (ctx) => {
  console.log("Unknown button event with payload", ctx.callbackQuery.data);
  await ctx.answerCallbackQuery(); // remove loading animation
});

// Handle other messages.
bot.chatType("private").on(":text", async (ctx) => {
  const chatId = readTextFile("admin_id.txt");
  if (chatId === "") {
    await ctx.reply("🚨 If  you are admin. Please run bot setup first.");
    return;
  }
  const uid = ctx.from.id;
  const text = ctx.message?.text;
  if (uid !== Number(chatId)) {
    return ctx.reply("🚨 You are not admin.");
  }
  const extractAuth = ExtractAuthString(text);

  if (!extractAuth) {
    return ctx.reply("🚨 Sorry, I didn't get that.");
  }

  const getParams = parseUserQuery(extractAuth);
  if (!getParams) {
    return ctx.reply("🚨 Invalid auth string.");
  }
  const done = await createFileWithDir(
    "users",
    `${getParams.id}.txt`,
    extractAuth
  );

  if (!done) {
    ctx.reply("🚨 Unable to create file.");
  }

  return ctx.reply(
    `✅ New user added send /done to stop.\n\n<code>${extractAuth}</code>`,
    {
      parse_mode: "HTML",
    }
  );
});

await bot.api.deleteWebhook();

bot.catch((err) => {
  const ctx = err?.ctx;
  console.warn(`Error while handling update ${ctx?.update?.update_id}:`);
  const e = err?.error;
  if (e instanceof GrammyError) {
    console.warn("Error in request:", e.description);
  } else if (e instanceof HttpError) {
    console.warn("Could not contact Telegram:", e);
  } else {
    console.warn("Unknown error:", e);
  }
});
