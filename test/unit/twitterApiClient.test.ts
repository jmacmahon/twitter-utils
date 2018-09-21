// tslint:disable await-promise
import { random } from 'reproducible-random'
import { expect } from 'chai'
import { TwitterClient } from '../../src/twitterApiClient'
import { Dict } from '../../src/dict'

const noop = () => undefined

describe('Twitter API client wrapper', () => {
  describe('getFriends', () => {
    it('should reject if Twit rejects', () => {
      const error = new Error(random.string(32))
      const fakeTwit = {
        get: () => Promise.reject(error)
      }
      const twitter = new TwitterClient(fakeTwit)
      return expect(twitter.getFriends()).to.be.rejectedWith(error)
    })

    it('should call Twit with friends/list endpoint', async () => {
      let actualEndpoint: string | undefined
      const fakeTwit: TwitterClient.TwitLike = {
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
        const fakeTwit = { get: () => Promise.resolve({ data }) }
        return new TwitterClient(fakeTwit)
      }

      const test1 = buildTwitterClient({})
      await expect(test1.getFriends()).to.be.rejectedWith(Error)
      const test2 = buildTwitterClient({ users: 0 })
      await expect(test2.getFriends()).to.be.rejectedWith(Error)
      const test3 = buildTwitterClient({ users: [{}] })
      await expect(test3.getFriends()).to.be.rejectedWith(Error)
    })
  })
})
