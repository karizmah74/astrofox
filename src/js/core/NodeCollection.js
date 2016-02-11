'use strict';

var _ = require('lodash');
var Immutable = require('immutable');
var EventEmitter = require('../core/EventEmitter.js');

var NodeCollection = function(values) {
    this.nodes = new Immutable.List();

    if (values) {
        this.nodes = this.nodes.withMutations(function(list) {
            values.forEach(function(val) {
                list.push(val);
                this.emit('node_added', val);
            }, this);
        }.bind(this));
    }
};

NodeCollection.prototype = _.create(EventEmitter.prototype, {
    constructor: NodeCollection,

    addNode: function(node) {
        var nodes = this.nodes;

        this.nodes = nodes.push(node);

        this.emit('node_added', node);
    },

    removeNode: function(node) {
        var nodes = this.nodes,
            index = nodes.indexOf(node),
            changed = false;

        if (index > -1) {
            this.nodes = nodes.delete(index);
            changed = true;
            this.emit('node_removed', node);
        }

        return changed;
    },

    swapNodes: function(index, newIndex) {
        var nodes = this.nodes,
            size = nodes.size,
            changed = false;

        if (index !== newIndex && index > -1 && index < size && newIndex > -1 && newIndex < size) {
            this.nodes = nodes.withMutations(function(list) {
                var tmp = list.get(index);
                list.set(index, list.get(newIndex));
                list.set(newIndex, tmp);
                changed = true;
            });
        }

        return changed;
    },

    clear: function() {
        this.nodes = this.nodes.clear();
    },

    indexOf: function(node) {
        return this.nodes.indexOf(node);
    }
});

module.exports = NodeCollection;