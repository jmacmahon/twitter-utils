import { config } from 'dotenv'
import Twit from 'twit'
import { TwitterClient } from '../src/twitterApiClient'
import { JsonExtractor } from '@evergreen-smart-power/validation-tools'
import { FollowingIntersection } from '../src/modules/followingIntersection'
import { CommandParsing } from '../src/commandParsing'
import { Dict } from '../src/dict'
import { Module } from '../src/module'

config()

async function main () {
  const envExtractor = new JsonExtractor(process.env)
  const env = {
    ...envExtractor.stringValue('CONSUMER_KEY'),
    ...envExtractor.stringValue('CONSUMER_SECRET'),
    ...envExtractor.optionalStringValue('ACCESS_TOKEN'),
    ...envExtractor.optionalStringValue('ACCESS_TOKEN_SECRET')
  }
  const twit = new Twit({
    consumer_key: env.CONSUMER_KEY,
    consumer_secret: env.CONSUMER_SECRET,
    access_token: env.ACCESS_TOKEN,
    access_token_secret: env.ACCESS_TOKEN_SECRET
  })
  const client = new TwitterClient(twit)
  const modules: Dict<Module> = {
    'following-intersection': new FollowingIntersection(client)
  }

  const fullCommand = CommandParsing.parseCommand(process.argv)
  if (fullCommand.command in modules) {
    await modules[fullCommand.command]!.run(fullCommand.params)
  } else {
    throw new Error(`no such command: ${fullCommand.command}`)
  }
}

main().catch(console.error)
