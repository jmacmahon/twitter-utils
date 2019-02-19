import { dump } from '../../src/userList/dump'
import { constants, accessSync, unlinkSync } from 'fs'
import { expect } from 'chai'
import { TwitterClient } from '../../src/twitterApiClient'
import { load } from '../../src/userList/load'
import { randomUser } from '../unit/dataGeneration'

describe('user list loading and saving', () => {
  const filePath = '/tmp/dump-testfile.userlist.json'

  afterEach(() => {
    try {
      unlinkSync(filePath)
    } catch (error) {
      // pass
    }
  })

  it('should save to a file', async () => {
    await dump(filePath, [])
    expect(() => accessSync(filePath, constants.F_OK)).to.not.throw()
  })

  it('should roundtrip', async () => {
    const users: TwitterClient.User[] = [
      randomUser(),
      randomUser(),
      randomUser(),
      randomUser()
    ]
    await dump(filePath, users)
    return expect(load(filePath)).to.eventually.deep.equal(users)
  })
})
