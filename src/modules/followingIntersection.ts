import { TwitterClient } from '../twitterApiClient'
import { Module } from '../module'
import { Dict } from '../dict'
import { JsonExtractor } from '@evergreen-smart-power/validation-tools'

export class FollowingIntersection implements Module {
  constructor (private client: TwitterClient.GetFriends) { }

  public async getIntersection (screenNameA: string, screenNameB: string): Promise<TwitterClient.User[]> {
    throw new Error('not yet implemented')
  }

  async run (rawParams: Dict<unknown>) {
    const extractor = new JsonExtractor(rawParams)
    const params = {
      ...extractor.stringValue('userA'),
      ...extractor.stringValue('userB')
    }
    const intersection = await this.getIntersection(params.userA, params.userB)
    console.log(JSON.stringify(intersection, null, 2))
  }
}
