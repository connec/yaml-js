util          = require './util'
{Reader}      = require './reader'
{Scanner}     = require './scanner'
{Parser}      = require './parser'
{Composer}    = require './composer'
{Resolver}    = require './resolver'
{Constructor} = require './constructor'

@make_loader = (Reader, Scanner, Parser, Composer, Resolver, Constructor) -> class
  util.extend.apply util, [@::].concat (arg.prototype for arg in arguments)
  
  constructor: (stream) ->
    Reader.call      @, stream
    Scanner.call     @
    Parser.call      @
    Composer.call    @
    Resolver.call    @
    Constructor.call @

@Loader = @make_loader Reader, Scanner, Parser, Composer, Resolver, Constructor