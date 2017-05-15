'use strict';

const assert = require('assert');
const crypto = require('crypto');
const Buffer = require('buffer').Buffer;

const huffin = require('../');

describe('Huffin', () => {
  it('should stringify binary data', () => {
    const buf = Buffer.from('2f8450d5b9f2746150ec435d99ad348a' +
                            'd49b46f82a378cb87b3fc15b00884d21', 'hex');
    assert.equal(huffin.stringify(buf),
                 'starel_bWp1ioGffmbE9E9Gq4ov8GksnaoutFnKHUnzmXxB');
  });

  it('should stringify binary data with hex encoding', () => {
    const buf = Buffer.from('2f8450d5b9f2746150ec435d99ad348a' +
                            'd49b46f82a378cb87b3fc15b00884d21', 'hex');
    assert.equal(
        huffin.stringify(buf, 'hex'),
        'starel_2f8450d5b9f2746150ec435d99ad348ad49b46f82a378cb87b3fc15b008');
  });

  it('should parse string', () => {
    const buf = Buffer.from('2f8450d5b9f2746150ec435d99ad348a' +
                            'd49b46f82a378cb87b3fc15b00884d21', 'hex');
    assert.deepEqual(
        huffin.parse('starel_bWp1ioGffmbE9E9Gq4ov8GksnaoutFnKHUnzmXxB'),
        buf);
  });

  it('should parse string from hex encoding', () => {
    const buf = Buffer.from('2f8450d5b9f2746150ec435d99ad348a' +
                            'd49b46f82a378cb87b3fc15b00884d21', 'hex');

    const str =
        'starel_2f8450d5b9f2746150ec435d99ad348ad49b46f82a378cb87b3fc15b008';
    assert.deepEqual(
        huffin.parse(str, 'hex'),
        buf);
  });

  it('should test binary data', () => {
    const prefix = huffin.parsePrefix('starel');

    const buf = Buffer.from('2f8450d5b9f2746150ec435d99ad348a' +
                            'd49b46f82a378cb87b3fc15b00884d21', 'hex');
    assert(huffin.test(buf, prefix));

    assert(!huffin.test(buf, huffin.parsePrefix('ohaio')));
  });

  it('should pad result', () => {
    const buf = Buffer.alloc(32);

    assert.equal(
        huffin.stringify(buf),
        'scpqi_1');

    assert.deepEqual(huffin.parse(huffin.stringify(buf)),
                     buf);
  });

  it('should encode/decode long prefix', () => {
    const buf = Buffer.from('6e318bfdac42fd313587eac10a3d8dbf' +
                            '87f9c29009b74abf86b0390514569a9f', 'hex');

    assert.equal(
        huffin.stringify(buf),
        'ribzhavllisngiu_dR775QHDEAMaCbV89YAMKRgkFXfGw7dC');

    assert.deepEqual(huffin.parse(huffin.stringify(buf)),
                     buf);
  });

  it('should pass randomness', () => {
    for (let i = 0; i < 10000; i++) {
      const buf = crypto.randomBytes(32);

      try {
        assert.deepEqual(
            huffin.parse(huffin.stringify(buf)),
            buf);
        assert.deepEqual(
            huffin.parse(huffin.stringify(buf, 'hex'), 'hex'),
            buf);
      } catch (e) {
        console.error(buf.toString('hex'));
        throw e;
      }
    }
  });
});
