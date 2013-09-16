###
A small class to stand-in for a stream when you simply want to write to a string.
###
class @StringStream
  constructor: ->
    @string = ''

  write: (chunk) ->
    @string += chunk

@clone = (obj) =>
  @extend {}, obj

@extend = (destination, sources...) ->
  destination[k] = v for k, v of source for source in sources
  destination

@is_empty = (obj) ->
  return obj.length is 0 if Array.isArray(obj) or typeof obj is 'string'
  return false for own key of obj
  return true

@to_hex = (num, min_size) ->
  num    = num.charCodeAt 0 if typeof num is 'string'
  result = num.toString 16
  if result.size < min_size
    "#{new Array(result.size - min_size + 1).join '0'}#{result}"
  else
    result