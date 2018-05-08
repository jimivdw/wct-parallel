import { cpus } from 'os';
import { BrowserDef, Context } from 'wct';
import { BrowserOptions, Browsers, WCTParallelOptions } from './model';


interface CleanWCTParallelOptions {
  instances: number;
  browsers: CleanBrowserOptions[];
}

interface CleanBrowserOptions {
  browserName: string;
  instances: number;
}

type BrowserSuites = { [browserId: number]: string[] };


const LOAD_SUITES_REGEXP = /WCT\.loadSuites\((\[.*\])\);/;


function normalizeBrowsers(browsers: Browsers = [], defaultInstanceCount: number): CleanBrowserOptions[] {
  return browsers.map((browser: string | BrowserOptions) => {
    if (typeof browser === 'string') {
      return {
        browserName: browser,
        instances: defaultInstanceCount
      };
    }

    return Object.assign({ instances: defaultInstanceCount }, browser);
  });
}

function normalizeOptions(options: WCTParallelOptions, suiteCount: number): CleanWCTParallelOptions {
  const maxInstances = options.instances || cpus().length;
  const instances: number = Math.min(maxInstances, suiteCount);
  return {
    instances: options.browsers && options.browsers.length ? 1 : instances,
    browsers: normalizeBrowsers(options.browsers, instances)
  };
}


export class WCTParallel {
  private readonly context: Context;
  private readonly options: CleanWCTParallelOptions;
  private readonly browserSuites: BrowserSuites;

  constructor(context: Context, options: WCTParallelOptions) {
    this.context = context;
    this.options = normalizeOptions(options, context.options.suites.length);
    this.browserSuites = this.getBrowserSuites();
  }

  private get suites(): string[] {
    return this.context.options.suites;
  }

  private getInstanceCount(browserName: string): number {
    const browserOptions: CleanBrowserOptions | undefined = this.options.browsers.find(browser => browser.browserName === browserName);
    return browserOptions ? browserOptions.instances : this.options.instances;
  }

  private getSuites(browserIndex: number, suiteCount: number): string[] {
    return this.suites.slice(browserIndex * suiteCount, (browserIndex + 1) * suiteCount);
  }

  private getBrowserSuites(): BrowserSuites {
    const browserSuites: BrowserSuites = {};

    let browserId = 0;
    this.context.options.activeBrowsers.forEach((browser: BrowserDef) => {
      const instanceCount: number = this.getInstanceCount(browser.browserName);
      for (let i: number = 0; i < instanceCount; i++) {
        browserSuites[browserId++] = this.getSuites(i, Math.ceil(this.suites.length / instanceCount));
      }
    });

    return browserSuites;
  }

  getParallelBrowsers(): BrowserDef[] {
    return this.context.options.activeBrowsers
      .reduce((parallelBrowsers: BrowserDef[], browser: BrowserDef) => {
        const instanceCount: number = this.getInstanceCount(browser.browserName);
        return parallelBrowsers.concat(Array(instanceCount).fill(browser));
      }, []);
  }

  getGeneratedIndexContent(): string {
    const loadNeededSuites: string = `
      // modified by wct-parallel
      var suiteMap = ${JSON.stringify(this.browserSuites)};
      var i = window.location.search.match(/cli_browser_id=(\\d+)/)[1];
      WCT.loadSuites(suiteMap[i]);
    `;
    return this.context.options.webserver._generatedIndexContent.replace(LOAD_SUITES_REGEXP, loadNeededSuites);
  }
}
