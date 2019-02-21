import fs from 'fs'
import { Twitter } from 'twit'
import { isDict } from '../dict'
import { TwitterClient } from '../twitterApiClient'

export type ReadFileLike = (
  file: string,
  encoding: { encoding: string } | null | undefined,
  callback: (error: Error | undefined, data?: string) => void
) => void

const defaults = {
  readFile: fs.readFile as ReadFileLike
}

export function load (file: string, injections = defaults): Promise<TwitterClient.User[]> {
  return new Promise((resolve, reject) => {
    injections.readFile(file, { encoding: 'utf8' }, (error, data) => {
      if (error) { reject(error) }
      try {
        resolve(parse(data!))
      } catch (error) {
        reject(error as Error)
      }
    })
  })
}

function parse (raw: string): TwitterClient.User[] {
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch (error) {
    throw new Error('File was not JSON')
  }
  if (!isDict(parsed) || parsed.type !== 'user-list') {
    throw new Error('Invalid file format')
  }
  if (parsed.version !== 1) {
    throw new Error('Unsupported version')
  }
  return parsed.users as TwitterClient.User[]
}
