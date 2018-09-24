import { random } from 'reproducible-random'
import { TwitterClient } from '../../src/twitterApiClient'

export const randomUser = (prefix = ''): TwitterClient.User => ({
  id_str: random.integer(1e6, 1e7 - 1).toString(),
  screen_name: prefix + random.string(24),
  name: random.string(32)
})
