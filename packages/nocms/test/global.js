import chai from 'chai';
import chaiSubset from 'chai-subset';
import chaiAsPromised from 'chai-as-promised';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import sinonAsPromised from 'sinon-as-promised';

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
