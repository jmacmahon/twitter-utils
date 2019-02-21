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
      ...extractor.stringValue('user'),
      ...extractor.optionalStringValue('out')
    }
    const following = await this.client.getFriends(params.user)
    if (params.out) {
      await this.injections.userListDump(params.out, following)
    } else {
      this.injections.consoleLog(JSON.stringify(following, null, 2))
    }
  }
}
