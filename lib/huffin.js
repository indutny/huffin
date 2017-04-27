'use strict';

const assert = require('assert');
const Buffer = require('buffer').Buffer;
const BN = require('bn.js');

const KEY_SIZE = 32;
const MIN_VANITY_LENGTH = 5;
const MAX_VANITY_LENGTH = 15;

const LETTERS = [
  // See: https://en.wikipedia.org/wiki/Letter_frequency
  'e', 12.702,
  't', 9.056,
  'a', 8.167,
  'o', 7.507,
  'i', 6.966,
  'n', 6.749,
  's', 6.327,
  'h', 6.094,
  'r', 5.987,
  'd', 4.253,
  'l', 4.025,
  'c', 2.782,
  'u', 2.758,
  'm', 2.406,
  'w', 2.360,
  'f', 2.228,
  'g', 2.015,
  'y', 1.974,
  'p', 1.929,
  'b', 1.492,
  'v', 0.978,
  'k', 0.772,
  'j', 0.153,
  'x', 0.150,
  'q', 0.095,
  'z', 0.074
];

function toHuffmanTree(list) {
  function Leaf(prob, value) {
    this.prob = prob;
    this.value = value;
  }

  function Node(left, right) {
    this.prob = left.prob + right.prob;
    this.left = left;
    this.right = right;
  }

  const leafQueue = [];
  for (let i = 0; i < list.length; i += 2) {
    const letter = list[i];
    const prob = list[i + 1];

    leafQueue.push(new Leaf(prob, letter));
  }
  leafQueue.sort((a, b) => b.prob - a.prob);

  const nodeQueue = [];
  while ((leafQueue.length + nodeQueue.length) > 1) {
    const leafs = [];
    while (leafs.length < 2 && leafQueue.length > 1 && nodeQueue.length > 1) {
      const lastQ = leafQueue[leafQueue.length - 1];
      const lastN = nodeQueue[nodeQueue.length - 1];

      if (lastQ.prob < lastN.prob)
        leafs.push(leafQueue.pop());
      else
        leafs.push(nodeQueue.pop());
    }
    while (leafs.length < 2 && leafQueue.length !== 0)
      leafs.push(leafQueue.pop());
    while (leafs.length < 2 && nodeQueue.length !== 0)
      leafs.push(nodeQueue.pop());

    const node = new Node(leafs[0], leafs[1]);
    nodeQueue.unshift(node);
  }

  const root = nodeQueue.pop();

  function tree(node) {
    if (node instanceof Leaf)
      return node.value;

    return [ tree(node.left), tree(node.right) ];
  }

  const map = new Map();
  function createMap(node, path) {
    if (node instanceof Leaf)
      return map.set(node.value, path);

    createMap(node.left, path.concat(0));
    createMap(node.right, path.concat(1));
  }

  createMap(root, []);

  return {
    tree: tree(root),
    map
  };
}

const { tree: TREE, map: MAP } = toHuffmanTree(LETTERS);

exports.stringify = function stringify(raw) {
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

  let node = TREE;
  while (alpha.length < len) {
    const bit = num.testn(0);
    num.ishrn(1);

    const next = node[bit ? 1 : 0];
    if (Array.isArray(next)) {
      node = next;
      continue;
    }

    node = TREE;
    alpha += next;
  }

  return `${alpha}/` +
         num.toArrayLike(Buffer, 'be').toString('base64').replace(/=+$/, '');
};

exports.parse = function parse(string) {
  const match = string.match(/^([a-z]*)\/(.*)$/);
  if (match === null)
    throw new Error('Invalid huffin input');

  const num = new BN(Buffer.from(match[2], 'base64'), 'be');
  exports.parsePrefix(match[1], num);

  const out = num.toArrayLike(Buffer, 'be');

  // Pad
  assert(out.length <= KEY_SIZE, 'invalid parse input');
  if (out.length < KEY_SIZE)
    return Buffer.concat([ out, Buffer.alloc(KEY_SIZE - out.length) ]);
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
    const bits = MAP.get(alpha[i]);
    assert(bits, 'invalid character in prefix');
    bitLength += bits.length;

    for (let j = bits.length - 1; j >= 0; j--) {
      const bit = bits[j];

      out.ishln(1);
      out.setn(0, bit);
    }
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
