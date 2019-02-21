// tslint:disable await-promise
import { expect } from 'chai'
import { random } from 'reproducible-random'
import { Dict } from '../../src/dict'
import { TwitterClient } from '../../src/twitterApiClient'
import { randomUser } from './dataGeneration'

const noop = () => undefined

const dummyTwit: TwitterClient.TwitLike = {
  get: () => Promise.resolve({ data: {} }),
  post: () => Promise.resolve()
}

describe('Twitter API client wrapper', () => {
  describe('getFriends', () => {
    it('should reject if Twit rejects', () => {
      const error = new Error(random.string(32))
      const fakeTwit = {
        ...dummyTwit,
        get: () => Promise.reject(error)
      }
      const twitter = new TwitterClient(fakeTwit)
      return expect(twitter.getFriends()).to.be.rejectedWith(error)
    })

    it('should call Twit with friends/list endpoint', async () => {
      let actualEndpoint: string | undefined
      const fakeTwit: TwitterClient.TwitLike = {
        ...dummyTwit,
        get: (endpoint) => {
          actualEndpoint = endpoint
          return Promise.resolve({ data: {} })
        }
      }
      const twitter = new TwitterClient(fakeTwit)
      await twitter.getFriends().catch(noop)
      return expect(actualEndpoint).to.equal('friends/list')
    })

    it('should accept a username parameter', async () => {
      const expectedUsername = random.string(32)
      let actualParams: unknown
      const fakeTwit: TwitterClient.TwitLike = {
        ...dummyTwit,
        get: (endpoint, params) => {
          actualParams = params
          return Promise.resolve({ data: {} })
        }
      }
      const twitter = new TwitterClient(fakeTwit)

      await twitter.getFriends(expectedUsername).catch(noop)

      return expect(actualParams).to.deep.include({
        screen_name: expectedUsername
      })
    })

    it('should throw if malformed data is received', async () => {
      const buildTwitterClient = (data: Dict<unknown>): TwitterClient => {
        const fakeTwit = { ...dummyTwit, get: () => Promise.resolve({ data }) }
        return new TwitterClient(fakeTwit)
      }

      const test1 = buildTwitterClient({})
      await expect(test1.getFriends()).to.be.rejectedWith(Error)
      const test2 = buildTwitterClient({ users: 0 })
      await expect(test2.getFriends()).to.be.rejectedWith(Error)
      const test3 = buildTwitterClient({ users: [{}] })
      await expect(test3.getFriends()).to.be.rejectedWith(Error)
    })

    it('should return id_str, screen_name and name fields', async () => {
      const data = {
        users: [
          randomUser(),
          randomUser(),
          randomUser(),
          randomUser()
        ]
      }
      const fakeTwit = { ...dummyTwit, get: () => Promise.resolve({ data }) }
      const client = new TwitterClient(fakeTwit)
      const actualUsers = await client.getFriends()
      expect(actualUsers).to.deep.equal(data.users)
    })
  })

  describe('follow', () => {
    it('should reject if Twit rejects', () => {
      const error = new Error(random.string(32))
      const fakeTwit = {
        ...dummyTwit,
        post: () => Promise.reject(error)
      }
      const twitter = new TwitterClient(fakeTwit)
      return expect(twitter.follow(randomUser())).to.be.rejectedWith(error)
    })

    it('should call Twit with friendships/create endpoint', async () => {
      let actualEndpoint: string | undefined
      const fakeTwit: TwitterClient.TwitLike = {
        ...dummyTwit,
        post: (endpoint) => {
          actualEndpoint = endpoint
          return Promise.resolve()
        }
      }
      const twitter = new TwitterClient(fakeTwit)
      await twitter.follow(randomUser()).catch(noop)
      return expect(actualEndpoint).to.equal('friendships/create')
    })

    it('should pass the screen name or user id as parameters, and pass follow: true', async () => {
      const user = randomUser()
      const testCases = [
        { minimalUser: { screen_name: user.screen_name }, expectedParams: { screen_name: user.screen_name, follow: true } },
        { minimalUser: { id_str: user.id_str }, expectedParams: { user_id: user.id_str, follow: true } },
        { minimalUser: { id_str: user.id_str, screen_name: user.screen_name }, expectedParams: { user_id: user.id_str, follow: true } }
      ]
      for (const { minimalUser, expectedParams } of testCases) {
        let actualParams: unknown
        const fakeTwit: TwitterClient.TwitLike = {
          ...dummyTwit,
          post: (endpoint, params) => {
            actualParams = params
            return Promise.resolve()
          }
        }
        const twitter = new TwitterClient(fakeTwit)

        await twitter.follow(minimalUser)

        await expect(actualParams).to.deep.include(expectedParams)
      }
    })
  })

  describe('pagination', () => {
    it('should reject if Twit rejects', () => {
      const err = new Error(random.string(32))
      const fakeTwit: TwitterClient.TwitLike = {
        ...dummyTwit,
        get: () => Promise.reject(err)
      }
      const client = new TwitterClient(fakeTwit)

      return expect(client.paginated(random.string(32))).to.be.rejectedWith(err)
    })

    it('should request the same endpoint and params (except "count" and "cursor") fields as it was called with', async () => {
      const endpoint = random.string(32)
      const params = {
        [random.string(8)]: random.string(32)
      }
      let actualEndpoint: unknown
      let actualParams: unknown
      const fakeTwit: TwitterClient.TwitLike = {
        ...dummyTwit,
        get: async (endpoint, params = {}) => {
          actualEndpoint = endpoint
          actualParams = params
          return { data: {} }
        }
      }
      const client = new TwitterClient(fakeTwit)

      await client.paginated(endpoint, params)

      expect(actualEndpoint).to.equal(endpoint)
      expect(actualParams).to.deep.include(params)
    })

    it('should request a page size of 200', async () => {
      let actualParams: unknown
      const fakeTwit: TwitterClient.TwitLike = {
        ...dummyTwit,
        get: async (endpoint, params = {}) => {
          actualParams = params
          return { data: {} }
        }
      }
      const client = new TwitterClient(fakeTwit)

      await client.paginated(random.string(32))

      expect(actualParams).to.deep.include({
        count: 200
      })
    })

    it('should set cursor = -1 initially', async () => {
      let actualParams: unknown
      const fakeTwit: TwitterClient.TwitLike = {
        ...dummyTwit,
        get: async (endpoint, params = {}) => {
          actualParams = params
          return { data: {} }
        }
      }
      const client = new TwitterClient(fakeTwit)

      await client.paginated(random.string(32))

      expect(actualParams).to.deep.include({
        cursor: '-1'
      })
    })

    it('should request the next page if it is available', async () => {
      const cursorToSend = random.string(32)
      let capturedCursor: unknown
      let callCount = 0
      const fakeTwit: TwitterClient.TwitLike = {
        ...dummyTwit,
        get: async (endpoint, params = {}) => {
          callCount += 1
          switch (callCount) {
            case 1:
              return { data: { next_cursor_str: cursorToSend } }
            case 2:
              capturedCursor = params.cursor
              return { data: { next_cursor_str: '0' } }
            default:
              throw new Error('should not be called after sending next_cursor_str = 0')
          }
        }
      }
      const client = new TwitterClient(fakeTwit)

      await client.paginated(random.string(32))

      expect(callCount).to.equal(2)
      expect(capturedCursor).to.equal(cursorToSend)
    })

    it('should return an array containing each of the response pages', async () => {
      const page1 = {
        [random.string(8)]: random.string(32),
        next_cursor_str: random.string(32)
      }
      const page2 = {
        [random.string(8)]: random.string(32),
        next_cursor_str: random.string(32)
      }
      const page3 = {
        [random.string(8)]: random.string(32),
        next_cursor_str: '0'
      }
      let callCount = 0
      const fakeTwit: TwitterClient.TwitLike = {
        ...dummyTwit,
        get: async () => {
          callCount += 1
          switch (callCount) {
            case 1:
              return { data: page1 }
            case 2:
              return { data: page2 }
            case 3:
              return { data: page3 }
            default:
              throw new Error('should not be called after sending next_cursor_str = 0')
          }
        }
      }
      const client = new TwitterClient(fakeTwit)

      const data = await client.paginated(random.string(32))

      expect(data).to.deep.equal([page1, page2, page3])
    })
  })
})
