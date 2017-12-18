class @Event
  constructor: (@start_mark, @end_mark) ->

class @NodeEvent extends @Event
  constructor: (@anchor, start_mark, end_mark) ->
    super start_mark, end_mark

class @CollectionStartEvent extends @NodeEvent
  constructor: (anchor, @tag, @implicit, start_mark, end_mark, @flow_style) ->
    super anchor, start_mark, end_mark

class @CollectionEndEvent extends @Event

class @StreamStartEvent extends @Event
  constructor: (start_mark, end_mark, @encoding) ->
    super start_mark, end_mark

class @StreamEndEvent extends @Event

class @DocumentStartEvent extends @Event
  constructor: (start_mark, end_mark, @explicit, @version, @tags) ->
    super start_mark, end_mark

class @DocumentEndEvent extends @Event
  constructor: (start_mark, end_mark, @explicit) ->
    super start_mark, end_mark

class @AliasEvent extends @NodeEvent

class @ScalarEvent extends @NodeEvent
  constructor: (anchor, @tag, @implicit, @value, start_mark, end_mark, @style) ->
    super anchor, start_mark, end_mark

class @SequenceStartEvent extends @CollectionStartEvent

class @SequenceEndEvent extends @CollectionEndEvent

class @MappingStartEvent extends @CollectionStartEvent

class @MappingEndEvent extends @CollectionEndEvent
