import { expect } from 'chai'
import { random } from 'reproducible-random'
import { Following } from '../../../src/modules/following'
import { TwitterClient } from '../../../src/twitterApiClient'
import { randomUser } from '../dataGeneration'

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
    const usersToReturn: TwitterClient.User[] = [randomUser()]
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
