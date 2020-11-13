const tap = require('tap');
const test = tap.test;
const ScratchTransform = require('../../src/sprites/scratch-transform');

/**
 * Assert that two numeric values are approximately equal, within a threshold.
 * Examples:
 *   t.approximatelyEqual(result, 42, 0.01)
 *   t.approximatelyEqual(result, 42, 0.01, "oh no")
 */
tap.Test.prototype.addAssert('approximatelyEqual', 3, function (actual, expected, threshold, message, extra) {
    message = message || 'should be approximately equal';

    if (threshold === null || typeof threshold === 'undefined') {
        message = 'threshold missing';
    }

    extra.diff = Math.abs(actual - expected);
    extra.threshold = threshold;

    // add a space to separate it from the diff-style line markers
    extra.found = ` ${actual}`;
    extra.wanted = ` ${expected}`;

    // eslint-disable-next-line no-invalid-this
    return this.ok(extra.diff < threshold, message, extra);
});

test('default construction', t => {
    const transform = new ScratchTransform();
    t.equal(transform.x, 0);
    t.equal(transform.y, 0);
    t.equal(transform.direction, 90);
    t.equal(transform.size, 100);
    t.end();
});

test('non-default construction', t => {
    const transform = new ScratchTransform({
        x: 12,
        y: 34,
        direction: 56,
        size: 78
    });
    t.equal(transform.x, 12);
    t.equal(transform.y, 34);
    t.equal(transform.direction, 56);
    t.equal(transform.size, 78);
    t.end();
});

test('transformPoint', t => {
    const identity = new ScratchTransform();
    const identityResult = identity.transformPoint(12, 34);
    t.equal(identityResult.x, 12);
    t.equal(identityResult.y, 34);

    const translate = new ScratchTransform({x: 56, y: 78});
    const translateResult = translate.transformPoint(12, 34);
    t.equal(translateResult.x, 68);
    t.equal(translateResult.y, 112);

    // direction = 0 means turning counter-clockwise 90 degrees
    const ccw90 = new ScratchTransform({direction: 0});
    const ccw90Result = ccw90.transformPoint(12, 34);
    t.approximatelyEqual(ccw90Result.x, -34, 0.01);
    t.approximatelyEqual(ccw90Result.y, 12, 0.01);

    // direction = 180 means turning clockwise 90 degrees
    const cw90 = new ScratchTransform({direction: 180});
    const cw90Result = cw90.transformPoint(12, 34);
    t.approximatelyEqual(cw90Result.x, 34, 0.01);
    t.approximatelyEqual(cw90Result.y, -12, 0.01);

    // direction = 270 means turning 180 degrees
    const turn180 = new ScratchTransform({direction: 270});
    const turn180Result = turn180.transformPoint(12, 34);
    t.approximatelyEqual(turn180Result.x, -12, 0.01);
    t.approximatelyEqual(turn180Result.y, -34, 0.01);

    const scale2x = new ScratchTransform({size: 200});
    const scale2xResult = scale2x.transformPoint(12, 34);
    t.equal(scale2xResult.x, 24);
    t.equal(scale2xResult.y, 68);

    const scaleHalf = new ScratchTransform({size: 50});
    const scaleHalfResult = scaleHalf.transformPoint(12, 34);
    t.equal(scaleHalfResult.x, 6);
    t.equal(scaleHalfResult.y, 17);

    const transformAll = new ScratchTransform({
        x: 12,
        y: 34,
        direction: 270,
        size: 200
    });
    const transformAllResult = transformAll.transformPoint(1, 2);
    t.approximatelyEqual(transformAllResult.x, 10, 0.01);
    t.approximatelyEqual(transformAllResult.y, 30, 0.01);

    t.end();
});

test('detransformPoint', t => {
    const identity = new ScratchTransform();
    const identityResult = identity.detransformPoint(12, 34);
    t.equal(identityResult.x, 12);
    t.equal(identityResult.y, 34);

    const translate = new ScratchTransform({x: 56, y: 78});
    const translateResult = translate.detransformPoint(68, 112);
    t.equal(translateResult.x, 12);
    t.equal(translateResult.y, 34);

    // direction = 0 means turning counter-clockwise 90 degrees
    const ccw90 = new ScratchTransform({direction: 0});
    const ccw90Result = ccw90.detransformPoint(-34, 12);
    t.approximatelyEqual(ccw90Result.x, 12, 0.01);
    t.approximatelyEqual(ccw90Result.y, 34, 0.01);

    // direction = 180 means turning clockwise 90 degrees
    const cw90 = new ScratchTransform({direction: 180});
    const cw90Result = cw90.detransformPoint(34, -12, 34);
    t.approximatelyEqual(cw90Result.x, 12, 0.01);
    t.approximatelyEqual(cw90Result.y, 34, 0.01);

    // direction = 270 means turning 180 degrees
    const turn180 = new ScratchTransform({direction: 270});
    const turn180Result = turn180.detransformPoint(-12, -34);
    t.approximatelyEqual(turn180Result.x, 12, 0.01);
    t.approximatelyEqual(turn180Result.y, 34, 0.01);

    const scale2x = new ScratchTransform({size: 200});
    const scale2xResult = scale2x.detransformPoint(24, 68);
    t.equal(scale2xResult.x, 12);
    t.equal(scale2xResult.y, 34);

    const scaleHalf = new ScratchTransform({size: 50});
    const scaleHalfResult = scaleHalf.detransformPoint(6, 17);
    t.equal(scaleHalfResult.x, 12);
    t.equal(scaleHalfResult.y, 34);

    const transformAll = new ScratchTransform({
        x: 12,
        y: 34,
        direction: 270,
        size: 200
    });
    const transformAllResult = transformAll.detransformPoint(10, 30);
    t.approximatelyEqual(transformAllResult.x, 1, 0.01);
    t.approximatelyEqual(transformAllResult.y, 2, 0.01);

    t.end();
});

test('concatenate', t => {
    const identity = new ScratchTransform();
    const dest = ScratchTransform.concatenate(identity, identity);
    t.equal(dest.x, 0);
    t.equal(dest.y, 0);
    t.equal(dest.direction, 90);
    t.equal(dest.size, 100);

    const dest2 = ScratchTransform.concatenate(identity, dest, dest);
    t.strictSame(dest, dest2);

    const transformAll = new ScratchTransform({
        x: 12,
        y: 34,
        direction: 180, // turn clockwise 90 degrees
        size: 200
    });

    const transformAll2 = ScratchTransform.concatenate(identity, transformAll);
    t.notEqual(transformAll, transformAll2); // they should be different objects
    t.deepEqual(transformAll, transformAll2); // they should have the same property values

    const transformAll3 = ScratchTransform.concatenate(transformAll, identity);
    t.notEqual(transformAll, transformAll3); // they should be different objects
    t.deepEqual(transformAll, transformAll3); // they should have the same property values

    const transformAllSquared = ScratchTransform.concatenate(transformAll, transformAll);
    t.approximatelyEqual(transformAllSquared.x, 80, 0.01);
    t.approximatelyEqual(transformAllSquared.y, 10, 0.01);
    t.approximatelyEqual(transformAllSquared.direction, 270, 0.01);
    t.approximatelyEqual(transformAllSquared.size, 400, 0.01);

    t.end();
});
