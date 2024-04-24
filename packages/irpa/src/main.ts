import { createApp } from 'vue'
import App from './App.vue';
import { createIrpa } from './plugins/index'

const app = createApp(App)
const irpa = createIrpa();
app.use(irpa)

app.mount('#app')
