import { JsonExtractor } from '@evergreen-smart-power/validation-tools'
import { concat } from 'lodash'
import { Dict } from './dict'

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
    get: (endpoint: string, params?: GetParams) => Promise<{ data: Dict<unknown> }>,
    post: (endpoint: string, params?: PostParams) => Promise<unknown>
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

  export type MinimalUser = { id_str: string } | { screen_name: string }
}

export class TwitterClient implements TwitterClient.GetFriends, TwitterClient.Follow {
  constructor (private twit: TwitterClient.TwitLike) { }

  public async getFriends (username?: string): Promise<TwitterClient.User[]> {
    const params: TwitterClient.FriendsListParams = { screen_name: username }
    const responsePages = await this.paginated('friends/list', params)
    const usersByPage = responsePages.map(extractUsers)
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
      allData.push(response.data)

      if (typeof response.data.next_cursor_str !== 'string' || response.data.next_cursor_str === '0') {
        break
      }
      cursor = response.data.next_cursor_str
    }
    return allData
  }
}

function extractUsers (raw: Dict<unknown>): TwitterClient.User[] {
  const extractor = new JsonExtractor(raw)
  const data = extractor.arrayOf('users', (rawUser) => {
    const userExtractor = new JsonExtractor(rawUser)
    return {
      ...userExtractor.stringValue('id_str'),
      ...userExtractor.stringValue('screen_name'),
      ...userExtractor.stringValue('name')
    }
  })
  return data.users
}
