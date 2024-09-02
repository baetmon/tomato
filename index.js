import chalk from "chalk";
import inquirer from "inquirer";
import chalkAnimation from "chalk-animation";
import { sleep } from "./lib/utils.js";
import { bot } from "./funcs/bot.js";
import { gameAll } from "./funcs/game.js";
import { askBotToken } from "./botSetup.js"


async function welcome() {
  const rainbowTitle = chalkAnimation.rainbow("🍅 Tomarket Airdrop \n");

  await sleep();
  rainbowTitle.stop();

  console.log(`
    ${chalk.bgBlue("HOW TO USE")} 
    Set up your Telegram 🤖 Bot.
    Add new 🆕 user.
    Play game 🎟️...

  `);
}



async function Step1() {
  const answers = await inquirer.prompt({
    name: "step1",
    type: "list",
    // @ts-ignore
    message: "🤔 What would you like to do?\n",
    choices: ["🎟️  Play Game", "🤖 Set up bot", "🆕 Add user"],
  });
  if (answers.step1 === "🤖 Set up bot") {
    await askBotToken();
  } else if (answers.step1 === "🆕 Add user") {
    console.info("Open your Telegram bot send send auth string to add...");
    bot.start({
      drop_pending_updates: true,
      allowed_updates: ["message", "callback_query"],
    });
  } else if (answers.step1 === "🎟️  Play Game") {
    await gameAll();
  } else {
    console.error("❌ Invalid selection");
    process.exit(1);
  }
}

// Run it with top-level await
console.clear();
await welcome();
//await askBotToken();
await Step1();
