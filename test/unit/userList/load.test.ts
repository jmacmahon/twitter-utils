import { ReadFileLike, load } from '../../../src/userList/load'
import { expect } from 'chai'
import { TwitterClient } from '../../../src/twitterApiClient'
import { randomUser } from '../dataGeneration'
import { random } from 'reproducible-random'

const dummyFile = {
  type: 'user-list',
  version: 1
}

describe('user list dump', () => {
  it('should reject if readFile fails', () => {
    const error = new Error(random.string(32))
    const failingReadFile: ReadFileLike = (file, options, callback) => {
      callback(error)
    }
    return expect(load('', { readFile: failingReadFile })).to.be.rejectedWith(error)
  })

  it('should passthrough file parameter and specify utf-8', async () => {
    const givenFile = random.string(32)

    let capturedOptions: { encoding: string } | undefined | null
    let capturedFile: string | undefined
    const readFile: ReadFileLike = (file, options, callback) => {
      capturedFile = file
      capturedOptions = options
      callback(undefined, JSON.stringify(dummyFile))
    }
    await load(givenFile, { readFile })
    expect(capturedFile).to.equal(givenFile)
    expect(capturedOptions).to.deep.equal({ encoding: 'utf8' })
  })

  it('should reject if the data was not JSON-parseable', () => {
    const badData = random.string(32)
    const readFile: ReadFileLike = (file, options, callback) => {
      callback(undefined, badData)
    }
    return expect(load('', { readFile })).to.be.rejectedWith(Error, 'File was not JSON')
  })

  it('should reject if the file format is incorrect (wrong type, missing properties)', async () => {
    const testCases = [
      1,
      [],
      {},
      { type: 1, version: 1 },
      { type: 'not-user-list', version: 1 }
    ]
    for (const testCase of testCases) {
      const readFile: ReadFileLike = (file, options, callback) => {
        callback(undefined, JSON.stringify(testCase))
      }
      // tslint:disable-next-line:await-promise
      await expect(load('', { readFile })).to.be.rejectedWith(Error, 'Invalid file format')
    }
  })

  it('should reject if the version was >1', async () => {
    const testCases = [
      { type: 'user-list' },
      { type: 'user-list', version: random.pick(['1', true, null, {}, []]) },
      { type: 'user-list', version: 2 }
    ]
    for (const testCase of testCases) {
      const readFile: ReadFileLike = (file, options, callback) => {
        callback(undefined, JSON.stringify(testCase))
      }
      // tslint:disable-next-line:await-promise
      await expect(load('', { readFile })).to.be.rejectedWith(Error, 'Unsupported version')
    }
  })

  it('should return the user list', () => {
    const users: TwitterClient.User[] = [
      randomUser(),
      randomUser(),
      randomUser(),
      randomUser()
    ]
    const readFile: ReadFileLike = (file, options, callback) => {
      callback(undefined, JSON.stringify({
        type: 'user-list',
        version: 1,
        users
      }))
    }
    return expect(load('', { readFile })).to.eventually.deep.equal(users)
  })
})
