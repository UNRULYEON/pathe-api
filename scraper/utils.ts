import { Action } from "./types";

export const encodeAction = <T extends string>(data: Action<T>) => JSON.stringify({ ...data })