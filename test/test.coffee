_    = require 'underscore'
fs   = require 'fs'
yaml = require '../src/yaml'

spec =
  generic:    JSON.parse fs.readFileSync(__dirname + '/yaml-spec/spec.json').toString()
  javascript: require './yaml-spec/platform/javascript'

for type, suite of spec
  for name, tests of suite
    output = "#{name}\n  "
    for test in tests
      try
        result = yaml.load test.yaml
        if result == test.result
          output += '.'
        else if _.isEqual result, test.result
          output += '.'
        else if isNaN result and isNaN test.result
          output += '.'
        else
          output += """
            F
                yaml: #{test.yaml}
                expected: #{JSON.stringify test.result}
                received: #{JSON.stringify result}

          """
      catch error
        output += """
          E
              yaml: #{test.yaml}
              message: #{error}

        """
    console.log output