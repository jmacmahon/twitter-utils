import { TwitterClient } from '../twitterApiClient'
import { Module } from '../module'
import { Dict } from '../dict'
import { JsonExtractor } from '@evergreen-smart-power/validation-tools'
import { intersectionBy } from 'lodash'

export class FollowingIntersection implements Module {
  constructor (private client: TwitterClient.GetFriends) { }

  public async getIntersection (userA: string, userB: string): Promise<TwitterClient.User[]> {
    const followersA = await this.client.getFriends(userA)
    const followersB = await this.client.getFriends(userB)
    return intersectionBy(followersB, followersA, user => user.id)
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
