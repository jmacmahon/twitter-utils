import { expect } from 'chai'
import { TwitterClient } from '../../../src/twitterApiClient'
import { random } from 'reproducible-random'
import { Following } from '../../../src/modules/following'

describe('following', () => {
  it('rejects if the Twitter client rejects', () => {
    const err = new Error(random.string(32))
    const fakeTwitterApiClient: TwitterClient.GetFriends = {
      getFriends: () => Promise.reject(err)
    }
    const following = new Following(fakeTwitterApiClient)

    return expect(following.getFollowing(random.string(32))).to.be.rejectedWith(err)
  })

  it('wraps .getFriends', async () => {
    const usersToReturn: TwitterClient.User[] = [{ id: random.integer(1e6, 1e7 - 1), screen_name: random.string(32) }]
    const usernameToCall = random.string(32)
    let usernameCalled: string | undefined
    const fakeTwitterApiClient: TwitterClient.GetFriends = {
      getFriends: (username) => {
        usernameCalled = username
        return Promise.resolve(usersToReturn)
      }
    }
    const following = new Following(fakeTwitterApiClient)
    const usersReturned = await following.getFollowing(usernameToCall)

    expect(usernameCalled).to.equal(usernameToCall)
    expect(usersReturned).to.equal(usersToReturn)
  })
})
