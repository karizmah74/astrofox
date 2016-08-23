'use strict';

function getColor(start, end, pct) {
    let startColor = {
        r: parseInt(start.substring(1,3), 16),
        g: parseInt(start.substring(3,5), 16),
        b: parseInt(start.substring(5,7), 16)
    };

    let endColor = {
        r: parseInt(end.substring(1,3), 16),
        g: parseInt(end.substring(3,5), 16),
        b: parseInt(end.substring(5,7), 16)
    };

    let c = {
        r: ~~((endColor.r - startColor.r) * pct) + startColor.r,
        g: ~~((endColor.g - startColor.g) * pct) + startColor.g,
        b: ~~((endColor.b - startColor.b) * pct) + startColor.b
    };

    return '#' + c.r.toString(16) + c.g.toString(16) + c.b.toString(16);
}

function setColor(context, color, x1, y1, x2, y2) {
    let i, gradient;

    if (color instanceof Array) {
        gradient = context.createLinearGradient(x1, y1, x2, y2);

        for (i = 0; i < color.length; i++) {
            gradient.addColorStop(i / (color.length - 1), color[i]);
        }

        context.fillStyle = gradient;
    }
    else {
        context.fillStyle = color;
    }
}

module.exports = {
    getColor,
    setColor
};