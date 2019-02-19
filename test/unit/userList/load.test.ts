import { ReadFileLike, load } from '../../../src/userList/load'
import { expect } from 'chai'
import { TwitterClient } from '../../../src/twitterApiClient'

const dummyFile = {
  type: 'user-list',
  version: 1
}

describe('user list dump', () => {
  it('should reject if readFile fails', () => {
    const error = new Error('an error')
    const failingReadFile: ReadFileLike = (file, options, callback) => {
      callback(error)
    }
    return expect(load('', { readFile: failingReadFile })).to.be.rejectedWith(error)
  })

  it('should passthrough file parameter and specify utf-8', async () => {
    const givenFile = 'a filename'

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
    const badData = 'not valid JSON'
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
      { type: 'user-list', version: '1' },
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
      { id_str: '123456789', screen_name: 'abcdef', name: 'Lord Abc of Def' },
      { id_str: '234567891', screen_name: 'bcdefa', name: 'Lord Bcd of Efa' }
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
