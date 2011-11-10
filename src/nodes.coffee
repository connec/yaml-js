class module.exports
  
  _ = require 'underscore'
  
  class @Node
    constructor: (@tag, @value, @start_mark, @end_mark) ->
      @unique_id = _.uniqueId 'node_'
  
  class @ScalarNode extends @Node
    id: 'scalar'
    constructor: (@tag, @value, @start_mark, @end_mark, @style) ->
      super
  
  class @CollectionNode extends @Node
    constructor: (@tag, @value, @start_mark, @end_mark, @flow_style) ->
      super
  
  class @SequenceNode extends @CollectionNode
    id: 'sequence'
  
  class @MappingNode extends @CollectionNode
    id: 'mapping'