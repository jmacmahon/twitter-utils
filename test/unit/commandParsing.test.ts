import { expect } from 'chai'
import { CommandParsing } from '../../src/commandParsing'
import { random } from 'reproducible-random'

describe('command parsing', () => {
  it('should error if it could not find a command', () => {
    const tests = [
      () => CommandParsing.parseCommand(['node', '/path/to/file.js']),
      () => CommandParsing.parseCommand(['/path/to/file.js'])
    ]

    tests.forEach(test => expect(test).to.throw(Error, 'no command specified'))
  })

  it('should return an object with the "command" field set to the specified command', () => {
    const command = random.string(10)
    expect(CommandParsing.parseCommand(['node', '/path/to/file', command]).command).to.equal(command)
  })

  it('should return the --params as key-value pairs or flags', () => {
    const command = random.string(10)
    const baseParams = random.pick([['node', '/path/to/file.js'], ['/path/to/file.js']])
    expect(CommandParsing.parseCommand([
      ...baseParams,
      command,
      '--foo', 'bar',
      '--baz', 'quux'
    ]).params).to.deep.include({
      foo: 'bar',
      baz: 'quux'
    })
    expect(CommandParsing.parseCommand([
      ...baseParams,
      command,
      '--foo', 'bar',
      '--bafu',
      '--baz', 'quux',
      '--fubar'
    ]).params).to.deep.include({
      foo: 'bar',
      baz: 'quux',
      fubar: true,
      bafu: true
    })
  })
})
