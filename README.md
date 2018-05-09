# wct-parallel

[Web Component Tester](https://github.com/Polymer/tools/tree/master/packages/web-component-tester) plugin that allows running tests across multiple browser instances in parallel.

## Installation and usage

`wct-parallel` can be installed via:
```
npm install --save-dev wct-parallel
```

You can then add the plugin in your [WCT Configuration](https://github.com/Polymer/tools/tree/master/packages/web-component-tester#configuration) or enable it via the `--plugin wct-parallel` CLI option.

## Configuration

By default, the plugin will spawn one browser instance per CPU for each configured browser. This can be changed in various ways:
1. Set default number of instances (for every browser) explicitly
2. Set number of instances per browser
3. Set browsers to enable the plugin for

### Config option `instances`

- Type: `number`
- Default: Number of CPUs

Defines the number of browser instances to spawn. **Note: this option is ignored when `browsers` is set.**

### Cinfig option `browsers`

- Type: `string[] | BrowserOptions[]` (see below for `BrowserOptions`)

When used as a `string[]`: defines browser names to enable the plugin for.

When used as `BrowserOptions[]`: number of instances to spawn per browser; spawns `1` for all other browsers.

```typescript
interface BrowserOptions {
  browserName: string; // Name of browser to configure
  instances?: number; // Number of instances to spawn for this browser; defaults to global instances setting
}
```

### CLI options

| Option               | Type     | Description                          |
|----------------------|----------|--------------------------------------|
| `-i` / `--instances` | `number` | Number of browser instances to spawn |
