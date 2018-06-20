import Vue from 'vue'
import VueI18n from 'vue-i18n'

import Flextable from './Flextable.vue'

import store from './store/table'
import messages from './translations/all.js'

Vue.use(VueI18n)

const i18n = new VueI18n({
  locale: window.Craft.locale,
  fallbackLocale: 'en',
  messages,
})

console.log(i18n)


new Vue({
  el: '.vue-flextable-app',
  components: {
    Flextable
  },
  i18n, store
})

