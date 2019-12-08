import { config } from 'dotenv'
import Twit from 'twit'
import { Primitive, validate } from 'validate-typescript'
import { CommandParsing } from '../src/commandParsing'
import { Dict } from '../src/dict'
import { Module } from '../src/module'
import { Following } from '../src/modules/following'
import { FollowingDiff } from '../src/modules/followingDiff'
import { MuteRetweets } from '../src/modules/muteRetweets'
import { TwitterClient } from '../src/twitterApiClient'

config()

type Env = {
  CONSUMER_KEY: string
  CONSUMER_SECRET: string
  ACCESS_TOKEN?: string
  ACCESS_TOKEN_SECRET?: string
}
const Env = (): Env => ({
  CONSUMER_KEY: Primitive(String),
  CONSUMER_SECRET: Primitive(String),
  ACCESS_TOKEN: Primitive(String),
  ACCESS_TOKEN_SECRET: Primitive(String)
})

async function main () {
  const env = validate(Env(), process.env)
  const twit = new Twit({
    consumer_key: env.CONSUMER_KEY,
    consumer_secret: env.CONSUMER_SECRET,
    access_token: env.ACCESS_TOKEN,
    access_token_secret: env.ACCESS_TOKEN_SECRET
  })
  const client = new TwitterClient(twit)
  const modules: Dict<Module> = {
    'following-diff': new FollowingDiff(client),
    'following': new Following(client),
    'mute-retweets': new MuteRetweets(client)
  }

  const fullCommand = CommandParsing.parseCommand(process.argv)
  if (fullCommand.command in modules) {
    await modules[fullCommand.command]!.run(fullCommand.params)
  } else {
    throw new Error(`no such command: ${fullCommand.command}`)
  }
}

main().catch(console.error)
