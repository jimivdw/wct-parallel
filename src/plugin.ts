import { Context } from 'wct';
import { WCTParallel } from './WCTParallel';
import { WCTParallelOptions } from './model';

export * from './model';


function plugin(context: Context, pluginOptions: WCTParallelOptions) {

  let wctParallel: WCTParallel;

  context.hook('prepare', async () => {
    wctParallel = new WCTParallel(context, pluginOptions);
    context.options.activeBrowsers = wctParallel.getParallelBrowsers();
  });

  context.hook('prepare:webserver', async () => {
    context.options.webserver._generatedIndexContent = wctParallel.getGeneratedIndexContent();
  });

}

module.exports = plugin;
