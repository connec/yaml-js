{Reader}      = require './reader'
{Scanner}     = require './scanner'
{Parser}      = require './parser'
{Composer}    = require './composer'
{Resolver}    = require './resolver'
{Constructor} = require './constructor'

class @Loader
  for klass in [Reader, Scanner, Parser, Composer, Resolver, Constructor]
    @::[key] = value for key, value of klass::
  
  constructor: (string) ->
    Reader.call      @, string
    Scanner.call     @
    Parser.call      @
    Composer.call    @
    Resolver.call    @
    Constructor.call @