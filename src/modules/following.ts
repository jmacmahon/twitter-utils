import { JsonExtractor } from '@evergreen-smart-power/validation-tools'
import { Dict } from '../dict'
import { Module } from '../module'
import { TwitterClient } from '../twitterApiClient'
import { dump } from '../userList/dump'

type Injections = {
  consoleLog: typeof console.log,
  userListDump: typeof dump
}

export const defaults: Injections = {
  consoleLog: console.log,
  userListDump: dump
}

export class Following implements Module {
  constructor (
    private client: TwitterClient.GetFriends,
    private injections = defaults
 ) { }

  async run (rawParams: Dict<unknown>) {
    const extractor = new JsonExtractor(rawParams)
    const params = {
      ...extractor.stringValue('user')
    }
    const following = await this.client.getFriends(params.user)
    this.injections.consoleLog(JSON.stringify(following, null, 2))
  }
}
