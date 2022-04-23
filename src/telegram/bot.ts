import TelegramBot from "node-telegram-bot-api"
import notifyBot from "./notify"
import searchBot from "./search"

const token = process.env.TELEGRAM_BOT_TOKEN

export const bot = new TelegramBot(token, { polling: true })

const initBot = () => {
  searchBot()
  notifyBot()
}

export default initBot
