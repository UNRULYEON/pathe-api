import { PatheCinema } from "../cinemas"
import { bot } from "./bot"
import { getMovieIndex } from "./search"
import { MovieResults, userId } from "./types"

const confirmBot = (userSearches: Map<userId, MovieResults>, cinemasHash: Map<userId, Map<number, PatheCinema>>) => {
  bot.on("callback_query", async (callback) => {
    const action = callback.data
    const chatId = callback.message.chat.id
    const messageId = callback.message.message_id
    switch (action) {
      case "confirm":
        const t = userSearches.get(chatId)
        const selectedMovie = getMovieIndex(t)
        const selectedCinemas = [...cinemasHash.get(chatId).values()]
        userSearches.delete(chatId)
        cinemasHash.delete(chatId)
        bot.editMessageReplyMarkup({ inline_keyboard: [] }, { chat_id: chatId, message_id: messageId })
        bot.sendMessage(
          chatId,
          `Selected movie: ${JSON.stringify(selectedMovie.name)}\n
          Selected cinema(s): ${selectedCinemas.map((e) => `${e.id} == ${e.name}: ${e.city}}`)}`
        )
        break
      default:
        break
    }
  })
}

export default confirmBot
