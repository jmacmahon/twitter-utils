import { JsonExtractor } from '@evergreen-smart-power/validation-tools'
import { concat } from 'lodash'
import { Dict } from './dict'

export namespace TwitterClient {
  export interface TwitParams {
    screen_name?: string
    count?: number
    cursor?: string
  }

  export interface TwitGet {
    get: (endpoint: string, params?: TwitParams) => Promise<{ data: Dict<unknown> }>,
  }

  export interface TwitLike extends TwitGet { }

  export interface GetFriends {
    getFriends: (username?: string) => Promise<User[]>
  }

  export type User = {
    id: number,
    screen_name: string
  }
}

export class TwitterClient implements TwitterClient.GetFriends {
  constructor (private twit: TwitterClient.TwitLike) { }

  public async getFriends (username?: string): Promise<TwitterClient.User[]> {
    const params: TwitterClient.TwitParams = { screen_name: username }
    const responsePages = await this.paginated('friends/list', params)
    const usersByPage = responsePages.map(extractUsers)
    return concat([], ...usersByPage)
  }

  public async paginated (endpoint: string, params: TwitterClient.TwitParams = {}): Promise<Dict<unknown>[]> {
    const baseParams: TwitterClient.TwitParams = {
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
  const data = extractor.arrayOfObjects('users', (userExtractor) => ({
    ...userExtractor.numericValue('id'),
    ...userExtractor.stringValue('screen_name'),
    ...userExtractor.stringValue('name')
  }))
  return data.users
}
