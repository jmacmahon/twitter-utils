import { Dict } from './dict'
import { JsonExtractor } from '@evergreen-smart-power/validation-tools'
import { Twitter } from 'twit'

export namespace TwitterClient {
  export interface TwitParams {
    screen_name?: string
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
    name: string
  }
}

export class TwitterClient implements TwitterClient.GetFriends {
  constructor (private twit: TwitterClient.TwitLike) { }

  public async getFriends (username?: string): Promise<TwitterClient.User[]> {
    const params: TwitterClient.TwitParams = { screen_name: username }
    const responseData = (await this.twit.get('friends/list', params)).data
    return extractUsers(responseData)
  }
}

function extractUsers (raw: Dict<unknown>): TwitterClient.User[] {
  const extractor = new JsonExtractor(raw)
  const data = extractor.arrayOfObjects('users', (userExtractor) => ({
    ...userExtractor.numericValue('id'),
    ...userExtractor.stringValue('name')
  }))
  return data.users
}
