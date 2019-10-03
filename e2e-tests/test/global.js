const chai = require('chai');
const chaiSubset = require('chai-subset');
const chaiAsPromised = require('chai-as-promised');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const sinonAsPromised = require('sinon-as-promised');

chai.should();
chai.use(chaiSubset);
chai.use(chaiAsPromised);
chai.use(sinonChai);

global.chaiAsPromised = chaiAsPromised;
global.sinonAsPromised = sinonAsPromised;
global.sinon = sinon;
global.expect = chai.expect;
global.AssertionError = chai.AssertionError;
global.Assertion = chai.Assertion;
global.assert = chai.assert;
