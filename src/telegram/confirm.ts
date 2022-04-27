import { PatheCinema } from "../cinemas"
import { bot } from "./bot"
import { getMovieByIndex } from "./search"
import { MovieResults, Id } from "./types"
import prisma from "../prisma/context"

const confirmBot = (userSearches: Map<Id, MovieResults>, cinemasHash: Map<Id, Map<number, PatheCinema>>) => {
  bot.on("callback_query", async (callback) => {
    const action = callback.data
    const chatId = callback.message.chat.id
    const messageId = callback.message.message_id

    switch (action) {
      case "confirm":
        const selectedMovies = userSearches.get(chatId)
        const selectedMovie = getMovieByIndex(selectedMovies)
        const selectedCinemas = [...cinemasHash.get(chatId).values()]
        const selectedCinemasDB = await prisma.cinema
          .findMany()
          .then((cinemas) =>
            selectedCinemas.length > 0
              ? cinemas.filter((cinema) =>
                  selectedCinemas.find((selectedCinema) => selectedCinema.id === cinema.patheId)
                )
              : cinemas
          )
        const selectedCinemaNames = selectedCinemasDB.reduce(
          (acc, cinema, _) =>
            acc +
            `- ${cinema.name}
`,
          ""
        )

        userSearches.delete(chatId)
        cinemasHash.delete(chatId)

        prisma.telegramNotification
          .create({
            data: {
              chatId: chatId.toString(),
              movieId: parseInt(selectedMovie.id),
              messageId: messageId.toString(),
              movieName: selectedMovie.name,
              movieAgendaUrl: selectedMovie.agendaUrl,
              TelegramNotificationCinemas: {
                createMany: { data: selectedCinemasDB.map((ID) => ({ cinemaId: ID.id })) },
              },
            },
          })
          .then(() => {
            bot.editMessageReplyMarkup({ inline_keyboard: [] }, { chat_id: chatId, message_id: messageId }).then(() => {
              bot.editMessageText(
                `We'll notify you when the times are available for:

${selectedCinemaNames}`,
                { chat_id: chatId, message_id: messageId }
              )
            })
          })
        break
      default:
        break
    }
  })
}

export default confirmBot
