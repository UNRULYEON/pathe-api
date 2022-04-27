import TelegramBot from "node-telegram-bot-api"
import { PatheCinema } from "../cinemas"
import confirmBot from "./confirm"
import notifyBot from "./notify"
import searchBot from "./search"
import { MovieResults, Id } from "./types"

const token = process.env.TELEGRAM_BOT_TOKEN

export const bot = new TelegramBot(token, { polling: true })

const initBot = () => {
  const userSearches = new Map<Id, MovieResults>()
  const cinemaSelection = new Map<Id, Map<number, PatheCinema>>()
  searchBot(userSearches)
  notifyBot(userSearches, cinemaSelection)
  confirmBot(userSearches, cinemaSelection)
}

export default initBot
