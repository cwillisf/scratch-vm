const MathUtil = require('../util/math-util');

class ScratchTransform {
    /**
     * Construct a ScratchTransform. Default construction results in the identity transform.
     * @param {object} - initial position, direction, and scale
     * @property {number} x - the X position (+ = right)
     * @property {number} y - the Y position (+ = up)
     * @property {number} direction - clockwise degrees, 90 = right = identity
     * @property {number} size - size in percent, 100 = identity
     */
    constructor ({x = 0, y = 0, direction = 90, size = 100} = {}) {
        this.x = x;
        this.y = y;
        this.direction = direction;
        this.size = size;
    }

    /**
     * @param {ScratchTransform} parent - the parent transform
     * @param {ScratchTransform} child - the child transform
     * @param {ScratchTransform} [dest] - a transform to be populated with the result (optional)
     * @returns {ScratchTransform} - a single transform equivalent to applying parent then child
     */
    static concatenate (parent, child, dest = new ScratchTransform()) {
        ({x: dest.x, y: dest.y} = parent.transformPoint(child.x, child.y));
        dest.direction = (parent.direction + child.direction - 90) % 360;
        dest.size = parent.size * child.size / 100.0;
        return dest;
    }

    /**
     * Apply this transform to a point, transforming the point from local space to parent/world space.
     * @param {number} x - the X coordinate of the point in local space
     * @param {number} y - the Y coordinate of the point in local space
     * @returns {object} - the coordinates of the point in parent/world space
     *   @property {number} x - the X coordinate of the point in parent/world space
     *   @property {number} y - the Y coordinate of the point in parent/world space
     */
    transformPoint (x, y) {
        const radians = MathUtil.degToRad(90 - this.direction);
        const cos = Math.cos(radians);
        const sin = Math.sin(radians);
        const scale = this.size / 100.0;
        return {
            x: this.x + (scale * ((x * cos) - (y * sin))),
            y: this.y + (scale * ((x * sin) + (y * cos)))
        };
    }

    /**
     * Apply the inverse of this transform to a point, transforming the point from parent/world to local space.
     * @param {number} x - the X coordinate of the point in parent/world space
     * @param {number} y - the Y coordinate of the point in parent/world space
     * @returns {object} - the coordinates of the point in local space
     *   @property {number} x - the X coordinate of the point in local space
     *   @property {number} y - the Y coordinate of the point in local space
     */
    detransformPoint (x, y) {
        const offsetX = x - this.x;
        const offsetY = y - this.y;

        const scale = this.size / 100.0;
        const unscaledOffsetX = offsetX / scale;
        const unscaledOffsetY = offsetY / scale;

        const radians = -MathUtil.degToRad(90 - this.direction);
        const cos = Math.cos(radians);
        const sin = Math.sin(radians);

        return {
            x: (unscaledOffsetX * cos) - (unscaledOffsetY * sin),
            y: (unscaledOffsetX * sin) + (unscaledOffsetY * cos)
        };
    }
}

module.exports = ScratchTransform;
