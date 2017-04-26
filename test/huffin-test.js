'use strict';

const assert = require('assert');

const huffin = require('../');

describe('Huffin', () => {
  it('should stringify binary data', () => {
    const buf = Buffer.from('2f8450d5b9f2746150ec435d99ad348a' +
                            'd49b46f82a378cb87b3fc15b00884d21', 'hex');
    assert.equal(huffin.stringify(buf),
                 '@wccceyt/lacLg2If6spspVGk3jTCV7lhxN37Cd4CQGwKAQ');
  });

  it('should parse string', () => {
    const buf = Buffer.from('2f8450d5b9f2746150ec435d99ad348a' +
                            'd49b46f82a378cb87b3fc15b00884d21', 'hex');
    assert.deepEqual(
        huffin.parse('@wccceyt/lacLg2If6spspVGk3jTCV7lhxN37Cd4CQGwKAQ'),
        buf);
  });

  it('should test binary data', () => {
    const prefix = huffin.parsePrefix('wccceyt');

    const buf = Buffer.from('2f8450d5b9f2746150ec435d99ad348a' +
                            'd49b46f82a378cb87b3fc15b00884d21', 'hex');
    assert(huffin.test(buf, prefix));

    assert(!huffin.test(buf, huffin.parsePrefix('ohai')));
  });

  it('should restore binary data on partial match', () => {
    const buf = Buffer.from('2e0092507ba44b52c8f30195af38ce01' +
                            '6dd8cc53eaad2778a04be205ba617ee3', 'hex');

    assert.equal(
        huffin.stringify(buf),
        '@/LgCSUHukS1LI8wGVrzjOAW3YzFPqrSd4oEviBbphfuM');

    assert.deepEqual(huffin.parse(huffin.stringify(buf)),
                     buf);
  });
});
