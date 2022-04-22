export type SearchActions = 'prev' | 'next'
export type NotifyActions = 'notify'
export type SelectNotifyActions = 'select' | 'confirm'

export type Actions = SearchActions | NotifyActions | SelectNotifyActions
export type Action = SearchAction | NotifyAction | SelectNotifyAction

export type SearchActionsPayload = { index: number, query: string }
export type NotifyActionsPayload = { id: string, name: string, movies?: any[]}
export type SelectNotifyActionsPayload = { id: string, selected: string[] }

export type SearchAction = { action: SearchActions, payload: SearchActionsPayload }
export type NotifyAction = { action: NotifyActions, payload: NotifyActionsPayload }
export type SelectNotifyAction = { action: SelectNotifyActions, payload: SelectNotifyActionsPayload }
