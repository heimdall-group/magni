import { Plugin, App } from 'vue'
import { createHead } from '@unhead/vue'
import { IrpaEditorVuePlugin } from 'irpa-editor/plugins'
import '../../types/index.d.ts';
import * as components from '../../components/index';
import { IrpaPluginOptions } from '../../types/index.ts';
import 'ress';
import '../../assets/blocks.css'

const config: IrpaPluginOptions = {
  properties: {
    tags: {
      blockButtonHandle: 'button',
    },
  },
  variables: {
    '--irpa-background': '18, 18, 18',
    '--irpa-on-background': '255, 255, 255',
    '--irpa-surface': '33, 33, 33',
    '--irpa-border-color': '255, 255, 255',
    '--irpa-border-opacity': '0.12',
  },
  components: true,
}

const createIrpa = (options: IrpaPluginOptions = config): Plugin => {
  options = Object.assign(config, options);
  
  const getComponentName = (component: any): string => {
    const __file: string = component.__file;
    const index = __file.lastIndexOf('components/');
    const name = __file.slice(index + 11, __file.length - 4).replace('/index', '').split('/').join('-');
    return name;
  }

  const getVariables = (variables: IrpaPluginOptions["variables"]) => {
    if (variables) {
      const string = Object.keys(variables).map((key) => {
        return `${key}: ${variables[key]};\n`
      }).join('');
      return string
    }
  }

  const getHead = () => {
    return {
      style: [{
        children: `:root {\n${getVariables(options.variables)}}`,
        type: 'text/css',
        id: 'irpa-block-variables',
      }]
    }
  }

  const irpaEditorOptions = {
    names: {
      blockEditor: "blocks-components-editor",
      blockCodeEditor: "blocks-components-code-editor"
    }
  }

  return {
    install: (app: App) => {
      if (options.components) {
        for (const key in components) {
          const component = components[key as keyof typeof components];
          app.component(getComponentName(component), component);
        }
      }
      app.config.globalProperties.$irpa = options.properties;
      app.use(IrpaEditorVuePlugin, irpaEditorOptions);
      if (app._context.provides.usehead) {
        app._context.provides.usehead.push(getHead);
      } else {
        const head = createHead();
        head.push(getHead);
        app.use(head);
      }
    }
  }
}

export {
  createIrpa
}
