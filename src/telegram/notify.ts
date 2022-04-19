import { cinemas } from "../cinemas"
import { bot } from "./bot"
import { Actions, NotifyAction, SelectNotifyAction } from "./types"
import { encodeAction } from "./utils"

const notifyBot = () => {
  bot.on('callback_query', async (callback) => {
    const { action, payload } = JSON.parse(callback.data) as NotifyAction | SelectNotifyAction
    const chatId = callback.message.chat.id
    const messageId = callback.message.message_id

    const allowedActions: Actions[] = ['notify', 'select', 'confirm']

    if (!allowedActions.includes(action)) return

    switch (action) {
      case 'notify':
        bot.editMessageReplyMarkup({ inline_keyboard: [] }, { chat_id: chatId, message_id: messageId })

        bot.sendMessage(chatId, 'Please select one or more cinemas', {
          reply_markup: {
            // TODO: Pas callback_data van confirm aan
            inline_keyboard: [...getKeyboard([], []), [{ text: '✅', callback_data: 'action, 39, 28' }]],
          }
        })
        break;
      case 'select':
        bot.editMessageReplyMarkup({ inline_keyboard: [...getKeyboard([payload.id], payload.selected), [{ text: '✅', callback_data: 'action, 39, 28' }]] }, { chat_id: chatId, message_id: messageId })
        break;
      case 'confirm':
        break;
      default:
        break;
    }
  })
}
// todo: refactor to Option<string>
const getKeyboard = (selectedId: string[], selectedIds: string[]) => {
  console.log(`selectedId: ${selectedId}`)
  console.log(`selectedIds: ${selectedIds}`)

  const newSelectedIds = selectedIds.includes(selectedId[0]) ? [...selectedIds].filter(v => v !== selectedId[0]) : [...selectedIds, ...selectedId]

  const keyboard = cinemas.reduce((arr, curr, ind) => {
    const res = {
      text: `${newSelectedIds.includes(curr.id.toString()) ? '✅ ' : ''}${curr.name}`,
      callback_data: encodeAction({ action: 'select', payload: { id: curr.id.toString(), selected: newSelectedIds } })
    }
    if (ind % 2 == 0) {
      arr.push([res])
      return arr
    }

    //TODO: improve this.
    arr[arr.length - 1] = [{ ...arr[arr.length - 1][0] }, { ...res }]

    return arr
  }, [])

  console.log(keyboard[0][0].callback_data)

  return keyboard
}

export default notifyBot