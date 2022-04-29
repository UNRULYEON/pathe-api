import { InlineKeyboardButton } from "node-telegram-bot-api"
import { cinemas } from "../cinemas"
import getAvailableLocationsById from "../scraper/movie"
import { searchFilms } from "../scraper/search"
import { bot } from "./bot"
import { MovieResults, Id } from "./types"

const backButton: InlineKeyboardButton = { text: "Back", callback_data: "prev" }
const nextButton: InlineKeyboardButton = { text: "Next", callback_data: "next" }
const notifyButton: InlineKeyboardButton = { text: "Notify when available", callback_data: "notify" }

//TODO: improve
const getState = (
  index: number,
  array_size: number,
  agendaUrl: string,
  allLocations: boolean
): InlineKeyboardButton[][] => {
  const agendaButton: InlineKeyboardButton = { text: "Agenda", url: agendaUrl }

  const current_state = []
  if (index > 0) {
    current_state.push(backButton)
  }
  if (index < array_size) {
    current_state.push(nextButton)
  }
  return [current_state, allLocations ? [agendaButton] : [notifyButton, agendaButton]]
}

export const getMovieByIndex = (m: MovieResults) => m.results[m.index]

const searchBot = (userSearches: Map<Id, MovieResults>) => {
  bot.onText(/\/search (.+)/, async (msg, match) => {
    const chatId = msg.chat.id
    const query = match[1]
    userSearches.set(chatId, {
      index: 0,
      results: await searchFilms(query).then((movies) =>
        Promise.all(
          movies.map(async (movie) => ({
            ...movie,
            allLocationsAvailable: await getAvailableLocationsById(parseInt(movie.id)).then(
              (loc) => loc.length === cinemas.length
            ),
          }))
        )
      ),
    })

    const currentSearch = userSearches.get(chatId)
    const currentResult = getMovieByIndex(currentSearch)

    bot.sendPhoto(chatId, currentResult.posterUrl, {
      caption: currentResult.name,
      reply_markup: {
        inline_keyboard: getState(
          currentSearch.index,
          currentSearch.results.length - 1,
          currentResult.agendaUrl,
          currentResult.allLocationsAvailable
        ),
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
      case "prev": {
        userSearches.get(chatId).index--
        const { allLocationsAvailable, agendaUrl } = getMovieByIndex(currentSearch)
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
                agendaUrl,
                allLocationsAvailable
              ),
            },
          }
        )
        break
      }
      case "next": {
        userSearches.get(chatId).index++
        const { allLocationsAvailable, agendaUrl } = getMovieByIndex(currentSearch)
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
                agendaUrl,
                allLocationsAvailable
              ),
            },
          }
        )
        break
      }
      default:
        break
    }
  })
}

export default searchBot
