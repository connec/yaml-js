class module.exports
  
  class @Node
    constructor: (@tag, @value, @start_mark, @end_mark) ->
  
  class @ScalarNode extends @Node
    id: 'scalar'
    constructor: (@tag, @value, @start_mark, @end_mark, @style) ->
  
  class @CollectionNode extends @Node
    constructor: (@tag, @value, @start_mark, @end_mark, @flow_style) ->
  
  class @SequenceNode extends @CollectionNode
    id: 'sequence'
  
  class @MappingNode extends @CollectionNode
    id: 'mapping'