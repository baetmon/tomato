import { askBotToken } from "./botSetup.js"

askBotToken().then(() => { console.log("done") }).catch(e => console.error(e))