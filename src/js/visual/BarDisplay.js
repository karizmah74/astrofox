'use strict';

var EventEmitter = require('../core/EventEmitter.js');
var _ = require('lodash');

var defaults = {
    x: 0,
    y: 150,
    height: 300,
    width: 200,
    barWidth: -1,
    barSpacing: -1,
    color: '#ffffff',
    shadowHeight: 100,
    shadowColor: '#cccccc',
    clearCanvas: true
};

var BarDisplay = EventEmitter.extend({
    constructor: function(canvas, options) {
        this.canvas = canvas;
        this.context = canvas.getContext('2d');
        this.options = {};

        this.init(options);
    }
});

BarDisplay.prototype.init = function(options) {
    this.options = _.assign({}, defaults, options);
};

BarDisplay.prototype.render = function(data) {
    var i, j, val, size, totalWidth,
        step = 1,
        len = data.length,
        context = this.context,
        options = this.options,
        x = options.x,
        y = options.y,
        height = options.height,
        width = options.width,
        barWidth = options.barWidth,
        barSpacing = options.barSpacing,
        shadowHeight = options.shadowHeight,
        color = options.color,
        shadowColor = options.shadowColor;

    // Clear canvas
    if (options.clearCanvas) {
        context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    // Set background color
    if (options.bgColor) {
        this.setColor(options.bgColor);
        context.fillRect(x, y, x + width, y + height);
    }

    // Calculate bar widths
    if (barWidth < 0 && barSpacing < 0) {
        barWidth = barSpacing = (width / len) / 2;
    }
    else if (barSpacing > 0 && barWidth < 0) {
        barWidth = (width - (len * barSpacing)) / len;
        if (barWidth <= 0) barWidth = 1;
    }
    else if (barWidth > 0 && barSpacing < 0) {
        barSpacing = (width - (len * barWidth)) / len;
        if (barSpacing <= 0) barSpacing = 1;
    }

    // Calculate bars to display
    size = barWidth + barSpacing;
    totalWidth = size * len;

    if (totalWidth > width) {
        step = totalWidth / width;
    }

    // Draw bars
    this.setColor(color, 0, y - height, 0, y);

    for (i = 0, j = x; i < len; i += step, j += size) {
        val = data[floor(i)] * height;
        context.fillRect(j, y, barWidth, -val);
    }

    // Draw shadow bars
    if (shadowHeight > 0) {
        this.setColor(shadowColor, 0, y, 0, y + shadowHeight);

        for (i = 0, j = x; i < len; i += step, j += size) {
            val = data[floor(i)] * shadowHeight;
            context.fillRect(j, y, barWidth, val);
        }
    }
};

BarDisplay.prototype.setColor = function(color, x1, y1, x2, y2) {
    var i, gradient, len,
        context = this.context;

    if (color instanceof Array) {
        len = color.length;
        gradient = this.context.createLinearGradient(x1, y1, x2, y2);
        for (i = 0; i < len; i++) {
            gradient.addColorStop(i / (len - 1), color[i]);
        }
        context.fillStyle = gradient;
    }
    else {
        context.fillStyle = color;
    }
};

function getColor(start, end, pct) {
    var startColor = {
        r: parseInt(start.substring(1,3), 16),
        g: parseInt(start.substring(3,5), 16),
        b: parseInt(start.substring(5,7), 16)
    };

    var endColor = {
        r: parseInt(end.substring(1,3), 16),
        g: parseInt(end.substring(3,5), 16),
        b: parseInt(end.substring(5,7), 16)
    };

    var c = {
        r: ~~((endColor.r - startColor.r) * pct) + startColor.r,
        g: ~~((endColor.g - startColor.g) * pct) + startColor.g,
        b: ~~((endColor.b - startColor.b) * pct) + startColor.b
    };

    return '#' + c.r.toString(16) + c.g.toString(16) + c.b.toString(16);
}

function round(val) {
    return (val + 0.5) << 0;
}

function ceil(val) {
    var n = (val << 0);
    return (n == val) ? n : n + 1;
}

function floor(val) {
    return ~~val;
}

module.exports = BarDisplay;