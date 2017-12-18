(function() {
  var unique_id;

  unique_id = 0;

  this.Node = class Node {
    constructor(tag1, value1, start_mark1, end_mark1) {
      this.tag = tag1;
      this.value = value1;
      this.start_mark = start_mark1;
      this.end_mark = end_mark1;
      this.unique_id = `node_${unique_id++}`;
    }

  };

  this.ScalarNode = (function() {
    class ScalarNode extends this.Node {
      constructor(tag, value, start_mark, end_mark, style) {
        super(tag, value, start_mark, end_mark);
        this.style = style;
      }

    };

    ScalarNode.prototype.id = 'scalar';

    return ScalarNode;

  }).call(this);

  this.CollectionNode = class CollectionNode extends this.Node {
    constructor(tag, value, start_mark, end_mark, flow_style) {
      super(tag, value, start_mark, end_mark);
      this.flow_style = flow_style;
    }

  };

  this.SequenceNode = (function() {
    class SequenceNode extends this.CollectionNode {};

    SequenceNode.prototype.id = 'sequence';

    return SequenceNode;

  }).call(this);

  this.MappingNode = (function() {
    class MappingNode extends this.CollectionNode {};

    MappingNode.prototype.id = 'mapping';

    return MappingNode;

  }).call(this);

}).call(this);
