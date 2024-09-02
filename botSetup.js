
import inquirer from "inquirer";
import { getChat, getMe } from "./lib/tg.js";
import { createTextFile } from "./lib/utils.js";

export async function askBotToken() {
    let botToken = "";
    let chatId = "";
    const answers1 = await inquirer.prompt({
        name: "botToken",
        type: "input",
        // @ts-ignore
        message: "Enter your telegram bot token (type cancel to exit):",
        default() {
            return "";
        },
    });
    if (answers1.botToken === "cancel") {
        console.info("❌ Canceled");
        process.exit(1);
    }
    const isValidToken = await getMe(answers1.botToken);
    if (isValidToken !== null && isValidToken.ok) {
        botToken = answers1.botToken;
        console.info(
            `✅ Bot token is valid\n\nName: ${isValidToken.result.first_name}\nID: ${isValidToken.result.id}\nLink: https://t.me/${isValidToken.result.username}\n`
        );
        createTextFile("bot_token.txt", botToken);

        const answers2 = await inquirer.prompt({
            name: "chatId",
            type: "input",
            // @ts-ignore
            message: "Enter your telegram chat ID (type cancel to exit):",
            default() {
                return "";
            },
        });

        if (answers2.chatId === "cancel") {
            console.info("❌ Canceled");
            process.exit(1);
        }

        const isValidChat = await getChat(botToken, answers2.chatId);
        if (isValidChat !== null && isValidToken.ok) {
            if (isValidChat.result.type !== "private") {
                console.error("❌ Invalid chat ID make sure your telegram ID.");
                process.exit(1);
            }
            chatId = answers2.chatId;

            console.info(
                `✅ Chat ID is valid\n\nName: ${isValidChat.result.first_name}\nID: ${isValidChat.result.id}\nLink: https://t.me/${isValidChat.result.username}\n`
            );
            createTextFile("admin_id.txt", chatId);
        }
    } else {
        console.error("❌ Invalid chat ID");
        process.exit(1);
    }
}

