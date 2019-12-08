import { concat } from 'lodash'
import Twit = require('twit')
import { Primitive, validate } from 'validate-typescript'
import { Dict, isDict } from './dict'

export class TwitterClient implements TwitterClient.GetFriends, TwitterClient.Follow {
  constructor (private twit: TwitterClient.TwitLike) { }

  public async getFriends (username?: string): Promise<TwitterClient.User[]> {
    const params: TwitterClient.FriendsListParams = { screen_name: username }
    const responsePages = await this.paginated('friends/list', params)
    const usersByPage = responsePages.map(page => validate([TwitterClient.User()], page.users))
    return concat([], ...usersByPage)
  }

  public async follow (user: TwitterClient.MinimalUser): Promise<void> {
    const userParam = 'id_str' in user ? { user_id: user.id_str } : { screen_name: user.screen_name }
    const params = {
      ...userParam,
      follow: true
    }
    await this.twit.post('friendships/create', params)
  }

  public async paginated (endpoint: string, params: TwitterClient.FriendsListParams = {}): Promise<Dict<unknown>[]> {
    const baseParams: TwitterClient.GetParams = {
      ...params,
      count: 200
    }
    let cursor = '-1'
    const allData: Dict<unknown>[] = []
    while (true) {
      const params = {
        ...baseParams,
        cursor
      }
      const response = await this.twit.get(endpoint, params)
      const { data } = response
      if (!isDict(data)) {
        throw new Error(`Response data was not a dict: ${data}`)
      }
      allData.push(data)

      if (typeof data.next_cursor_str !== 'string' || data.next_cursor_str === '0') {
        break
      }
      cursor = data.next_cursor_str
    }
    return allData
  }
}

export namespace TwitterClient {
  export type GetParams = FriendsListParams
  export interface FriendsListParams {
    screen_name?: string
    count?: number
    cursor?: string
  }

  export type PostParams = FriendshipsCreateParams
  export interface FriendshipsCreateParams {
    screen_name?: string
    user_id?: string
    follow?: boolean
  }

  export interface TwitGet {
    get: (endpoint: string, params?: Twit.Params) => Promise<{ data: object }>,
    post: (endpoint: string, params?: Twit.Params) => Promise<unknown>
  }

  export interface TwitLike extends TwitGet { }

  export interface GetFriends {
    getFriends: (username?: string) => Promise<User[]>
  }

  export interface Follow {
    follow: (user: MinimalUser) => Promise<void>
  }

  export type User = {
    id_str: string
    screen_name: string
    name: string
  }
  export const User = (): User => ({
    id_str: Primitive(String),
    screen_name: Primitive(String),
    name: Primitive(String)
  })

  export type MinimalUser = { id_str: string } | { screen_name: string }
}
