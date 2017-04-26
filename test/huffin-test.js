'use strict';

const assert = require('assert');

const huffin = require('../');

describe('Huffin', () => {
  it('should stringify binary data', () => {
    const buf = Buffer.from('2f8450d5b9f2746150ec435d99ad348a' +
                            'd49b46f82a378cb87b3fc15b00884d21', 'hex');
    assert.equal(huffin.stringify(buf),
                 '@dsmmuiyhuhnhmrtuegsuairr/aRSpN43wVW4Ycfd+grcAEJtC');
  });

  it('should parse string', () => {
    const buf = Buffer.from('2f8450d5b9f2746150ec435d99ad348a' +
                            'd49b46f82a378cb87b3fc15b00884d21', 'hex');
    assert.deepEqual(
        huffin.parse('@dsmmuiyhuhnhmrtuegsuairr/aRSpN43wVW4Ycfd+grcAEJtC'),
        buf);
  });

  it('should test binary data', () => {
    const prefix = huffin.parsePrefix('dsmmuiyhuhnhmrtuegsuairr');

    const buf = Buffer.from('2f8450d5b9f2746150ec435d99ad348a' +
                            'd49b46f82a378cb87b3fc15b00884d21', 'hex');
    assert(huffin.test(buf, prefix));

    assert(!huffin.test(buf, huffin.parsePrefix('ohai')));
  });

  it('should restore binary data on partial match', () => {
    const buf = Buffer.from('521ff2fda5b3c5fc11e36124f1747610' +
                            '13a6220a5f3a89b3211171874cfa5194', 'hex');

    assert.equal(
        huffin.stringify(buf),
        '@/Uh/y/aWzxfwR42Ek8XR2EBOmIgpfOomzIRFxh0z6UZQ');

    assert.deepEqual(huffin.parse(huffin.stringify(buf)),
                     buf);
  });
});
