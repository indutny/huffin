'use strict';

const fs = require('fs');

const ALPHABET = 'abcdefghijklmnopqrstuvwxyz'.split('');

const lines = fs.readFileSync(process.argv[2]).toString().split(/\r\n\|\n/g);

const words = lines.reduce((acc, line) => {
  const split = line.toLowerCase()
      .replace(/[^a-z\s]+/g, '').split(/\s+/g).filter(x => x);

  return acc.concat(split);
}, []);

const alphabet = new Map();

ALPHABET.concat(null).forEach((key) => {
  const submap = new Map();
  ALPHABET.forEach(key => submap.set(key, 0));
  alphabet.set(key, submap);
});

words.forEach((word) => {
  let prev = null;
  for (let i = 0; i < word.length; i++) {
    const map = alphabet.get(prev);

    const next = word[i];
    map.set(next, map.get(next) + 1);
    prev = next;
  }
});

alphabet.forEach((map) => {
  let total = 0;

  map.forEach((value) => {
    total += value;
  });

  if (total === 0)
    return;
  map.forEach((_, key) => {
    map.set(key, map.get(key) / total);
  })
});

let first = null;
const tables = [];
alphabet.forEach((map, prev) => {
  const items = [];
  map.forEach((probability, key) => {
    items.push({ key, probability });
  });
  items.sort((a, b) => a.key < b.key ? -1 : a.key > b.key ? 1 : 0);

  const probability = items.map(({ key, probability }) => [ key, probability ]);

  if (prev === null) {
    first = probability;
    return;
  }

  tables.push({
    key: prev,
    probability
  });
});

tables.sort((a, b) => a.key < b.key ? -1 : a.key > b.key ? 1 : 0);

const json = [ [ null, first ] ].concat(tables.map(({ key, probability }) => {
  return [ key, probability ];
}));
console.log(JSON.stringify(json, null, 2));
