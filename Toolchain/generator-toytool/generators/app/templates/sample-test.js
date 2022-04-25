const { isTemplateNode } = require('@vue/compiler-core');
var assert = require('assert');

describe("test cases:", function () {
    isTemplateNode('1+1==2', function () {
        assert.equal(1 + 1, 2);
    })
})