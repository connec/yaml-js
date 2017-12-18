(function() {
  var MarkedYAMLError, nodes, util,
    indexOf = [].indexOf;

  ({MarkedYAMLError} = require('./errors'));

  nodes = require('./nodes');

  util = require('./util');

  /*
  Thrown for errors encountered during construction.
  */
  this.ConstructorError = class ConstructorError extends MarkedYAMLError {};

  /*
  The constructor class handles the construction of Javascript objects from representation trees
  ({Node}s).

  This uses the methods from {Composer} to process the representation stream, and provides a similar
  stream-like interface to Javascript objects via {BaseConstructor#check_node},
  {BaseConstructor#get_node}, and {BaseConstructor#get_single_node}.
  */
  this.BaseConstructor = (function() {
    var ctor;

    class BaseConstructor {
      constructor() {
        return ctor.apply(this, arguments);
      }

      /*
      Add a constructor function for a specific tag.

      The constructor will be used to turn {Node Nodes} with the given tag into a Javascript object.

      @param tag {String} The tag for which the constructor should apply.
      @param constructor {Function<Node,any>} A function that turns a {Node} with the given tag into a
        Javascript object.
      @return {Function<Node,Any>} Returns the supplied `constructor`.
      */
      static add_constructor(tag, constructor) {
        if (!this.prototype.hasOwnProperty('yaml_constructors')) {
          this.prototype.yaml_constructors = util.extend({}, this.prototype.yaml_constructors);
        }
        return this.prototype.yaml_constructors[tag] = constructor;
      }

      /*
      Add a constructor function for a tag prefix.

      The constructor will be used to turn {Node Nodes} with the given tag prefix into a Javascript
      object.

      @param tag_prefix {String} The tag prefix for which the constructor should apply.
      @param multi_constructor {Function<Node,any>} A function that turns a {Node} with the given tag
      prefix into a Javascript object.
      @return {Function<Node,Any>} Returns the supplied `multi_constructor`.
      */
      static add_multi_constructor(tag_prefix, multi_constructor) {
        if (!this.prototype.hasOwnProperty('yaml_multi_constructors')) {
          this.prototype.yaml_multi_constructors = util.extend({}, this.prototype.yaml_multi_constructors);
        }
        return this.prototype.yaml_multi_constructors[tag_prefix] = multi_constructor;
      }

      /*
      Initialise a new instance.
      */
      initialise() {
        // @param {Object} A map from {Node#unique_id} to the constructed Javascript object for the node.
        this.constructed_objects = {};
        // @param {Array<String>} An array of {Node#unique_id}s that are being constructed.
        this.constructing_nodes = [];
        // @param {Function<any>} An array of functions to be exectied after docmuent construction.
        return this.deferred_constructors = [];
      }

      /*
      Checks if a document can be constructed from the representation stream.

      So long as the representation stream hasn't ended, another document can be constructed.

      @return {Boolean} True if a document can be constructed, false otherwise.
      */
      check_data() {
        return this.check_node();
      }

      /*
      Construct a document from the remaining representation stream.

      {Constructor#check_data} must be called before calling this method.

      @return {any} The next document in the stream. Returns `undefined` if the stream has ended.
      */
      get_data() {
        if (this.check_node()) {
          return this.construct_document(this.get_node());
        }
      }

      /*
      Construct a single document from the entire representation stream.

      @throw {ComposerError} if there's more than one document is in the stream.

      @return {Node} The single document in the stream.
      */
      get_single_data() {
        var node;
        node = this.get_single_node();
        if (node != null) {
          return this.construct_document(node);
        }
        return null;
      }

      /*
      Construct a document node

      @private
      */
      construct_document(node) {
        var data;
        data = this.construct_object(node);
        while (!util.is_empty(this.deferred_constructors)) {
          this.deferred_constructors.pop()();
        }
        return data;
      }

      defer(f) {
        return this.deferred_constructors.push(f);
      }

      construct_object(node) {
        var constructor, object, ref, tag_prefix, tag_suffix;
        if (node.unique_id in this.constructed_objects) {
          return this.constructed_objects[node.unique_id];
        }
        if (ref = node.unique_id, indexOf.call(this.constructing_nodes, ref) >= 0) {
          throw new exports.ConstructorError(null, null, 'found unconstructable recursive node', node.start_mark);
        }
        this.constructing_nodes.push(node.unique_id);
        constructor = null;
        tag_suffix = null;
        if (node.tag in this.yaml_constructors) {
          constructor = this.yaml_constructors[node.tag];
        } else {
          for (tag_prefix in this.yaml_multi_constructors) {
            if (node.tag.indexOf(tag_prefix === 0)) {
              tag_suffix = node.tag.slice(tag_prefix.length);
              constructor = this.yaml_multi_constructors[tag_prefix];
              break;
            }
          }
          if (constructor == null) {
            if (null in this.yaml_multi_constructors) {
              tag_suffix = node.tag;
              constructor = this.yaml_multi_constructors[null];
            } else if (null in this.yaml_constructors) {
              constructor = this.yaml_constructors[null];
            } else if (node instanceof nodes.ScalarNode) {
              constructor = this.construct_scalar;
            } else if (node instanceof nodes.SequenceNode) {
              constructor = this.construct_sequence;
            } else if (node instanceof nodes.MappingNode) {
              constructor = this.construct_mapping;
            }
          }
        }
        object = constructor.call(this, tag_suffix != null ? tag_suffix : node, node);
        this.constructed_objects[node.unique_id] = object;
        this.constructing_nodes.pop();
        return object;
      }

      construct_scalar(node) {
        if (!(node instanceof nodes.ScalarNode)) {
          throw new exports.ConstructorError(null, null, `expected a scalar node but found ${node.id}`, node.start_mark);
        }
        return node.value;
      }

      construct_sequence(node) {
        var child, i, len, ref, results;
        if (!(node instanceof nodes.SequenceNode)) {
          throw new exports.ConstructorError(null, null, `expected a sequence node but found ${node.id}`, node.start_mark);
        }
        ref = node.value;
        results = [];
        for (i = 0, len = ref.length; i < len; i++) {
          child = ref[i];
          results.push(this.construct_object(child));
        }
        return results;
      }

      construct_mapping(node) {
        var i, key, key_node, len, mapping, ref, value, value_node;
        if (!(node instanceof nodes.MappingNode)) {
          throw new ConstructorError(null, null, `expected a mapping node but found ${node.id}`, node.start_mark);
        }
        mapping = {};
        ref = node.value;
        for (i = 0, len = ref.length; i < len; i++) {
          [key_node, value_node] = ref[i];
          key = this.construct_object(key_node);
          if (typeof key === 'object') {
            throw new exports.ConstructorError('while constructing a mapping', node.start_mark, 'found unhashable key', key_node.start_mark);
          }
          value = this.construct_object(value_node);
          mapping[key] = value;
        }
        return mapping;
      }

      construct_pairs(node) {
        var i, key, key_node, len, pairs, ref, value, value_node;
        if (!(node instanceof nodes.MappingNode)) {
          throw new exports.ConstructorError(null, null, `expected a mapping node but found ${node.id}`, node.start_mark);
        }
        pairs = [];
        ref = node.value;
        for (i = 0, len = ref.length; i < len; i++) {
          [key_node, value_node] = ref[i];
          key = this.construct_object(key_node);
          value = this.construct_object(value_node);
          pairs.push([key, value]);
        }
        return pairs;
      }

    };

    /*
    @property {Object} A map from a YAML tag to a constructor function for data with that tag.
    @private
    */
    BaseConstructor.prototype.yaml_constructors = {};

    /*
    @property {Object} A map from a YAML tag prefix to a constructor function for data with that tag
                       prefix.
    @private
    */
    BaseConstructor.prototype.yaml_multi_constructors = {};

    ctor = BaseConstructor.prototype.initialise;

    return BaseConstructor;

  }).call(this);

  this.Constructor = (function() {
    var BOOL_VALUES, TIMESTAMP_PARTS, TIMESTAMP_REGEX;

    class Constructor extends this.BaseConstructor {
      construct_scalar(node) {
        var i, key_node, len, ref, value_node;
        if (node instanceof nodes.MappingNode) {
          ref = node.value;
          for (i = 0, len = ref.length; i < len; i++) {
            [key_node, value_node] = ref[i];
            if (key_node.tag === 'tag:yaml.org,2002:value') {
              return this.construct_scalar(value_node);
            }
          }
        }
        return super.construct_scalar(node);
      }

      flatten_mapping(node) {
        var i, index, j, key_node, len, len1, merge, ref, submerge, subnode, value, value_node;
        merge = [];
        index = 0;
        while (index < node.value.length) {
          [key_node, value_node] = node.value[index];
          if (key_node.tag === 'tag:yaml.org,2002:merge') {
            node.value.splice(index, 1);
            //delete node.value[index]
            if (value_node instanceof nodes.MappingNode) {
              this.flatten_mapping(value_node);
              merge = merge.concat(value_node.value);
            } else if (value_node instanceof nodes.SequenceNode) {
              submerge = [];
              ref = value_node.value;
              for (i = 0, len = ref.length; i < len; i++) {
                subnode = ref[i];
                if (!(subnode instanceof nodes.MappingNode)) {
                  throw new exports.ConstructorError('while constructing a mapping', node.start_mark, `expected a mapping for merging, but found ${subnode.id}`, subnode.start_mark);
                }
                this.flatten_mapping(subnode);
                submerge.push(subnode.value);
              }
              submerge.reverse();
              for (j = 0, len1 = submerge.length; j < len1; j++) {
                value = submerge[j];
                merge = merge.concat(value);
              }
            } else {
              throw new exports.ConstructorError('while constructing a mapping', node.start_mark, `expected a mapping or list of mappings for merging but found ${value_node.id}`, value_node.start_mark);
            }
          } else if (key_node.tag === 'tag:yaml.org,2002:value') {
            key_node.tag = 'tag:yaml.org,2002:str';
            index++;
          } else {
            index++;
          }
        }
        if (merge.length) {
          return node.value = merge.concat(node.value);
        }
      }

      construct_mapping(node) {
        if (node instanceof nodes.MappingNode) {
          this.flatten_mapping(node);
        }
        return super.construct_mapping(node);
      }

      construct_yaml_null(node) {
        this.construct_scalar(node);
        return null;
      }

      construct_yaml_bool(node) {
        var value;
        value = this.construct_scalar(node);
        return BOOL_VALUES[value.toLowerCase()];
      }

      construct_yaml_int(node) {
        var base, digit, digits, i, len, part, ref, sign, value;
        value = this.construct_scalar(node);
        value = value.replace(/_/g, '');
        sign = value[0] === '-' ? -1 : 1;
        if (ref = value[0], indexOf.call('+-', ref) >= 0) {
          value = value.slice(1);
        }
        if (value === '0') {
          return 0;
        } else if (value.indexOf('0b') === 0) {
          return sign * parseInt(value.slice(2), 2);
        } else if (value.indexOf('0x') === 0) {
          return sign * parseInt(value.slice(2), 16);
        } else if (value.indexOf('0o') === 0) {
          return sign * parseInt(value.slice(2), 8);
        } else if (value[0] === '0') {
          return sign * parseInt(value, 8);
        } else if (indexOf.call(value, ':') >= 0) {
          digits = (function() {
            var i, len, ref1, results;
            ref1 = value.split(/:/g);
            results = [];
            for (i = 0, len = ref1.length; i < len; i++) {
              part = ref1[i];
              results.push(parseInt(part));
            }
            return results;
          })();
          digits.reverse();
          base = 1;
          value = 0;
          for (i = 0, len = digits.length; i < len; i++) {
            digit = digits[i];
            value += digit * base;
            base *= 60;
          }
          return sign * value;
        } else {
          return sign * parseInt(value);
        }
      }

      construct_yaml_float(node) {
        var base, digit, digits, i, len, part, ref, sign, value;
        value = this.construct_scalar(node);
        value = value.replace(/_/g, '').toLowerCase();
        sign = value[0] === '-' ? -1 : 1;
        if (ref = value[0], indexOf.call('+-', ref) >= 0) {
          value = value.slice(1);
        }
        if (value === '.inf') {
          return sign * 2e308;
        } else if (value === '.nan') {
          return 0/0;
        } else if (indexOf.call(value, ':') >= 0) {
          digits = (function() {
            var i, len, ref1, results;
            ref1 = value.split(/:/g);
            results = [];
            for (i = 0, len = ref1.length; i < len; i++) {
              part = ref1[i];
              results.push(parseFloat(part));
            }
            return results;
          })();
          digits.reverse();
          base = 1;
          value = 0.0;
          for (i = 0, len = digits.length; i < len; i++) {
            digit = digits[i];
            value += digit * base;
            base *= 60;
          }
          return sign * value;
        } else {
          return sign * parseFloat(value);
        }
      }

      construct_yaml_binary(node) {
        var error, value;
        value = this.construct_scalar(node);
        try {
          if (typeof window !== "undefined" && window !== null) {
            return atob(value);
          }
          return new Buffer(value, 'base64').toString('ascii');
        } catch (error1) {
          error = error1;
          throw new exports.ConstructorError(null, null, `failed to decode base64 data: ${error}`, node.start_mark);
        }
      }

      construct_yaml_timestamp(node) {
        var date, day, fraction, hour, index, key, match, millisecond, minute, month, second, tz_hour, tz_minute, tz_sign, value, values, year;
        value = this.construct_scalar(node);
        match = node.value.match(TIMESTAMP_REGEX);
        values = {};
        for (key in TIMESTAMP_PARTS) {
          index = TIMESTAMP_PARTS[key];
          values[key] = match[index];
        }
        year = parseInt(values.year);
        month = parseInt(values.month) - 1;
        day = parseInt(values.day);
        if (!values.hour) {
          return new Date(Date.UTC(year, month, day));
        }
        hour = parseInt(values.hour);
        minute = parseInt(values.minute);
        second = parseInt(values.second);
        millisecond = 0;
        if (values.fraction) {
          fraction = values.fraction.slice(0, 6);
          while (fraction.length < 6) {
            fraction += '0';
          }
          fraction = parseInt(fraction);
          millisecond = Math.round(fraction / 1000);
        }
        if (values.tz_sign) {
          tz_sign = values.tz_sign === '-' ? 1 : -1;
          if (tz_hour = parseInt(values.tz_hour)) {
            hour += tz_sign * tz_hour;
          }
          if (tz_minute = parseInt(values.tz_minute)) {
            minute += tz_sign * tz_minute;
          }
        }
        date = new Date(Date.UTC(year, month, day, hour, minute, second, millisecond));
        return date;
      }

      construct_yaml_pair_list(type, node) {
        var list;
        list = [];
        if (!(node instanceof nodes.SequenceNode)) {
          throw new exports.ConstructorError(`while constructing ${type}`, node.start_mark, `expected a sequence but found ${node.id}`, node.start_mark);
        }
        this.defer(() => {
          var i, key, key_node, len, ref, results, subnode, value, value_node;
          ref = node.value;
          results = [];
          for (i = 0, len = ref.length; i < len; i++) {
            subnode = ref[i];
            if (!(subnode instanceof nodes.MappingNode)) {
              throw new exports.ConstructorError(`while constructing ${type}`, node.start_mark, `expected a mapping of length 1 but found ${subnode.id}`, subnode.start_mark);
            }
            if (subnode.value.length !== 1) {
              throw new exports.ConstructorError(`while constructing ${type}`, node.start_mark, `expected a mapping of length 1 but found ${subnode.id}`, subnode.start_mark);
            }
            [key_node, value_node] = subnode.value[0];
            key = this.construct_object(key_node);
            value = this.construct_object(value_node);
            results.push(list.push([key, value]));
          }
          return results;
        });
        return list;
      }

      construct_yaml_omap(node) {
        return this.construct_yaml_pair_list('an ordered map', node);
      }

      construct_yaml_pairs(node) {
        return this.construct_yaml_pair_list('pairs', node);
      }

      construct_yaml_set(node) {
        var data;
        data = [];
        this.defer(() => {
          var item, results;
          results = [];
          for (item in this.construct_mapping(node)) {
            results.push(data.push(item));
          }
          return results;
        });
        return data;
      }

      construct_yaml_str(node) {
        return this.construct_scalar(node);
      }

      construct_yaml_seq(node) {
        var data;
        data = [];
        this.defer(() => {
          var i, item, len, ref, results;
          ref = this.construct_sequence(node);
          results = [];
          for (i = 0, len = ref.length; i < len; i++) {
            item = ref[i];
            results.push(data.push(item));
          }
          return results;
        });
        return data;
      }

      construct_yaml_map(node) {
        var data;
        data = {};
        this.defer(() => {
          var key, ref, results, value;
          ref = this.construct_mapping(node);
          results = [];
          for (key in ref) {
            value = ref[key];
            results.push(data[key] = value);
          }
          return results;
        });
        return data;
      }

      construct_yaml_object(node, klass) {
        var data;
        data = new klass;
        this.defer(() => {
          var key, ref, results, value;
          ref = this.construct_mapping(node, true);
          results = [];
          for (key in ref) {
            value = ref[key];
            results.push(data[key] = value);
          }
          return results;
        });
        return data;
      }

      construct_undefined(node) {
        throw new exports.ConstructorError(null, null, `could not determine a constructor for the tag ${node.tag}`, node.start_mark);
      }

    };

    BOOL_VALUES = {
      on: true,
      off: false,
      true: true,
      false: false,
      yes: true,
      no: false
    };

    TIMESTAMP_REGEX = /^([0-9][0-9][0-9][0-9])-([0-9][0-9]?)-([0-9][0-9]?)(?:(?:[Tt]|[\x20\t]+)([0-9][0-9]?):([0-9][0-9]):([0-9][0-9])(?:\.([0-9]*))?(?:[\x20\t]*(Z|([-+])([0-9][0-9]?)(?::([0-9][0-9]))?))?)?$/; //  1: year
    //  2: month
    //  3: day
    //  4: hour
    //  5: minute
    //  6: second
    //  7: fraction
    //  9: tz_sign
    // 10: tz_hour
    // 11: tz_minute
    //  8: tz

    TIMESTAMP_PARTS = {
      year: 1,
      month: 2,
      day: 3,
      hour: 4,
      minute: 5,
      second: 6,
      fraction: 7,
      tz: 8,
      tz_sign: 9,
      tz_hour: 10,
      tz_minute: 11
    };

    return Constructor;

  }).call(this);

  this.Constructor.add_constructor('tag:yaml.org,2002:null', this.Constructor.prototype.construct_yaml_null);

  this.Constructor.add_constructor('tag:yaml.org,2002:bool', this.Constructor.prototype.construct_yaml_bool);

  this.Constructor.add_constructor('tag:yaml.org,2002:int', this.Constructor.prototype.construct_yaml_int);

  this.Constructor.add_constructor('tag:yaml.org,2002:float', this.Constructor.prototype.construct_yaml_float);

  this.Constructor.add_constructor('tag:yaml.org,2002:binary', this.Constructor.prototype.construct_yaml_binary);

  this.Constructor.add_constructor('tag:yaml.org,2002:timestamp', this.Constructor.prototype.construct_yaml_timestamp);

  this.Constructor.add_constructor('tag:yaml.org,2002:omap', this.Constructor.prototype.construct_yaml_omap);

  this.Constructor.add_constructor('tag:yaml.org,2002:pairs', this.Constructor.prototype.construct_yaml_pairs);

  this.Constructor.add_constructor('tag:yaml.org,2002:set', this.Constructor.prototype.construct_yaml_set);

  this.Constructor.add_constructor('tag:yaml.org,2002:str', this.Constructor.prototype.construct_yaml_str);

  this.Constructor.add_constructor('tag:yaml.org,2002:seq', this.Constructor.prototype.construct_yaml_seq);

  this.Constructor.add_constructor('tag:yaml.org,2002:map', this.Constructor.prototype.construct_yaml_map);

  this.Constructor.add_constructor(null, this.Constructor.prototype.construct_undefined);

}).call(this);
