export interface WCTParallelOptions {
  instances?: number,
  browsers?: Browsers
}

export type Browsers = Array<string | BrowserOptions>;

export interface BrowserOptions {
  browserName: string,
  instances?: number
}
