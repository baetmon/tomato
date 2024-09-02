import { GetJWT } from "../core/getToken.js"
import { UserBalance } from "../core/userBalance.js"
import { getRandomNumberBetween, listTxtFiles, sleep } from "../lib/utils.js"
import { GamePlay } from "../core/gamePlay.js"
import { GameClaim } from "../core/gameClaim.js"

export async function gameAll() {
  const currentDir = process.cwd()
  const filesPath = `${currentDir}/users`
  const listUsers = await listTxtFiles(filesPath)
  console.info("✅ Game Started")
  if (listUsers.length > 0) {
    for (const user of listUsers) {
      const token = await GetJWT(user)
      if (!token) {
        console.log("⛔ Unable to get JWT")
      } else {
        let passes = 0
        const balance = await UserBalance(token)
        if (!balance) {
          console.log("⛔ Unable to get balance")
        } else {
          passes = balance.data.play_passes
        }

        if (passes > 0) {
          while (passes > 0) {
            const balance2 = await UserBalance(token)
            console.log(
              `🍀 User: ${user} | Passes: ${balance2?.data.play_passes} | Balance: ${balance2?.data.available_balance}`
            )
            const playGame = await GamePlay(token)
            if (!playGame) {
              console.log("⛔ Unable to play game")
            } else {
              console.info("⏳ Waiting for 30 seconds to complete game play.")
              await sleep(33 * 1000)
              const pts = getRandomNumberBetween(400, 560)
              const claimGame = await GameClaim(token, pts)
              if (!claimGame) {
                console.log("⛔ Unable to claim game")
              } else {
                console.log(`✅ Game completed with ${pts} 🍅 points.`)
              }
              passes-- //lazy to handle error
            }
            console.info(
              "⏳ Waiting for 5 seconds before playing to next game."
            )
            await sleep(5 * 1000)
          }
        } else {
          console.info(`👍 User ${user} has no play passes.`)
        }

        console.info("⏳ Waiting for 5 seconds before switching to next user.")
        await sleep(5 * 1000)
      }
    }
  } else {
    console.log("⛔ No users found")
  }
}
