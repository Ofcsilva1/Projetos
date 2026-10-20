import {test} from 'node:test';
import assert from 'node:assert/strict';
import {decodeAnchor} from '../src/components/anchor.mjs';

test('anchors decode an encoded id without stripping characters from the id',()=>{
  assert.equal(decodeAnchor('#caf%C3%A9'),'café');
  assert.equal(decodeAnchor('#%23section'),'#section');
  assert.equal(decodeAnchor('section'),'section');
});
test('empty and malformed anchors remain recoverable',()=>{
  assert.equal(decodeAnchor(),'');
  assert.equal(decodeAnchor('#'),'');
  assert.equal(decodeAnchor('#%'),'%');
  assert.equal(decodeAnchor('#%E0%A4%A'),'%E0%A4%A');
});
