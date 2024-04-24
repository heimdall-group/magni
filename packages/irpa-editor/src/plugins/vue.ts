import { Plugin } from "vue"
import IrpaBlockEditor from "../components/block-editor.vue"
import IrpaBlockCodeEditor from "../components/block-code-editor.vue"
import "../style.css"

const plugin: Plugin = {
  install(app, options = {
    names: {
      blockEditor: "irpa-block-editor",
      blockCodeEditor: "irpa-block-code-editor"
    }
  }) {
    app.component(options.names.blockEditor, IrpaBlockEditor)
    app.component(options.names.blockCodeEditor, IrpaBlockCodeEditor)
  }
}
export default plugin
