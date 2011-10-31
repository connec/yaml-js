class module.exports
  
  {Loader} = require './loader'
  
  ###
  Scan a YAML stream and produce scanning tokens.
  ###
  @scan: (stream) ->
    loader = new Loader stream
    loader.get_token() while loader.check_token()
  
  ###
  Parse a YAML stream and produce parsing events.
  ###
  @parse: (stream) ->
    loader = new Loader stream
    loader.get_event() while loader.check_event()
  
  ###
  Parse the first YAML document in a stream and produce the corresponding
  representation tree.
  ###
  @compose: (stream) ->
    loader = new Loader stream
    return loader.get_single_node()
  
  ###
  Parse all YAML documents in a stream and produce corresponding representation
  trees.
  ###
  @compose_all: (stream) ->
    loader = new Loader stream
    loader.get_node() while loader.check_node()
  
  ###
  Parse the first YAML document in a stream and produce the corresponding
  Javascript object.
  ###
  @load: (stream) ->
    loader = new Loader stream
    loader.get_single_data()