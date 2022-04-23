import TelegramBot from "node-telegram-bot-api"
import { PatheCinema } from "../cinemas"
import confirmBot from "./confirm"
import notifyBot from "./notify"
import searchBot from "./search"
import { MovieResults, userId } from "./types"

const token = process.env.TELEGRAM_BOT_TOKEN

export const bot = new TelegramBot(token, { polling: true })

const initBot = () => {
  const userSearches = new Map<userId, MovieResults>()
  const cinemaSelection = new Map<userId, Map<number, PatheCinema>>()
  searchBot(userSearches)
  notifyBot(cinemaSelection)
  confirmBot(userSearches, cinemaSelection)
}

export default initBot
