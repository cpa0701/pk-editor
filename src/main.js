import Vue from 'vue'
import App from './App.vue'

// 注册组件库
Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')
