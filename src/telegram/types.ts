import { PatheCinema } from "../cinemas"

export type SearchActions = "prev" | "next"
export type NotifyActions = "notify"
export type SelectNotifyActions = "select" | "confirm"

export type Actions = SearchActions | NotifyActions | SelectNotifyActions

export type SearchActionsPayload = { index: number; query: string }
export type NotifyActionsPayload = { id: string; name: string; movies?: any[] }
export type SelectNotifyActionsPayload = { id: string; selected: string[] }

export type SearchAction = { action: SearchActions; payload: SearchActionsPayload }
export type NotifyAction = { action: NotifyActions; payload: NotifyActionsPayload }
export type SelectNotifyAction = { action: SelectNotifyActions; payload: SelectNotifyActionsPayload }

export type Movie = {
  id: string
  name: string
  posterUrl: string
  agendaUrl: string
  availableLocations: string[]
}

export type MovieResults = {
  results: Movie[]
  index: number
}
export type Id = number

//export type LocationNames = Omit<PatheCinema, "id">
