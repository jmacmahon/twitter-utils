import { Optional, Primitive, validate } from 'validate-typescript'
import { Dict } from '../dict'
import { Module } from '../module'
import { TwitterClient } from '../twitterApiClient'
import { dump } from '../userList/dump'

type Params = {
  user: string
  out?: string
}
const Params = (): Params => ({
  user: Primitive(String),
  out: Optional(Primitive(String))
})

export const defaultInjections = {
  consoleLog: console.log,
  userListDump: dump
}

export class Following implements Module {
  constructor (
    private client: TwitterClient.GetFriends,
    private injections = defaultInjections
 ) { }

  async run (rawParams: Dict<unknown>) {
    const params = validate(Params(), rawParams)
    const following = await this.client.getFriends(params.user)
    if (params.out) {
      await this.injections.userListDump(params.out, following)
    } else {
      this.injections.consoleLog(JSON.stringify(following, null, 2))
    }
  }
}
