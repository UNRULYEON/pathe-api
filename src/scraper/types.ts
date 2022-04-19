export type Actions = 'prev' | 'next' | 'notify'

export type SearchActions = `search_${Actions}`

type GeneralizedAction<T extends string> = `@${T}`

export type Action<T extends string> = { action: GeneralizedAction<T>, index: number, query: string, test?: string }
