import { InlineKeyboardButton } from "node-telegram-bot-api"
import { searchFilms } from "../scraper/search"
import { SearchAction, SearchActions, SearchActionsPayload } from "./types"
import { encodeAction } from "./utils"
import { bot } from "./bot"

const searchBot = () => {
  bot.onText(/\/search (.+)/, async (msg, match) => {
    const chatId = msg.chat.id
    const query = match[1]

    const results = await searchFilms(query)

    if (results.length <= 0) {
      bot.sendMessage(chatId, "No results found")
      return
    }

    const nextButton: InlineKeyboardButton = {
      text: "Next",
      callback_data: encodeAction({ action: "next", payload: { index: 0 + 1, query } }),
    }

    const agendaButton: InlineKeyboardButton = { text: "Agenda", url: results[0].agendaUrl }

    const notifyWhenAvailableButton: InlineKeyboardButton = {
      text: "Notify when available",
      callback_data: encodeAction({ action: "notify", payload: { id: results[0].id, name: results[0].name } }),
    }

    const keyboardWithOneResult: InlineKeyboardButton[][] = [[agendaButton, notifyWhenAvailableButton]]

    const keyboardWithMultipleResults: InlineKeyboardButton[][] = [
      [nextButton],
      [agendaButton, notifyWhenAvailableButton],
    ]

    bot.sendPhoto(chatId, results[0].posterUrl, {
      caption: results[0].name,
      reply_markup: {
        inline_keyboard: results.length > 1 ? keyboardWithMultipleResults : keyboardWithOneResult,
      },
    })
  })

  bot.on("callback_query", async (callback) => {
    const {
      action,
      payload: { index, query },
    } = JSON.parse(callback.data) as SearchAction
    const chatId = callback.message.chat.id
    const messageId = callback.message.message_id

    const allowedActions: SearchActions[] = ["prev", "next"]

    if (!allowedActions.includes(action)) return

    const results = await searchFilms(query)

    const backButton: InlineKeyboardButton = {
      text: "Back",
      callback_data: encodeAction({ action: "prev", payload: { index: index - 1, query: query } }),
    }

    const nextButton: InlineKeyboardButton = {
      text: "Next",
      callback_data: encodeAction({ action: "next", payload: { index: index + 1, query: query } }),
    }

    const agendaButton: InlineKeyboardButton = { text: "Agenda", url: results[0].agendaUrl }

    const notifyWhenAvailableButton: InlineKeyboardButton = {
      text: "Notify when available",
      callback_data: encodeAction({ action: "notify", payload: { id: results[0].id, name: results[0].name } }),
    }

    const keyboardWithFirstResult: InlineKeyboardButton[][] = [[nextButton], [agendaButton, notifyWhenAvailableButton]]

    const keyboardWithResults: InlineKeyboardButton[][] = [
      [backButton, nextButton],
      [agendaButton, notifyWhenAvailableButton],
    ]

    const keyboardWithLastResults: InlineKeyboardButton[][] = [[backButton], [agendaButton, notifyWhenAvailableButton]]

    switch (action) {
      case "prev":
        bot.editMessageMedia(
          { media: results[index].posterUrl, type: "photo", caption: results[index].name },
          {
            chat_id: chatId,
            message_id: messageId,
            reply_markup: {
              inline_keyboard: index > 0 ? keyboardWithResults : keyboardWithFirstResult,
            },
          }
        )
        break
      case "next":
        bot.editMessageMedia(
          { media: results[index].posterUrl, type: "photo", caption: results[index].name },
          {
            chat_id: chatId,
            message_id: messageId,
            reply_markup: {
              inline_keyboard: index < results.length - 1 ? keyboardWithResults : keyboardWithLastResults,
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
