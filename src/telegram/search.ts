import { InlineKeyboardButton } from "node-telegram-bot-api"
import { searchFilms } from "../scraper/search"
import { bot } from "./bot"
import { MovieResults, Id } from "./types"

const backButton: InlineKeyboardButton = { text: "Back", callback_data: "prev" }
const nextButton: InlineKeyboardButton = { text: "Next", callback_data: "next" }
const notifyButton: InlineKeyboardButton = { text: "Notify when available", callback_data: "notify" }

//TODO: improve
const getState = (index: number, array_size: number, agendaUrl: string): InlineKeyboardButton[][] => {
  const agendaButton: InlineKeyboardButton = { text: "Agenda", url: agendaUrl }

  const current_state = []
  if (index > 0) {
    current_state.push(backButton)
  }
  if (index < array_size) {
    current_state.push(nextButton)
  }
  return [current_state, [notifyButton, agendaButton]]
}

export const getMovieByIndex = (m: MovieResults) => m.results[m.index]

const searchBot = (userSearches: Map<Id, MovieResults>) => {
  bot.onText(/\/search (.+)/, async (msg, match) => {
    const chatId = msg.chat.id
    const query = match[1]
    userSearches.set(chatId, { index: 0, results: await searchFilms(query) })
    const currentSearch = userSearches.get(chatId)
    const currentResult = getMovieByIndex(currentSearch)

    bot.sendPhoto(chatId, currentResult.posterUrl, {
      caption: currentResult.name,
      reply_markup: {
        inline_keyboard: getState(currentSearch.index, currentSearch.results.length - 1, currentResult.agendaUrl),
      },
    })
  })

  bot.on("callback_query", async (callback) => {
    const chatId = callback.message.chat.id
    const messageId = callback.message.message_id

    //TODO: improve index increment and decrements
    if (!userSearches.has(chatId)) {
      return
    }

    const currentSearch = userSearches.get(chatId)

    switch (callback.data) {
      case "prev":
        userSearches.get(chatId).index--

        bot.editMessageMedia(
          {
            media: getMovieByIndex(currentSearch).posterUrl,
            type: "photo",
            caption: getMovieByIndex(currentSearch).name,
          },
          {
            chat_id: chatId,
            message_id: messageId,
            reply_markup: {
              inline_keyboard: getState(
                currentSearch.index,
                currentSearch.results.length - 1,
                getMovieByIndex(currentSearch).agendaUrl
              ),
            },
          }
        )
        break
      case "next":
        userSearches.get(chatId).index++

        bot.editMessageMedia(
          {
            media: getMovieByIndex(currentSearch).posterUrl,
            type: "photo",
            caption: getMovieByIndex(currentSearch).name,
          },
          {
            chat_id: chatId,
            message_id: messageId,
            reply_markup: {
              inline_keyboard: getState(
                currentSearch.index,
                currentSearch.results.length - 1,
                getMovieByIndex(currentSearch).agendaUrl
              ),
            },
          }
        )
        break
      default:
        break
    }
  })
}

export default searchBot
