import plugin = require('../plugin');
import { assert } from 'chai';
import * as sinon from 'sinon';
import { BrowserDef, Config, Context } from 'wct';
import * as WCTParallel from '../WCTParallel';


suite('plugin', () => {

  let WCTParallelStub: sinon.SinonStub;

  setup(() => {
    WCTParallelStub = sinon.stub(WCTParallel, 'WCTParallel');
  });

  teardown(() => {
    WCTParallelStub.restore();
  });

  test('prepare', async () => {
    const contextStub = {} as Context;
    contextStub.hook = sinon.stub();
    contextStub.options = {} as Config;

    const optionsStub = {};

    plugin(contextStub, optionsStub);
    const prepare = (contextStub.hook as sinon.SinonStub).withArgs('prepare');
    sinon.assert.calledOnce(prepare);

    const parallelBrowsersStub: BrowserDef[] = [];
    const getParallelBrowsersStub = sinon.stub().returns(parallelBrowsersStub);
    WCTParallelStub.withArgs(contextStub, optionsStub).returns({ getParallelBrowsers: getParallelBrowsersStub });
    await prepare.callArg(1);

    assert.equal(contextStub.options.activeBrowsers, parallelBrowsersStub);
  });

  test('prepare webserver', async () => {
    const contextStub = {} as Context;
    contextStub.hook = sinon.stub();
    contextStub.options = { webserver: {} } as Config;

    const optionsStub = {};

    plugin(contextStub, optionsStub);
    const prepare = (contextStub.hook as sinon.SinonStub).withArgs('prepare');
    const prepareWebserver = (contextStub.hook as sinon.SinonStub).withArgs('prepare:webserver');
    const getGeneratedIndexContentStub = sinon.stub().returns('Test content');
    WCTParallelStub.withArgs(contextStub, optionsStub).returns({
      getParallelBrowsers: sinon.stub(),
      getGeneratedIndexContent: getGeneratedIndexContentStub
    });
    await prepare.callArg(1);

    sinon.assert.calledOnce(prepareWebserver);
    await prepareWebserver.callArg(1);

    assert.equal(contextStub.options.webserver._generatedIndexContent, 'Test content');
  });

});
