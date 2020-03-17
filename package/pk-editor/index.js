/**
 * Create by Pengan Chen on 2020/3/17
 */
// 导入组件，组件必须声明 name
import PkEditor from './src/pk-editor.vue'

// 为组件提供 install 安装方法，供按需引入
PkEditor.install = function (Vue) {
  Vue.component(PkEditor.name, PkEditor)

}

// 默认导出组件
export default PkEditor
