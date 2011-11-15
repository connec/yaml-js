yaml-js
===

yaml-js is currently a YAML loader, and eventually a YAML dumper, ported pretty
much line-for-line from [PyYAML](http://pyyaml.org/).  The goal is to create a
reliable and specification-complete YAML processor for Javascript environments.

Current Status
---

Currently loading works well, and passes the
[yaml-spec](https://github.com/connec/yaml-spec) test suite.

Dependencies
---

The library currently depends on
[underscore](http://documentcloud.github.com/underscore/) and
[CoffeeScript](http://jashkenas.github.com/coffee-script/).

How Do I Use It!?
---

```coffeescript
yaml = require './src/yaml'
console.log yaml.load '''
  ---
  phrase1:
    - hello
    - &world world
  phrase2:
    - goodbye
    - *world
  phrase3: >
    What is up
    in this place.
  '''
# { phrase1: [ 'hello', 'world' ],
#   phrase2: [ 'goodbye', 'world' ],
#   phrase3: 'What is up in this place.' }
```

License
---

[WTFPL](http://sam.zoy.org/wtfpl/)