util        = require './util'
reader      = require './reader'
scanner     = require './scanner'
parser      = require './parser'
composer    = require './composer'
resolver    = require './resolver'
constructor = require './constructor'

@make_loader = (Reader = reader.Reader, Scanner = scanner.Scanner, Parser = parser.Parser,
    Composer = composer.Composer, Resolver = resolver.Resolver,
    Constructor = constructor.Constructor) ->
  components = [ Reader, Scanner, Parser, Composer, Resolver, Constructor ]
  class Loader
    util.extend @prototype, (component.prototype for component in components)...

    constructor: (stream) ->
      components[0]::initialise.call @, stream
      component::initialise.call @ for component in components[1..]

@Loader = @make_loader()
