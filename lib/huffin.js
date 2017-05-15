'use strict';

const assert = require('assert');
const base58 = require('bs58');
const BN = require('bn.js');

const KEY_SIZE = 32;
const MIN_VANITY_LENGTH = 5;
const MAX_VANITY_LENGTH = 15;

const LETTER_START = 0x61;
const LETTER_END = 0x7a;

const TABLE = require('./table');
const FORWARD = TABLE.forward;
const BACKWARD = TABLE.backward;

exports.stringify = function stringify(raw, enc) {
  assert.equal(raw.length, KEY_SIZE, 'Invalid stringify input');

  const num = new BN(raw, 'be');

  let alpha = '';

  // Its either two or five bits for length
  let len = num.modn(4);
  num.ishrn(2);
  if (len === 3) {
    len += num.modn(8);
    num.ishrn(3);
  }
  len += MIN_VANITY_LENGTH;

  let node = FORWARD[0];
  while (alpha.length < len) {
    const bit = num.testn(0);
    num.ishrn(1);

    const next = node[bit ? 1 : 0];
    if (Array.isArray(next)) {
      node = next;
      continue;
    }

    node = FORWARD[next + 1];
    alpha += String.fromCharCode(LETTER_START + next);
  }

  if (enc === 'hex')
    return `${alpha}_${num.toString('hex', 'be')}`;
  return `${alpha}_` + base58.encode(num.toArray('be'));
};

exports.parse = function parse(string, enc) {
  const match = string.match(/^([a-z]*)_(.*)$/);
  if (match === null)
    throw new Error('Invalid huffin input');

  let num;
  if (enc === 'hex')
    num = new BN(match[2], 'hex', 'be');
  else
    num = new BN(base58.decode(match[2]), 'be');
  exports.parsePrefix(match[1], num);

  const out = num.toArrayLike(Buffer, 'be');

  // Pad
  assert(out.length <= KEY_SIZE, 'invalid parse input');
  if (out.length < KEY_SIZE)
    return Buffer.concat([ Buffer.alloc(KEY_SIZE - out.length), out ]);
  else
    return out;
};

exports.parsePrefix = function parsePrefix(string, out) {
  // NOTE: this is as inefficient as it could be
  const alpha = string;
  assert(MIN_VANITY_LENGTH <= string.length &&
            string.length <= MAX_VANITY_LENGTH,
         `prefix length must be between ${MIN_VANITY_LENGTH} and ` +
             `${MAX_VANITY_LENGTH} (both inclusive)`);
  if (!out)
    out = new BN(0);

  let bitLength = 0;
  for (let i = alpha.length - 1; i >= 0; i--) {
    const letter = alpha.charCodeAt(i);
    const prev = i === 0 ? 0 : alpha.charCodeAt(i - 1) - LETTER_START + 1;
    assert(prev < BACKWARD.length, 'Invalid letter in prefix');

    const bits = BACKWARD[prev][letter - LETTER_START];
    assert(bits, 'Invalid letter in prefix');

    for (let j = bits.length - 1; j >= 0; j--) {
      const bit = bits[j];

      out.ishln(1);
      out.setn(0, bit);
    }
    bitLength += bits.length;
  }

  let len = string.length - MIN_VANITY_LENGTH;
  if (len < 3) {
    out.ishln(2);
    out.iaddn(len);
    bitLength += 2;
  } else {
    out.ishln(5);
    out.iaddn(((len - 3) << 2) | 3);
    bitLength += 5;
  }

  return { bitLength, value: out };
};

exports.test = function test(buf, prefix) {
  const num = new BN(buf, 'be');
  num.imaskn(prefix.bitLength);
  return num.cmp(prefix.value) === 0;
};
