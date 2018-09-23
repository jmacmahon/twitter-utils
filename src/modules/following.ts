import { TwitterClient } from '../twitterApiClient'
import { Module } from '../module'
import { Dict } from '../dict'
import { JsonExtractor } from '@evergreen-smart-power/validation-tools'

export class Following implements Module {
  constructor (private client: TwitterClient.GetFriends) { }

  public async getFollowing (user: string): Promise<TwitterClient.User[]> {
    return this.client.getFriends(user)
  }

  async run (rawParams: Dict<unknown>) {
    const extractor = new JsonExtractor(rawParams)
    const params = {
      ...extractor.stringValue('user')
    }
    const intersection = await this.getFollowing(params.user)
    console.log(JSON.stringify(intersection, null, 2))
  }
}