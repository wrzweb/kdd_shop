//entry 入口文件 
import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
import './assets/css/global.css'
import './assets/fonts/iconfont.css'
import './filter.js'
// 阻止启动生产消息
Vue.config.productionTip = false
// 导入axios
import axios from "axios"
// 配置默认路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
//axios拦截器是为了复用代码，把每个ajax头信息提取到拦截器中(通过token拿数据，发向服务器)

			axios.interceptors.request.use(function(config){
        config.headers.Authorization=window.sessionStorage.getItem('token')
			return config;
			},function(error){
      console.log(error)
      }
      )
// 把axios挂载到原型上
Vue.prototype.$http=axios


import ZkTable from 'vue-table-with-tree-grid'
Vue.component('tree-table', ZkTable)
new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
