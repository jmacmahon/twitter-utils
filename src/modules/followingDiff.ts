import { Primitive, validate } from 'validate-typescript'
import { Dict, dictValues } from '../dict'
import { Module } from '../module'
import { TwitterClient } from '../twitterApiClient'

type Params = {
  userA: string
  userB: string
}
const Params = (): Params => ({
  userA: Primitive(String),
  userB: Primitive(String)
})

export class FollowingDiff implements Module {
  constructor (private client: TwitterClient.GetFriends) { }

  public async getIntersection (userA: string, userB: string): Promise<FollowingDiff.Diff<TwitterClient.User>> {
    const followersA = await this.client.getFriends(userA)
    const followersB = await this.client.getFriends(userB)
    return FollowingDiff.diffBy(followersA, followersB, user => user.id_str)
  }

  async run (rawParams: Dict<unknown>) {
    const params = validate(Params(), rawParams)
    const intersection = await this.getIntersection(params.userA, params.userB)
    console.log(JSON.stringify(intersection, null, 2))
  }
}

export namespace FollowingDiff {
  export type Diff<T> = {
    left: T[],
    middle: T[],
    right: T[]
  }

  export function diffBy<T> (listA: T[], listB: T[], hash: (elem: T) => string): Diff<T> {
    const hashesOfA: Dict<T> = {}
    const hashesOfBoth: Dict<T> = {}
    const hashesOfOnlyB: Dict<T> = {}
    const hashesOfOnlyA: Dict<T> = {}
    listA.forEach((elemOfA) => {
      hashesOfA[hash(elemOfA)] = elemOfA
    })
    listB.forEach((elemOfB) => {
      const hashOfB = hash(elemOfB)
      if (hashOfB in hashesOfA) {
        hashesOfBoth[hashOfB] = elemOfB
      } else {
        hashesOfOnlyB[hashOfB] = elemOfB
      }
    })
    listA.forEach((elemOfA) => {
      const hashOfA = hash(elemOfA)
      if (!(hashOfA in hashesOfBoth)) {
        hashesOfOnlyA[hashOfA] = elemOfA
      }
    })

    return {
      left: dictValues(hashesOfOnlyA),
      middle: dictValues(hashesOfBoth),
      right: dictValues(hashesOfOnlyB)
    }
  }
}
