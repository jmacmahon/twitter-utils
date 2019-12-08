import { validate } from 'validate-typescript'
import { Dict } from '../dict'
import { Module } from '../module'
import { TwitterClient } from '../twitterApiClient'

type Params = {

}
const Params = (): Params => ({

})

export const defaultInjections = {
  consoleLog: console.log
}

export class MuteRetweets implements Module {
  constructor (
    private client: TwitterClient.GetFriends & TwitterClient.DisableRetweets,
    private injections = defaultInjections
 ) { }

  async run (rawParams: Dict<unknown>) {
    const params = validate(Params(), rawParams)
    const following = await this.client.getFriends()
    for (const user of following) {
      await this.client.disableRetweets(user)
      this.injections.consoleLog(`Disabling retweets for user ${user.screen_name}`)
    }
  }
}
