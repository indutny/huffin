'use strict';

const assert = require('assert');

const huffin = require('../');

describe('Huffin', () => {
  it('should stringify binary data', () => {
    const buf = Buffer.from('2f8450d5b9f2746150ec435d99ad348a' +
                            'd49b46f82a378cb87b3fc15b00884d21', 'hex');
    assert.equal(huffin.stringify(buf),
                 '@e/vhFDVufJ0YVDsQ12ZrTSK1JtG+Co3jLh7P8FbAIhNA');
  });

  it('should parse string', () => {
    const buf = Buffer.from('2f8450d5b9f2746150ec435d99ad348a' +
                            'd49b46f82a378cb87b3fc15b00884d21', 'hex');
    assert.deepEqual(
        huffin.parse('@e/vhFDVufJ0YVDsQ12ZrTSK1JtG+Co3jLh7P8FbAIhNA'),
        buf);
  });

  it('should test binary data', () => {
    const prefix = huffin.parsePrefix('e');

    const buf = Buffer.from('2f8450d5b9f2746150ec435d99ad348a' +
                            'd49b46f82a378cb87b3fc15b00884d21', 'hex');
    assert(huffin.test(buf, prefix));

    assert(!huffin.test(buf, huffin.parsePrefix('ohai')));
  });

  it('should pad result', () => {
    const buf = Buffer.alloc(32);

    assert.equal(
        huffin.stringify(buf),
        '@/AA');

    assert.deepEqual(huffin.parse(huffin.stringify(buf)),
                     buf);
  });
});
