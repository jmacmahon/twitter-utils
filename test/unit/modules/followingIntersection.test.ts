import { TwitterClient } from '../../../src/twitterApiClient'
import { random } from 'reproducible-random'
import { FollowingIntersection } from '../../../src/modules/followingIntersection'
import { expect } from 'chai'

describe('followingIntersection', () => {
  it('rejects if the Twitter client rejects', () => {
    const err = new Error(random.string(32))
    const fakeTwitterApiClient: TwitterClient.GetFriends = {
      getFriends: () => Promise.reject(err)
    }
    const followingIntersection = new FollowingIntersection(fakeTwitterApiClient)

    return expect(followingIntersection.getIntersection(random.string(32), random.string(32))).to.be.rejectedWith(err)
  })

  it('should call getFriends with the provided users', async () => {
    const user1 = random.string(32)
    const user2 = random.string(32)

    const usernames: (string | undefined)[] = []
    const fakeTwitterApiClient: TwitterClient.GetFriends = {
      getFriends: (username) => {
        usernames.push(username)
        return Promise.resolve([])
      }
    }
    const followingIntersection = new FollowingIntersection(fakeTwitterApiClient)

    await followingIntersection.getIntersection(user1, user2)
    expect(usernames).to.include(user1)
    expect(usernames).to.include(user2)
  })

  it('returns the intersection of the results of calls to getFriends', async () => {
    const user1: TwitterClient.User = { id: random.integer(1e6, 1e7 - 1), screen_name: `user1-${random.string(32)}` }
    const user2: TwitterClient.User = { id: random.integer(1e6, 1e7 - 1), screen_name: `user2-${random.string(32)}` }
    const user3: TwitterClient.User = { id: random.integer(1e6, 1e7 - 1), screen_name: `user3-${random.string(32)}` }
    const user4: TwitterClient.User = { id: random.integer(1e6, 1e7 - 1), screen_name: `user4-${random.string(32)}` }

    let count = 0
    const fakeTwitterApiClient: TwitterClient.GetFriends = {
      getFriends: async () => {
        count += 1
        switch (count) {
          case 1:
            return [user1, user2, user3]
          case 2:
            return [user3, user4]
          default:
            throw new Error('should not be called more than twice')
        }
      }
    }
    const followingIntersection = new FollowingIntersection(fakeTwitterApiClient)

    const intersection = await followingIntersection.getIntersection(random.string(32), random.string(32))
    expect(intersection).to.deep.equal([user3])
  })
})
