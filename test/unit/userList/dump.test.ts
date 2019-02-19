import { dump, WriteFileLike } from '../../../src/userList/dump'
import { expect } from 'chai'
import { TwitterClient } from '../../../src/twitterApiClient'
import { random } from 'reproducible-random'
import { randomUser } from '../dataGeneration'

describe('user list dump', () => {
  it('should reject if writeFile fails', () => {
    const error = new Error(random.string(32))
    const failingWriteFile: WriteFileLike = (file, data, callback) => {
      callback(error)
    }
    const injections = { writeFile: failingWriteFile }
    return expect(dump('', [], injections)).to.be.rejectedWith(error)
  })

  it('should passthrough file parameter', async () => {
    const givenFile = random.string(32)

    let capturedFile: string | undefined
    const writeFile: WriteFileLike = (file, data, callback) => {
      capturedFile = file
      callback()
    }
    await dump(givenFile, [], { writeFile })
    expect(capturedFile).to.equal(givenFile)
  })

  it('should write a JSON object with a type and a version', async () => {
    let capturedData: string | undefined
    const writeFile: WriteFileLike = (file, data, callback) => {
      capturedData = data
      callback()
    }
    await dump('', [], { writeFile })
    expect(capturedData).to.not.equal(undefined)
    const parsed = JSON.parse(capturedData!) as unknown
    expect(parsed).to.deep.include({
      type: 'user-list',
      version: 1
    })
  })

  it('should write a JSON object containing the passed in list of users', async () => {
    let capturedData: string | undefined
    const writeFile: WriteFileLike = (file, data, callback) => {
      capturedData = data
      callback()
    }
    const givenUsers: TwitterClient.User[] = [
      randomUser(),
      randomUser(),
      randomUser(),
      randomUser()
    ]

    await dump('', givenUsers, { writeFile })

    expect(capturedData).to.not.equal(undefined)
    const parsed = JSON.parse(capturedData!) as unknown
    expect(parsed).to.deep.include({
      users: givenUsers
    })
  })
})
