export interface IrpaPluginOptions {
  properties?: {
    tags?: {
      blockButtonHandle?: string,
    }
  },
  variables?: {
    '--irpa-background': string,
    '--irpa-on-background': string,
    '--irpa-surface': string,
    '--irpa-border-color': string,
    '--irpa-border-opacity': string,
    [key: string]: string,
  },
  components?: boolean,
}

declare module 'vue' {
  interface ComponentCustomProperties {
    $irpa: IrpaPluginOptions["properties"]
  }
}
