(function() {
  var YAMLError, nodes, util,
    indexOf = [].indexOf;

  nodes = require('./nodes');

  util = require('./util');

  ({YAMLError} = require('./errors'));

  this.ResolverError = class ResolverError extends YAMLError {};

  this.BaseResolver = (function() {
    var DEFAULT_MAPPING_TAG, DEFAULT_SCALAR_TAG, DEFAULT_SEQUENCE_TAG, ctor;

    class BaseResolver {
      constructor() {
        return ctor.apply(this, arguments);
      }

      static add_implicit_resolver(tag, regexp, first = [null]) {
        var base, char, i, len, results;
        if (!this.prototype.hasOwnProperty('yaml_implicit_resolvers')) {
          this.prototype.yaml_implicit_resolvers = util.extend({}, this.prototype.yaml_implicit_resolvers);
        }
        results = [];
        for (i = 0, len = first.length; i < len; i++) {
          char = first[i];
          results.push(((base = this.prototype.yaml_implicit_resolvers)[char] != null ? base[char] : base[char] = []).push([tag, regexp]));
        }
        return results;
      }

      initialise() {
        this.resolver_exact_paths = [];
        return this.resolver_prefix_paths = [];
      }

      descend_resolver(current_node, current_index) {
        var depth, exact_paths, i, j, kind, len, len1, path, prefix_paths, ref, ref1;
        if (util.is_empty(this.yaml_path_resolvers)) {
          return;
        }
        exact_paths = {};
        prefix_paths = [];
        if (current_node) {
          depth = this.resolver_prefix_paths.length;
          ref = this.resolver_prefix_paths.slice(-1)[0];
          for (i = 0, len = ref.length; i < len; i++) {
            [path, kind] = ref[i];
            if (this.check_resolver_prefix(depth, path, kind, current_node, current_index)) {
              if (path.length > depth) {
                prefix_paths.push([path, kind]);
              } else {
                exact_paths[kind] = this.yaml_path_resolvers[path][kind];
              }
            }
          }
        } else {
          ref1 = this.yaml_path_resolvers;
          for (j = 0, len1 = ref1.length; j < len1; j++) {
            [path, kind] = ref1[j];
            if (!path) {
              exact_paths[kind] = this.yaml_path_resolvers[path][kind];
            } else {
              prefix_paths.push([path, kind]);
            }
          }
        }
        this.resolver_exact_paths.push(exact_paths);
        return this.resolver_prefix_paths.push(prefix_paths);
      }

      ascend_resolver() {
        if (util.is_empty(this.yaml_path_resolvers)) {
          return;
        }
        this.resolver_exact_paths.pop();
        return this.resolver_prefix_paths.pop();
      }

      check_resolver_prefix(depth, path, kind, current_node, current_index) {
        var index_check, node_check;
        [node_check, index_check] = path[depth - 1];
        if (typeof node_check === 'string') {
          if (current_node.tag !== node_check) {
            return;
          }
        } else if (node_check !== null) {
          if (!(current_node instanceof node_check)) {
            return;
          }
        }
        if (index_check === true && current_index !== null) {
          return;
        }
        if ((index_check === false || index_check === null) && current_index === null) {
          return;
        }
        if (typeof index_check === 'string') {
          if (!(current_index instanceof nodes.ScalarNode) && index_check === current_index.value) {
            return;
          }
        } else if (typeof index_check === 'number') {
          if (index_check !== current_index) {
            return;
          }
        }
        return true;
      }

      resolve(kind, value, implicit) {
        var empty, exact_paths, i, k, len, ref, ref1, ref2, regexp, resolvers, tag;
        if (kind === nodes.ScalarNode && implicit[0]) {
          if (value === '') {
            resolvers = (ref = this.yaml_implicit_resolvers['']) != null ? ref : [];
          } else {
            resolvers = (ref1 = this.yaml_implicit_resolvers[value[0]]) != null ? ref1 : [];
          }
          resolvers = resolvers.concat((ref2 = this.yaml_implicit_resolvers[null]) != null ? ref2 : []);
          for (i = 0, len = resolvers.length; i < len; i++) {
            [tag, regexp] = resolvers[i];
            if (value.match(regexp)) {
              return tag;
            }
          }
          implicit = implicit[1];
        }
        empty = true;
        for (k in this.yaml_path_resolvers) {
          if ({}[k] == null) {
            empty = false;
          }
        }
        if (!empty) {
          exact_paths = this.resolver_exact_paths.slice(-1)[0];
          if (indexOf.call(exact_paths, kind) >= 0) {
            return exact_paths[kind];
          }
          if (indexOf.call(exact_paths, null) >= 0) {
            return exact_paths[null];
          }
        }
        if (kind === nodes.ScalarNode) {
          return DEFAULT_SCALAR_TAG;
        }
        if (kind === nodes.SequenceNode) {
          return DEFAULT_SEQUENCE_TAG;
        }
        if (kind === nodes.MappingNode) {
          return DEFAULT_MAPPING_TAG;
        }
      }

    };

    DEFAULT_SCALAR_TAG = 'tag:yaml.org,2002:str';

    DEFAULT_SEQUENCE_TAG = 'tag:yaml.org,2002:seq';

    DEFAULT_MAPPING_TAG = 'tag:yaml.org,2002:map';

    BaseResolver.prototype.yaml_implicit_resolvers = {};

    BaseResolver.prototype.yaml_path_resolvers = {};

    ctor = BaseResolver.prototype.initialise;

    return BaseResolver;

  }).call(this);

  this.Resolver = class Resolver extends this.BaseResolver {};

  this.Resolver.add_implicit_resolver('tag:yaml.org,2002:bool', /^(?:yes|Yes|YES|true|True|TRUE|on|On|ON|no|No|NO|false|False|FALSE|off|Off|OFF)$/, 'yYnNtTfFoO');

  this.Resolver.add_implicit_resolver('tag:yaml.org,2002:float', /^(?:[-+]?(?:[0-9][0-9_]*)\.[0-9_]*(?:[eE][-+][0-9]+)?|\.[0-9_]+(?:[eE][-+][0-9]+)?|[-+]?[0-9][0-9_]*(?::[0-5]?[0-9])+\.[0-9_]*|[-+]?\.(?:inf|Inf|INF)|\.(?:nan|NaN|NAN))$/, '-+0123456789.');

  this.Resolver.add_implicit_resolver('tag:yaml.org,2002:int', /^(?:[-+]?0b[01_]+|[-+]?0[0-7_]+|[-+]?(?:0|[1-9][0-9_]*)|[-+]?0x[0-9a-fA-F_]+|[-+]?0o[0-7_]+|[-+]?[1-9][0-9_]*(?::[0-5]?[0-9])+)$/, '-+0123456789');

  this.Resolver.add_implicit_resolver('tag:yaml.org,2002:merge', /^(?:<<)$/, '<');

  this.Resolver.add_implicit_resolver('tag:yaml.org,2002:null', /^(?:~|null|Null|NULL|)$/, ['~', 'n', 'N', '']);

  this.Resolver.add_implicit_resolver('tag:yaml.org,2002:timestamp', /^(?:[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]|[0-9][0-9][0-9][0-9]-[0-9][0-9]?-[0-9][0-9]?(?:[Tt]|[\x20\t]+)[0-9][0-9]?:[0-9][0-9]:[0-9][0-9](?:\.[0-9]*)?(?:[\x20\t]*(?:Z|[-+][0-9][0-9]?(?::[0-9][0-9])?))?)$/, '0123456789');

  this.Resolver.add_implicit_resolver('tag:yaml.org,2002:value', /^(?:=)$/, '=');

  // The following resolver is only for documentation purposes.  It cannot work
  // because plain scalars cannot start with '!', '&' or '*'.
  this.Resolver.add_implicit_resolver('tag:yaml.org,2002:yaml', /^(?:!|&|\*)$/, '!&*');

}).call(this);
