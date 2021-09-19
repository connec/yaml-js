⚠️Abandoned
---

This project is now abandoned and the repository archived.
The license should allow you to fork and do whatever you want, in case you cannot migrate to a different YAML library.

Fun history fact: when I made the port there wasn't another pure JS YAML parser - the [initial commit](https://github.com/connec/yaml-js/commit/5b493a680e20d15ef2139ac7b8f1096c185cca51) for this repo was just a couple of days before the [initial release of js-yaml](https://www.npmjs.com/package/js-yaml/v/0.2.0)!

yaml-js
===

yaml-js is a YAML loader and dumper, ported pretty much line-for-line from
[PyYAML](http://pyyaml.org/).  The goal for the project is to maintain a reliable and
specification-complete YAML processor in pure Javascript, with CoffeeScript source code.  You can
try it out [here](http://connec.github.io/yaml-js/).

Loading is stable and well-used, and passes the [yaml-spec](https://github.com/connec/yaml-spec)
test suite, which fairly thoroughly covers the YAML 'core' schema.

Dumping is present but very lightly tested (auto-tests only, no significant usage).  The output
should therefore be correct YAML, however formatting is currently entirely untested.

How Do I Get It?
---

    npm install yaml-js

How Do I Use It?
---

```javascript
// Server (e.g. node.js)
var yaml = require('yaml-js');

// Browser
// <script src='yaml.min.js'></script>

// Loading
console.log(yaml.load(
  '---\n' +
  'phrase1:\n' +
  '  - hello\n' +
  '  - &world world\n' +
  'phrase2:\n' +
  '  - goodbye\n' +
  '  - *world\n' +
  'phrase3: >\n' +
  '  What is up\n' +
  '  in this place.'
));
// { phrase1: [ 'hello', 'world' ],
//   phrase2: [ 'goodbye', 'world' ],
//   phrase3: 'What is up in this place.' }

// Dumping
console.log(yaml.dump({
  phrase1: [ 'hello',   'world' ],
  phrase2: [ 'goodbye', 'world' ],
  phrase3: 'What is up in this place.'
}));
// phrase1: [hello, world]
// phrase2: [goodbye, world]
// phrase3: What is up in this place.
```

### API summary

| Method          | Description                                                                                     |
|-----------------|-------------------------------------------------------------------------------------------------|
| **`load`**      | Parse the first YAML document in a stream and produce the corresponding Javascript object.      |
| **`dump`**      | Serialize a Javascript object into a YAML stream.                                               |
| `load_all`      | Parse all YAML documents in a stream and produce the corresponing Javascript objects.           |
| `dump_all`      | Serialize a sequence of Javascript objects into a YAML stream.                                  |
| `scan`          | Scan a YAML stream and produce tokens.                                                          |
| `parse`         | Parse a YAML stream and produce events.                                                         |
| `compose`       | Parse the first YAML document in a stream and produce the corresponding representation tree.    |
| `compose_all`   | Parse all YAML documents in a stream and produce corresponding representation trees.            |
| `emit`          | Emit YAML parsing events into a stream.                                                         |
| `serialize`     | Serialize a representation tree into a YAML stream.                                             |
| `serialize_all` | Serialize a sequence of representation trees into a YAML stream.                                |

License
---

[WTFPL](http://sam.zoy.org/wtfpl/)
