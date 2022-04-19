import TelegramBot, { InlineKeyboardButton } from "node-telegram-bot-api"
import { searchFilms } from "./scraper/search"
import { Action, SearchActions } from "./scraper/types"
import { encodeAction } from "./scraper/utils"

const token = process.env.TELEGRAM_BOT_TOKEN

const bot = new TelegramBot(token, { polling: true });

const initBot = () => {
  bot.onText(/\/search (.+)/, async (msg, match) => {
    const chatId = msg.chat.id
    const query = match[1]

    const results = await searchFilms(query)

    if (results.length <= 0) {
      bot.sendMessage(chatId, "No results found")
      return
    }

    const nextButton: InlineKeyboardButton = { text: 'Next', callback_data: encodeAction<SearchActions>({ action: '@search_next', index: 0 + 1, query }) }

    const agendaButton: InlineKeyboardButton = { text: 'Agenda', url: results[0].agendaUrl }

    const notifyWhenAvailableButton: InlineKeyboardButton = { text: 'Notify when available', callback_data: encodeAction<SearchActions>({ action: '@search_notify', index: 0, query }) }

    const keyboardWithOneResult: InlineKeyboardButton[][] = [
      [agendaButton, notifyWhenAvailableButton]
    ]

    const keyboardWithMultipleResults: InlineKeyboardButton[][] = [
      [nextButton],
      [agendaButton, notifyWhenAvailableButton]
    ]

    bot.sendPhoto(chatId, results[0].posterUrl, {
      caption: results[0].name,
      reply_markup: {
        inline_keyboard: results.length > 1 ? keyboardWithMultipleResults : keyboardWithOneResult
      }
    })
  })

  bot.on('callback_query', async (callback) => {
    const { action, index, query } = JSON.parse(callback.data) as Action<SearchActions>
    const chatId = callback.message.chat.id
    const messageId = callback.message.message_id

    const results = await searchFilms(query)

    const backButton: InlineKeyboardButton = { text: 'Back', callback_data: encodeAction<SearchActions>({ action: '@search_prev', index: index - 1, query: query }) }

    const nextButton: InlineKeyboardButton = { text: 'Next', callback_data: encodeAction<SearchActions>({ action: '@search_next', index: index + 1, query: query }) }

    const agendaButton: InlineKeyboardButton = { text: 'Agenda', url: results[0].agendaUrl }

    const notifyWhenAvailableButton: InlineKeyboardButton = { text: 'Notify when available', callback_data: encodeAction<SearchActions>({ action: '@search_notify', index: 0, query: query }) }

    const keyboardWithFirstResult: InlineKeyboardButton[][] = [
      [nextButton],
      [agendaButton, notifyWhenAvailableButton]
    ]

    const keyboardWithResults: InlineKeyboardButton[][] = [
      [backButton, nextButton],
      [agendaButton, notifyWhenAvailableButton]
    ]

    const keyboardWithLastResults: InlineKeyboardButton[][] = [
      [backButton],
      [agendaButton, notifyWhenAvailableButton]
    ]

    switch (action) {
      case '@search_prev':
        bot.editMessageMedia({ media: results[index].posterUrl, type: 'photo', caption: results[index].name }, {
          chat_id: chatId,
          message_id: messageId,
          reply_markup: {
            inline_keyboard: index > 0 ? keyboardWithResults : keyboardWithFirstResult
          }
        })
        break;
      case '@search_next':
        bot.editMessageMedia({ media: results[index].posterUrl, type: 'photo', caption: results[index].name }, {
          chat_id: chatId,
          message_id: messageId,
          reply_markup: {
            inline_keyboard: index < results.length - 1 ? keyboardWithResults : keyboardWithLastResults
          }
        })
        break;
      case '@search_notify':
        break;
      default:
        break;
    }
  })
}

export default initBot