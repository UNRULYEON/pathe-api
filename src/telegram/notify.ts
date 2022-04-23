import { cinemas, PatheCinema } from "../cinemas"
import { bot } from "./bot"

type LocationNames = Omit<PatheCinema, "id">
const notifyBot = () => {
  const cinemasHash = new Map<number, LocationNames>()
  bot.on("callback_query", async (callback) => {
    //Cant get the id
    const movieTitle = callback.message.caption

    const action = callback.data
    const chatId = callback.message.chat.id
    const messageId = callback.message.message_id
    const cinemaIds = cinemas.map((e) => `select-${e.id}`)
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
                ...getKeyboard(lastSelectedId, cinemasHash),
                [{ text: "✅", callback_data: "action, 39, 28" }],
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
            inline_keyboard: [...getKeyboard(-1, cinemasHash), [{ text: "✅", callback_data: "action, 39, 28" }]],
          },
        })
        break
      case "confirm":
        break
      default:
        break
    }
  })
}

// todo: refactor to Option<string>
const getKeyboard = (selectedId: number, cinemasmap: Map<number, LocationNames>) => {
  cinemasmap.has(selectedId) ? cinemasmap.delete(selectedId) : cinemasmap.set(selectedId, cinemas.at(selectedId))
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
    arr[arr.length - 1] = [{ ...arr[arr.length - 1][0] }, { ...res }]

    return arr
  }, [])

  return keyboard
}
export default notifyBot
