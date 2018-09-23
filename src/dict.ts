export type Dict<T> = {
  [key: string]: T | undefined
}

export function isDict (thing: unknown): thing is Dict<unknown> {
  return typeof thing === 'object' && !Array.isArray(thing) && thing !== null
}

export function dictValues <T> (thing: Dict<T>): T[] {
  return Object.values(thing) as T[]
}
