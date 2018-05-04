import { cpus } from 'os';
import { Context } from 'wct';


interface WCTParallelOptions {
  instances?: number
}


function plugin(context: Context, pluginOptions: WCTParallelOptions, plugin: Plugin) {

  const maxInstances = pluginOptions.instances || cpus().length;
  const instances = Math.min(maxInstances, context.options.suites.length);

  context.hook('prepare', async () => {
    if (context.options.activeBrowsers) {
      context.options.activeBrowsers = context.options.activeBrowsers
        .map(browser => Array(instances).fill(browser))
        .reduce((acc, curr) => acc.concat(curr), []);
    }
  });

  context.hook('prepare:webserver', async () => {
    const suites = context.options.suites;
    const loadSuitesRegExp = /WCT\.loadSuites\((\[.*\])\);/;

    const loadNeededSuites = `
      // modified by wct-parallel
      var allSuites = ${JSON.stringify(suites)};
      var i = parseInt(window.location.search.match(/cli_browser_id=(\\d+)/)[1], 10) % ${instances};
      var n = ${Math.ceil(suites.length / instances)};
      WCT.loadSuites(allSuites.slice(i * n, (i + 1) * n));
    `;
    context.options.webserver._generatedIndexContent =
      context.options.webserver._generatedIndexContent.replace(loadSuitesRegExp, loadNeededSuites);
  });

}

module.exports = plugin;
