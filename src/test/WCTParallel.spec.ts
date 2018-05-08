import { assert } from 'chai';
import * as os from 'os';
import * as sinon from 'sinon';
import { WCTParallel } from '../WCTParallel';
import { Context, Config, BrowserDef } from 'wct';


suite('WCTParallel', () => {

  function getSuitesMock(n: number): string[] {
    return Array(n).fill(0).reduce((suites, _, i) => suites.concat(i), []);
  }

  suite('getParallelBrowsers', () => {

    let cpusStub: sinon.SinonStub;

    setup(() => {
      cpusStub = sinon.stub(os, 'cpus');
    });

    teardown(() => {
      cpusStub.restore();
    });

    test('by default starts up one instance per CPU', () => {
      const contextStub = {} as Context;
      contextStub.options = {} as Config;
      contextStub.options.suites = Array(10).fill('');
      const browserStub = {} as BrowserDef;
      browserStub.browserName = 'chrome';
      contextStub.options.activeBrowsers = [browserStub];
      cpusStub.returns(Array(4).fill({}));

      const wctParallel = new WCTParallel(contextStub, {});
      const parallelBrowsers = wctParallel.getParallelBrowsers();
      
      sinon.assert.calledOnce(cpusStub);
      assert.deepEqual(parallelBrowsers, Array(4).fill(browserStub));
    });

    test('can configure number of instances globally', () => {
      const contextStub = {} as Context;
      contextStub.options = {} as Config;
      contextStub.options.suites = Array(10).fill('');
      const chromeStub = {} as BrowserDef;
      chromeStub.browserName = 'chrome';
      const firefoxStub = {} as BrowserDef;
      firefoxStub.browserName = 'firefox';
      contextStub.options.activeBrowsers = [chromeStub, firefoxStub];

      const wctParallel = new WCTParallel(contextStub, { instances: 2 });
      const parallelBrowsers = wctParallel.getParallelBrowsers();

      sinon.assert.notCalled(cpusStub);
      assert.deepEqual(parallelBrowsers, Array(2).fill(chromeStub).concat(Array(2).fill(firefoxStub)));
    });

    test('can configure number of instances per browser', () => {
      const contextStub = {} as Context;
      contextStub.options = {} as Config;
      contextStub.options.suites = Array(10).fill('');
      const chromeStub = {} as BrowserDef;
      chromeStub.browserName = 'chrome';
      const firefoxStub = {} as BrowserDef;
      firefoxStub.browserName = 'firefox';
      contextStub.options.activeBrowsers = [chromeStub, firefoxStub];

      const wctParallel = new WCTParallel(contextStub, { instances: 2, browsers: [{ browserName: 'chrome', instances: 4 }] });
      const parallelBrowsers = wctParallel.getParallelBrowsers();

      sinon.assert.notCalled(cpusStub);
      assert.deepEqual(parallelBrowsers, Array(4).fill(chromeStub).concat(firefoxStub));
    });

    test('can configure browsers to parallelize', () => {
      const contextStub = {} as Context;
      contextStub.options = {} as Config;
      contextStub.options.suites = Array(10).fill('');
      const chromeStub = {} as BrowserDef;
      chromeStub.browserName = 'chrome';
      const firefoxStub = {} as BrowserDef;
      firefoxStub.browserName = 'firefox';
      contextStub.options.activeBrowsers = [chromeStub, firefoxStub];

      const wctParallel = new WCTParallel(contextStub, { instances: 2, browsers: ['chrome'] });
      const parallelBrowsers = wctParallel.getParallelBrowsers();

      sinon.assert.notCalled(cpusStub);
      assert.deepEqual(parallelBrowsers, Array(2).fill(chromeStub).concat(firefoxStub));
    });

    test('limits number of instances to number of suites', () => {
      const contextStub = {} as Context;
      contextStub.options = {} as Config;
      contextStub.options.suites = Array(2).fill('');
      const chromeStub = {} as BrowserDef;
      chromeStub.browserName = 'chrome';
      contextStub.options.activeBrowsers = [chromeStub];

      const wctParallel = new WCTParallel(contextStub, { instances: 8 });
      const parallelBrowsers = wctParallel.getParallelBrowsers();

      sinon.assert.notCalled(cpusStub);
      assert.deepEqual(parallelBrowsers, Array(2).fill(chromeStub));
    });

  });

  suite('getGeneratedIndexContent', () => {

    test('evenly distributes the suites over the instances', () => {
      const contextStub = {} as Context;
      contextStub.options = {} as Config;
      contextStub.options.webserver = {
        port: NaN,
        hostname: '',
        pathMappings: [],
        urlPrefix: '',
        _generatedIndexContent: 'WCT.loadSuites([]);'
      };
      contextStub.options.suites = getSuitesMock(8);
      const chromeStub = {} as BrowserDef;
      chromeStub.browserName = 'chrome';
      contextStub.options.activeBrowsers = [chromeStub];

      const wctParallel = new WCTParallel(contextStub, { instances: 3 });
      const content = wctParallel.getGeneratedIndexContent();
      const suites = JSON.parse(((content.match(/suiteMap = (\{.*\});/)) as string[])[1]);

      assert.deepEqual(suites['0'], [0, 1, 2]);
      assert.deepEqual(suites['1'], [3, 4, 5]);
      assert.deepEqual(suites['2'], [6, 7]);
    });

  });

});
