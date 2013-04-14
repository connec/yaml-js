yaml = require '..'

spec =
  generic:    require './yaml-spec/spec'
  javascript: require './yaml-spec/platform/javascript'

for type, suite of spec
  for name, tests of suite
    describe name, ->
      for test, i in tests
        it "##{i + 1}", ->
          expect( yaml.load test.yaml ).to.deep.equal test.result