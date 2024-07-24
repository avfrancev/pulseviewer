import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { GesturePlugin } from '@vueuse/gesture'


import App from './App.vue'

const app = createApp(App)

app.use(createPinia())
app.use(GesturePlugin)

app.mount('#app')
