/*!
 * FlexTable plugin for Craft CMS
 *
 * FlexTableField Field JS
 *
 * @author    Knut Svangstu
 * @copyright Copyright (c) 2018 Knut Svangstu
 * @link      https://vangenplotz.no/
 * @package   FlexTable
 * @since     2.0.0FlexTableFlexTableField
 */

import Vue from 'vue'
import VueI18n from 'vue-i18n'

import Flextable from './Flextable.vue'

import store from './store/store'
import messages from './translations/all.js'

Vue.use(VueI18n)

const i18n = new VueI18n({
  locale: window.Craft.language,
  fallbackLocale: 'en',
  messages,
})

window.initVue = (id) => {

  new Vue({
    el: `#${id}`,
    components: {
      Flextable
    },
    i18n, store
  })
}
