import fs from 'fs'
import { TwitterClient } from '../twitterApiClient'

export type WriteFileLike = (file: string, data: string, callback: (error?: Error) => void) => void

const defaults = {
  writeFile: fs.writeFile as WriteFileLike
}

export function dump (file: string, users: TwitterClient.User[], injections = defaults): Promise<void> {
  const data = {
    type: 'user-list',
    version: 1,
    users
  }
  const dataStr = JSON.stringify(data)

  return new Promise((resolve, reject) => {
    injections.writeFile(file, dataStr, (error) => {
      if (error) { return reject(error) }
      resolve()
    })
  })
}
