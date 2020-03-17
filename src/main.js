import Vue from 'vue'
import App from './App.vue'


import PkEditor from "../package/pk-editor"
// 注册组件库
Vue.use(PkEditor)
Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')
