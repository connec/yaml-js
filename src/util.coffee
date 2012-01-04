@is_empty = (obj) ->
  return obj.length is 0 if Array.isArray(obj) or typeof obj is 'string'
  return false for own key of obj
  return true