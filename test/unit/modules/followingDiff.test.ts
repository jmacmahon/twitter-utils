import { expect } from 'chai'
import { random } from 'reproducible-random'
import { FollowingDiff } from '../../../src/modules/followingDiff'
import { TwitterClient } from '../../../src/twitterApiClient'
import { randomUser } from '../dataGeneration'

describe('followingDiff module', () => {
  it('rejects if the Twitter client rejects', () => {
    const err = new Error(random.string(32))
    const fakeTwitterApiClient: TwitterClient.GetFriends = {
      getFriends: () => Promise.reject(err)
    }
    const followingIntersection = new FollowingDiff(fakeTwitterApiClient)

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
    const followingIntersection = new FollowingDiff(fakeTwitterApiClient)

    await followingIntersection.getIntersection(user1, user2)
    expect(usernames).to.include(user1)
    expect(usernames).to.include(user2)
  })

  it('returns the intersection, left-only and right-only followers', async () => {
    const user1: TwitterClient.User = randomUser('user1')
    const user2: TwitterClient.User = randomUser('user2')
    const user3: TwitterClient.User = randomUser('user3')
    const user4: TwitterClient.User = randomUser('user4')

    const userA = random.string(32)
    const userB = random.string(32)
    const fakeTwitterApiClient: TwitterClient.GetFriends = {
      getFriends: async (username) => {
        switch (username) {
          case userA:
            return [user1, user2, user3]
          case userB:
            return [user3, user4]
          default:
            throw new Error('called with a bad username')
        }
      }
    }
    const followingIntersection = new FollowingDiff(fakeTwitterApiClient)

    const intersection = await followingIntersection.getIntersection(userA, userB)

    expect(intersection.left.length).to.equal(2)
    expect(intersection.left).to.include(user1)
    expect(intersection.left).to.include(user2)

    expect(intersection.middle.length).to.equal(1)
    expect(intersection.middle).to.include(user3)

    expect(intersection.right.length).to.equal(1)
    expect(intersection.right).to.include(user4)
  })
})
