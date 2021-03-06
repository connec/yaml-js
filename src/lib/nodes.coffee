unique_id = 0

class @Node
  constructor: (@tag, @value, @start_mark, @end_mark) ->
    @unique_id = "node_#{unique_id++}"

class @ScalarNode extends @Node
  id: 'scalar'
  constructor: (tag, value, start_mark, end_mark, @style) ->
    super tag, value, start_mark, end_mark

class @CollectionNode extends @Node
  constructor: (tag, value, start_mark, end_mark, @flow_style) ->
    super tag, value, start_mark, end_mark

class @SequenceNode extends @CollectionNode
  id: 'sequence'

class @MappingNode extends @CollectionNode
  id: 'mapping'
