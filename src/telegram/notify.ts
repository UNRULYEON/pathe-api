import { cinemas, PatheCinema } from "../cinemas"
import getAvailableLocationsById from "../scraper/movie"
import { bot } from "./bot"
import { getMovieByIndex } from "./search"
import { Id, MovieResults } from "./types"

const notifyBot = (userSearches: Map<Id, MovieResults>, cinemasHash: Map<Id, Map<number, PatheCinema>>) => {
  bot.on("callback_query", async (callback) => {
    //Cant get the id
    const action = callback.data
    const chatId = callback.message.chat.id
    const messageId = callback.message.message_id
    const selectedMovies = userSearches.get(chatId)
    const selectedMovie = getMovieByIndex(selectedMovies)

    if (!cinemasHash.has(chatId)) cinemasHash.set(chatId, new Map())

    const availableLocation = await getAvailableLocationsById(parseInt(selectedMovie.id))

    const cinemasFiltered = cinemas.filter((cinema) => !availableLocation.includes(cinema.fullName))
    const cinemaIds = cinemasFiltered.map((e) => `select-${e.id}`)
    const allowedActions: string[] = ["notify", "confirm", ...cinemaIds]

    //TODO: parse id. Can this be done better
    const lastSelectedId = parseInt(action.split("-").reverse()[0])
    if (!allowedActions.includes(action)) return

    //TODO: Can you do this with string literals?
    cinemaIds.map((elem) => {
      switch (action) {
        case elem:
          bot.editMessageReplyMarkup(
            {
              inline_keyboard: [
                ...getKeyboard(lastSelectedId, cinemasFiltered, cinemasHash.get(chatId)),
                [{ text: "✅", callback_data: "confirm" }],
              ],
            },
            { chat_id: chatId, message_id: messageId }
          )
          break
      }
    })
    switch (action) {
      case "notify":
        bot.editMessageReplyMarkup({ inline_keyboard: [] }, { chat_id: chatId, message_id: messageId })
        bot.sendMessage(chatId, "Please select one or more cinemas", {
          reply_markup: {
            // TODO: Pas callback_data van confirm aan
            inline_keyboard: [
              ...getKeyboard(0, cinemasFiltered, cinemasHash.get(chatId)),
              [{ text: "✅", callback_data: "confirm" }],
            ],
          },
        })
        break
      default:
        break
    }
  })
}

// todo: refactor to Option<string>
const getKeyboard = (selectedId: number, cinemas: PatheCinema[], cinemasmap: Map<number, PatheCinema>) => {
  const selectedCinema = cinemas.find((e) => e.id == selectedId)
  cinemas.forEach
  cinemasmap.has(selectedId)
    ? cinemasmap.delete(selectedId)
    : selectedCinema != undefined && cinemasmap.set(selectedId, selectedCinema)
  const keyboard = cinemas.reduce((arr, curr, ind) => {
    const res = {
      text: `${cinemasmap.has(curr.id) ? "✅ " : ""}${curr.name}`,
      callback_data: `select-${curr.id}`,
    }
    if (ind % 2 == 0) {
      arr.push([res])
      return arr
    }

    //TODO: improve this.
    // Here is an idea: arr.push(res)
    arr[arr.length - 1] = [{ ...arr[arr.length - 1][0] }, { ...res }]

    return arr
  }, [])
  return keyboard
}
export default notifyBot
