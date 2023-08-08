/**
 * main.ts
 *
 * Bootstraps Vuetify and other plugins then mounts the App`
 */

// Components
import App from './App.vue'

// Composables
import { createApp } from 'vue'

// Plugins
import { registerPlugins } from '@/plugins'
import { createVuetify } from 'vuetify'
import { createVueI18nAdapter } from 'vuetify/locale/adapters/vue-i18n'
import { createI18n, useI18n } from 'vue-i18n'
import en from './locale/en.json'
import ru from './locale/ru.json'

const messages = {
    en: en,
    ru: ru,
}

const i18n = createI18n({
    legacy: false, // Vuetify does not support the legacy mode of vue-i18n
    locale: 'ru',
    fallbackLocale: 'en',
    messages,
})

const app = createApp(App)
const vuetify = createVuetify({
    theme: {defaultTheme: 'dark'},
    locale: {adapter: createVueI18nAdapter({ i18n, useI18n })}
})


registerPlugins(app)

app.use(i18n).use(vuetify).mount('#app')
