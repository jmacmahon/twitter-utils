import { endsWith } from 'lodash'
import { Dict } from './dict'

export namespace CommandParsing {
  export type Command = {
    command: string,
    params: Dict<unknown>
  }

  export function parseCommand (args: string[]): Command {
    const strippedArgs = endsWith(args[0], 'node') ? args.slice(2) : args.slice(1)
    if (strippedArgs.length === 0) {
      throw new Error('no command specified')
    }

    return { command: strippedArgs[0], params: parseParams(strippedArgs.slice(1)) }
  }
}

function parseParams (params: string[]): Dict<unknown> {
  let outParams: Dict<unknown> = {}
  params.forEach((param, index) => {
    outParams = {
      ...outParams,
      ...getParamPair(params.slice(index))
    }
  })
  return outParams
}

function getParamPair (params: string[]): Dict<unknown> {
  if (params.length === 0 || params[0].indexOf('--') !== 0) {
    return {}
  }
  const paramKey = params[0].slice(2)
  if (params.length > 1 && params[1].indexOf('--') !== 0) {
    return { [paramKey]: params[1] }
  }
  return { [paramKey]: true }
}
