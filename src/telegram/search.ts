import { InlineKeyboardButton } from "node-telegram-bot-api"
import { Movie, searchFilms } from "../scraper/search"
import { bot } from "./bot"


const backButton: InlineKeyboardButton = { text: 'Back', callback_data: 'prev' }
const nextButton: InlineKeyboardButton = { text: 'Next', callback_data: 'next' }
const notifyButton: InlineKeyboardButton = { text: 'Notify when available', callback_data: 'notify' }
const agendaButton: InlineKeyboardButton = { text: 'Agenda', callback_data: 'agenda' }

//TODO: improve
const getState = (index: number, array_size: number): InlineKeyboardButton[][] => {
    const current_state = []
    if (index > 0) {
        current_state.push(backButton)
    }
    if (index < array_size) {
        current_state.push(nextButton)
    }
    return [current_state, [notifyButton, agendaButton]]
}

const searchBot = () => {
    let results: Movie[] = []
    let index = 0
    bot.onText(/\/search (.+)/, async (msg, match) => {
        const chatId = msg.chat.id
        const query = match[1]
        results = await searchFilms(query)
        bot.sendPhoto(chatId, results[index].posterUrl, {
            caption: results[index].name,
            reply_markup: {
                inline_keyboard: getState(index, results.length - 1)
            }
        })

    })

    bot.on("callback_query", async (callback) => {

        const chatId = callback.message.chat.id
        const messageId = callback.message.message_id
        //TODO: improve index increment and decrements
        switch (callback.data) {
            case 'prev':
                index--;
                bot.editMessageMedia({ media: results[index].posterUrl, type: 'photo', caption: results[index].name }, {
                    chat_id: chatId,
                    message_id: messageId,
                    reply_markup: {
                        inline_keyboard: getState(index, results.length - 1)
                    }
                })
                break;
            case 'next':
                index++;
                bot.editMessageMedia({ media: results[index].posterUrl, type: 'photo', caption: results[index].name }, {
                    chat_id: chatId,
                    message_id: messageId,
                    reply_markup: {
                        inline_keyboard: getState(index, results.length - 1)
                    }
                })
                break;
            default:
                break;
        }

    })
}

export default searchBot

