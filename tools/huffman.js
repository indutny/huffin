'use strict';

const assert = require('assert');

const fs = require('fs');

const LETTER_START = 0x61;
const LETTER_END = 0x7a;

function huffman(list) {
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
  for (let i = 0; i < list.length; i++) {
    const letter = list[i][0].charCodeAt(0);
    const prob = list[i][1];

    assert(LETTER_START <= letter && letter <= LETTER_END);

    leafQueue.push(new Leaf(prob, letter - LETTER_START));
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

  const backward = [];
  function createBackward(node, path) {
    if (node instanceof Leaf)
      return backward.push({ value: node.value, bits: path });

    createBackward(node.left, path.concat(0));
    createBackward(node.right, path.concat(1));
  }
  createBackward(root, []);
  backward.sort((a, b) => {
    return a.value < b.value ? -1 : a.value > b.value ? 1 : 0;
  });

  assert.equal(backward.length, LETTER_END - LETTER_START + 1);

  return {
    forward: tree(root),
    backward: backward.map(({ bits }) => bits)
  };
}

const table = JSON.parse(fs.readFileSync(process.argv[2]).toString());

const pre = table.map(([ _, probabilities ]) => huffman(probabilities));

const forward = [];
const backward = [];

pre.forEach(({ forward: f, backward: b }) => {
  forward.push(f);
  backward.push(b);
});

console.log(JSON.stringify({ forward, backward }, null, 2));
