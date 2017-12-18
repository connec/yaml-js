(function() {
  var YAMLError, nodes,
    hasProp = {}.hasOwnProperty;

  nodes = require('./nodes');

  ({YAMLError} = require('./errors'));

  this.RepresenterError = class RepresenterError extends YAMLError {};

  this.BaseRepresenter = (function() {
    var ctor;

    class BaseRepresenter {
      constructor() {
        return ctor.apply(this, arguments);
      }

      static add_representer(data_type, handler) {
        if (!this.prototype.hasOwnProperty('yaml_representers_types')) {
          this.prototype.yaml_representers_types = [].concat(this.prototype.yaml_representers_types);
        }
        if (!this.prototype.hasOwnProperty('yaml_representers_handlers')) {
          this.prototype.yaml_representers_handlers = [].concat(this.prototype.yaml_representers_handlers);
        }
        this.prototype.yaml_representers_types.push(data_type);
        return this.prototype.yaml_representers_handlers.push(handler);
      }

      static add_multi_representer(data_type, handler) {
        if (!this.prototype.hasOwnProperty('yaml_multi_representers_types')) {
          this.prototype.yaml_multi_representers_types = [].concat(this.prototype.yaml_multi_representers_types);
        }
        if (!this.prototype.hasOwnProperty('yaml_multi_representers_handlers')) {
          this.prototype.yaml_multi_representers_handlers = [].concat(this.prototype.yaml_multi_representers_handlers);
        }
        this.prototype.yaml_multi_representers_types.push(data_type);
        return this.prototype.yaml_multi_representers_handlers.push(handler);
      }

      initialise({
          default_style: default_style,
          default_flow_style: default_flow_style
        } = {}) {
        this.default_style = default_style;
        this.default_flow_style = default_flow_style;
        this.represented_objects = {};
        this.object_keeper = [];
        return this.alias_key = null;
      }

      represent(data) {
        var node;
        node = this.represent_data(data);
        this.serialize(node);
        this.represented_objects = {};
        this.object_keeper = [];
        return this.alias_key = null;
      }

      represent_data(data) {
        var data_type, i, j, len, ref, representer, type;
        if (this.ignore_aliases(data)) {
          this.alias_key = null;
        } else if ((i = this.object_keeper.indexOf(data)) !== -1) {
          this.alias_key = i;
          if (this.alias_key in this.represented_objects) {
            return this.represented_objects[this.alias_key];
          }
        } else {
          this.alias_key = this.object_keeper.length;
          this.object_keeper.push(data);
        }
        // Bit fiddly: we look into our non-multi representers using the JS type if `data` is not an
        // object, otherwise we use the object's constructor.  For multi-representers we just use
        // instanceof.  A representer for `undefined` can be called for any type.
        representer = null;
        data_type = data === null ? 'null' : typeof data;
        if (data_type === 'object') {
          data_type = data.constructor;
        }
        if ((i = this.yaml_representers_types.lastIndexOf(data_type)) !== -1) {
          representer = this.yaml_representers_handlers[i];
        }
        if (representer == null) {
          ref = this.yaml_multi_representers_types;
          for (i = j = 0, len = ref.length; j < len; i = ++j) {
            type = ref[i];
            if (!(data instanceof type)) {
              continue;
            }
            representer = this.yaml_multi_representers_handlers[i];
            break;
          }
        }
        if (representer == null) {
          if ((i = this.yaml_multi_representers_types.lastIndexOf(void 0)) !== -1) {
            representer = this.yaml_multi_representers_handlers[i];
          } else if ((i = this.yaml_representers_types.lastIndexOf(void 0)) !== -1) {
            representer = this.yaml_representers_handlers[i];
          }
        }
        if (representer != null) {
          return representer.call(this, data);
        } else {
          return new nodes.ScalarNode(null, `${data}`);
        }
      }

      represent_scalar(tag, value, style = this.default_style) {
        var node;
        node = new nodes.ScalarNode(tag, value, null, null, style);
        if (this.alias_key != null) {
          this.represented_objects[this.alias_key] = node;
        }
        return node;
      }

      represent_sequence(tag, sequence, flow_style) {
        var best_style, item, j, len, node, node_item, ref, value;
        value = [];
        node = new nodes.SequenceNode(tag, value, null, null, flow_style);
        if (this.alias_key != null) {
          this.represented_objects[this.alias_key] = node;
        }
        best_style = true;
        for (j = 0, len = sequence.length; j < len; j++) {
          item = sequence[j];
          node_item = this.represent_data(item);
          if (!(node_item instanceof nodes.ScalarNode || node_item.style)) {
            best_style = false;
          }
          value.push(node_item);
        }
        if (flow_style == null) {
          node.flow_style = (ref = this.default_flow_style) != null ? ref : best_style;
        }
        return node;
      }

      represent_mapping(tag, mapping, flow_style) {
        var best_style, item_key, item_value, node, node_key, node_value, ref, value;
        value = [];
        node = new nodes.MappingNode(tag, value, flow_style);
        if (this.alias_key) {
          this.represented_objects[this.alias_key] = node;
        }
        best_style = true;
        for (item_key in mapping) {
          if (!hasProp.call(mapping, item_key)) continue;
          item_value = mapping[item_key];
          node_key = this.represent_data(item_key);
          node_value = this.represent_data(item_value);
          if (!(node_key instanceof nodes.ScalarNode || node_key.style)) {
            best_style = false;
          }
          if (!(node_value instanceof nodes.ScalarNode || node_value.style)) {
            best_style = false;
          }
          value.push([node_key, node_value]);
        }
        if (!flow_style) {
          node.flow_style = (ref = this.default_flow_style) != null ? ref : best_style;
        }
        return node;
      }

      ignore_aliases(data) {
        return false;
      }

    };

    BaseRepresenter.prototype.yaml_representers_types = [];

    BaseRepresenter.prototype.yaml_representers_handlers = [];

    BaseRepresenter.prototype.yaml_multi_representers_types = [];

    BaseRepresenter.prototype.yaml_multi_representers_handlers = [];

    ctor = BaseRepresenter.prototype.initialise;

    return BaseRepresenter;

  }).call(this);

  this.Representer = class Representer extends this.BaseRepresenter {
    represent_boolean(data) {
      return this.represent_scalar('tag:yaml.org,2002:bool', (data ? 'true' : 'false'));
    }

    represent_null(data) {
      return this.represent_scalar('tag:yaml.org,2002:null', 'null');
    }

    represent_number(data) {
      var tag, value;
      tag = `tag:yaml.org,2002:${(data % 1 === 0 ? 'int' : 'float')}`;
      value = data !== data ? '.nan' : data === 2e308 ? '.inf' : data === -2e308 ? '-.inf' : data.toString();
      return this.represent_scalar(tag, value);
    }

    represent_string(data) {
      return this.represent_scalar('tag:yaml.org,2002:str', data);
    }

    represent_array(data) {
      return this.represent_sequence('tag:yaml.org,2002:seq', data);
    }

    represent_date(data) {
      return this.represent_scalar('tag:yaml.org,2002:timestamp', data.toISOString());
    }

    represent_object(data) {
      return this.represent_mapping('tag:yaml.org,2002:map', data);
    }

    represent_undefined(data) {
      throw new exports.RepresenterError(`cannot represent an onbject: ${data}`);
    }

    ignore_aliases(data) {
      var ref;
      if (data == null) {
        return true;
      }
      if ((ref = typeof data) === 'boolean' || ref === 'number' || ref === 'string') {
        return true;
      }
      return false;
    }

  };

  this.Representer.add_representer('boolean', this.Representer.prototype.represent_boolean);

  this.Representer.add_representer('null', this.Representer.prototype.represent_null);

  this.Representer.add_representer('number', this.Representer.prototype.represent_number);

  this.Representer.add_representer('string', this.Representer.prototype.represent_string);

  this.Representer.add_representer(Array, this.Representer.prototype.represent_array);

  this.Representer.add_representer(Date, this.Representer.prototype.represent_date);

  this.Representer.add_representer(Object, this.Representer.prototype.represent_object);

  this.Representer.add_representer(null, this.Representer.prototype.represent_undefined);

}).call(this);
