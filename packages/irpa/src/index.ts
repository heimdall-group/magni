import { Plugin } from 'vue'
import blockVue from './components/blocks/index.vue';
import block_editorVue from './components/blocks/components/editor.vue'
import bulleted_listVue from './components/blocks/types/bulleted_list.vue';
import codeVue from './components/blocks/types/code.vue';
import columnsVue from './components/blocks/types/columns.vue';
import columns_2Vue from './components/blocks/types/columns_2.vue';
import columns_3Vue from './components/blocks/types/columns_3.vue';
import columns_4Vue from './components/blocks/types/columns_4.vue';
import columns_5Vue from './components/blocks/types/columns_5.vue';
import headingVue from './components/blocks/types/heading.vue';
import heading_1Vue from './components/blocks/types/heading_1.vue';
import heading_2Vue from './components/blocks/types/heading_2.vue';
import heading_3Vue from './components/blocks/types/heading_3.vue';
import pageVue from './components/blocks/types/page.vue';
import paragraphVue from './components/blocks/types/paragraph.vue';
import quoteVue from './components/blocks/types/quote.vue';
import tableVue from './components/blocks/types/table.vue';
import to_doVue from './components/blocks/types/to_do.vue';
import toggle_heading_1Vue from './components/blocks/types/toggle_heading_1.vue';
import toggle_heading_2Vue from './components/blocks/types/toggle_heading_2.vue';
import toggle_heading_3Vue from './components/blocks/types/toggle_heading_3.vue';
import toggle_listVue from './components/blocks/types/toggle_list.vue';
import selectionVue from './components/blocks/selection.vue';


const plugin: Plugin = {
  install(app, options) {
    app.component('blocks', blockVue);
    app.component('blocks-selection', selectionVue);
    app.component('blocks-components-editor', block_editorVue);
    app.component('blocks-types-bulleted-list', bulleted_listVue);
    app.component('blocks-types-code', codeVue);
    app.component('blocks-types-columns', columnsVue);
    app.component('blocks-types-columns-2', columns_2Vue);
    app.component('blocks-types-columns-3', columns_3Vue);
    app.component('blocks-types-columns-4', columns_4Vue);
    app.component('blocks-types-columns-5', columns_5Vue);
    app.component('blocks-types-heading', headingVue);
    app.component('blocks-types-heading-1', heading_1Vue);
    app.component('blocks-types-heading-2', heading_2Vue);
    app.component('blocks-types-heading-3', heading_3Vue);
    app.component('blocks-types-page', pageVue);
    app.component('blocks-types-paragraph', paragraphVue);
    app.component('blocks-types-quote', quoteVue);
    app.component('blocks-types-table', tableVue);
    app.component('blocks-types-to-do', to_doVue);
    app.component('blocks-types-toggle-heading-1', toggle_heading_1Vue);
    app.component('blocks-types-toggle-heading-2', toggle_heading_2Vue);
    app.component('blocks-types-toggle-heading-3', toggle_heading_3Vue);
    app.component('blocks-types-toggle-list', toggle_listVue);
  }
}

export default plugin