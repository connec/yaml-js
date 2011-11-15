_    = require 'underscore'
fs   = require 'fs'
yaml = require '../src/yaml'

spec = JSON.parse fs.readFileSync(__dirname + '/yaml-spec/spec.json').toString()

for name, tests of spec
  output = "#{name}\n  "
  for test in tests
    try
      result = yaml.load test.yaml
      if result == test.json
        output += '.'
      else if _.isEqual result, test.json
        output += '.'
      else if isNaN result and isNaN test.json
        output += '.'
      else
        output += """
          F
              yaml: #{test.yaml}
              expected: #{JSON.stringify test.json}
              received: #{JSON.stringify result}
            
          """
    catch error
      output += """
        E
            yaml: #{test.yaml}
            message: #{error}
          
        """
  console.log output