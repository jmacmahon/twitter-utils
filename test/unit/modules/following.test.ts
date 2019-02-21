import { expect, AssertionError } from 'chai'
import { random } from 'reproducible-random'
import { Following, defaults } from '../../../src/modules/following'
import { TwitterClient } from '../../../src/twitterApiClient'
import { randomUser } from '../dataGeneration'
import { dump } from '../../../src/userList/dump'

const fakeTwitterApiClient = (usersToReturn: TwitterClient.User[]): TwitterClient.GetFriends => ({
  getFriends: () => {
    return Promise.resolve(usersToReturn)
  }
})

describe('following', () => {
  it('rejects if the Twitter client rejects', () => {
    const err = new Error(random.string(32))
    const fakeTwitterApiClient: TwitterClient.GetFriends = {
      getFriends: () => Promise.reject(err)
    }
    const following = new Following(fakeTwitterApiClient)

    return expect(following.run({ user: random.string(32) })).to.be.rejectedWith(err)
  })

  it('calls twitterclient.getFriends with the passed username', async () => {
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
    await following.run({ user: usernameToCall })

    expect(usernameCalled).to.equal(usernameToCall)
  })

  it('should dump to console if no out file param is passed', async () => {
    const usersToReturn: TwitterClient.User[] = [randomUser()]
    const apiClient = fakeTwitterApiClient(usersToReturn)

    const logLines: unknown[][] = []
    const fakeConsoleLog = (...messages: unknown[]) => {
      logLines.push(messages)
    }

    const following = new Following(apiClient, { ...defaults, consoleLog: fakeConsoleLog })
    await following.run({ user: randomUser().screen_name })

    expect(logLines.length).to.equal(1)
    const firstLogLine = logLines[0]
    expect(firstLogLine.length).to.equal(1)
    const firstLogLineFirstPart = firstLogLine[0]
    if (typeof firstLogLineFirstPart !== 'string') { throw new AssertionError('Log was not a string') }
    expect(JSON.parse(firstLogLineFirstPart) as unknown).to.deep.equal(usersToReturn)
  })

  it('should dump to file if out file param is passed', async () => {
    const usersToReturn: TwitterClient.User[] = [randomUser()]
    const apiClient = fakeTwitterApiClient(usersToReturn)
    const givenFile = random.string(32)

    let capturedFile: string | undefined
    let capturedUsers: TwitterClient.User[] | undefined
    const fakeDump: typeof dump = async (file, users) => {
      capturedFile = file
      capturedUsers = users
    }

    const following = new Following(apiClient, { ...defaults, userListDump: fakeDump })
    await following.run({ user: randomUser().screen_name, out: givenFile })

    expect(capturedFile).to.equal(givenFile)
    expect(capturedUsers).to.deep.equal(usersToReturn)
  })
})
