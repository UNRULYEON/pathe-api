import { Action } from "./types";

export const encodeAction = (data: Action) => JSON.stringify({ ...data })