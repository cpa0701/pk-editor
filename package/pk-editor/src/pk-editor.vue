<template>
  <div :id="id" class="pk-markdown"/>
</template>

<script>
  import $ from 'jquery'
  import Vue from 'vue'
  import Editor from 'tui-editor/dist/tui-editor-Editor-all'
  import Viewer from 'v-viewer/src/component.vue'
  import emojiJson from '../lib/emoji/emoji-json'
  import {toggle} from '../lib/js/fullScreen'

  export default {
    name: 'PkEditor',
    props: {
      value: {
        type: String,
        default: ''
      },
      id: {
        type: String,
        required: false,
        default () {
          return 'markdown-editor'
        }
      },
      options: {
        type: Object,
        default () {
          return {}
        }
      },
      mode: {
        type: String,
        default: 'wysiwyg'
      },
      height: {
        type: String,
        required: false,
        default: '300px'
      },
      language: {
        type: String,
        required: false,
        default: 'zh_CN' // https://github.com/nhnent/tui.editor/tree/master/src/js/langs
      },
      viewer: {
        type: Boolean,
        required: false,
        default: false
      },
      divideImg: {
        type: Boolean,
        required: false,
        default: false
      },
      placeholder: {
        type: String,
        default: ''
      },
      uploadFunc:{
        type:Function
      }
    },
    data () {
      return {
        editor: null,
        defaultOptions: {
          minHeight: '300px',
          previewStyle: 'vertical',
          useCommandShortcut: true,
          useDefaultHTMLSanitizer: true,
          usageStatistics: false,
          hideModeSwitch: true,
          toolbarItems: [
            'heading',
            'bold',
            'italic',
            'strike',
            'divider',
            'hr',
            'quote',
            'divider',
            'ul',
            'ol',
            'task',
            // 'indent',
            // 'outdent',
            'divider',
            'table',
            'image',
            'link',
            'divider',
            'code',
            'codeblock',
            'divider'
          ],
          placeholder: this.placeholder,
          hooks: this.uploadFunc?{
            addImageBlobHook: (file, callback) => {
              this.uploadFunc(file, callback)
            }
          }:{},
          exts: [
            'colorSyntax'
          ]
        }
      }
    },
    computed: {
      editorOptions () {
        const options = Object.assign({}, this.defaultOptions, this.options)
        options.initialEditType = this.mode
        options.height = this.height
        options.language = this.language
        return options
      }
    },
    watch: {
      value (newValue, preValue) {
        if (newValue !== preValue && (this.editor.getValue ? newValue !== this.editor.getValue() : true)) { // viewer是没有getValue和focus方法的
          this.setValue(newValue)
          this.editor.focus && this.editor.focus()
        }
      },
      language () {
        this.destroyEditor()
        this.initEditor()
      },
      height (newValue) {
        this.editor.height && this.editor.height(newValue)
      },
      mode (newValue) {
        this.editor.changeMode(newValue)
      },
      viewer () {
        this.destroyEditor()
        this.initEditor()
      }
    },
    mounted () {
      this.initEditor()
    },
    destroyed () {
      this.destroyEditor()
    },
    methods: {
      initEditor () {
        this.editor = Editor.factory({
          el: document.getElementById(this.id),
          viewer: this.viewer,
          ...this.editorOptions
        })
        if (this.value) {
          this.setValue(this.value)
        }
        if (!this.viewer) {
          // this.editor.on('change', () => {
          //   this.$emit('input', this.editor.getValue())
          // })
          this.toolbar = this.editor.getUI().getToolbar()
          this.addToolbarItem()
          this.editor.focus()
        }
        // 监听事件
        this.editor.on('change', () => {
          this.$emit('input-value', this.editor.getValue())
          this.$emit('input-html', this.editor.getHtml())
        })
      },
      /**
       * 增加自定义的toolbar
       */
      addToolbarItem () {
        this.initEmojiItem()
        this.initFullScreenItem()
      },
      /**
       * 生成emoji按钮
       */
      initEmojiItem () {
        const emoji = `<button class="emoji"></button>`
        // 添加emoji
        this.toolbar.addItem({
          type: 'button',
          options: {
            name: 'emoji',
            $el: $(emoji),
            event: 'emojiButtonClicked',
            tooltip: 'emoji表情'
          }
        })
        const $emojiRoot = $('<ul></ul>')
        Object.values(emojiJson).map(v => {
          const emojiText = `&#x${v[0].substring(2)};`
          const $emoji = $(`<li class="emoji-icon">${emojiText}</li>`)
          $emoji.on('click', (e) => {
            this.editor.insertText(e.target.innerHTML)
          })
          $emojiRoot.append($emoji)
        })
        // 绑定点击emoji按钮事件
        const emojiButtonIndex = this.toolbar.indexOfItem('emoji')
        const $button = this.toolbar.getItem(emojiButtonIndex).$el
        this.editor.eventManager.addEventType('emojiButtonClicked')
        this.editor.eventManager.listen('emojiButtonClicked', () => {
          if (popup.isShow()) {
            popup.hide()
            return
          }

          const _$button$get = $button.get(0)
          const offsetTop = _$button$get.offsetTop
          const offsetLeft = _$button$get.offsetLeft

          popup.$el.css({
            top: offsetTop + $button.outerHeight(),
            right: _$button$get.parentElement.offsetWidth - offsetLeft - _$button$get.offsetWidth
          })

          popup.show()
        })
        // 生成emoji弹框
        const popup = this.editor.getUI().createPopup({
          header: false,
          title: false,
          content: $emojiRoot,
          className: 'emoji-list',
          $target: this.editor.getUI().getToolbar().$el,
          css: {
            'width': '300px',
            'height': '260px',
            'position': 'absolute'
          }
        })
        // 聚焦时弹框消失
        this.editor.eventManager.listen('focus', function () {
          popup.hide()
        })
      },
      /**
       * 生成全屏非全屏按钮
       */
      initFullScreenItem () {
        const $root = this.editor.getUI().$el
        this.editor.eventManager.addEventType('toggleFullScreen')
        this.editor.eventManager.listen('toggleFullScreen', function () {
          const $fullscreen = $($root).find('.fullscreen')
          if ($fullscreen.hasClass('exit-fullscreen')) {
            $fullscreen.removeClass('exit-fullscreen')
          } else {
            $fullscreen.addClass('exit-fullscreen')
          }
          toggle.toggleFullScreen($root[0])
        })
        this.toolbar.addItem({
          type: 'button',
          options: {
            name: 'fullScreen',
            tooltip: '全屏/非全屏',
            event: 'toggleFullScreen',
            $el: $('<button class="fullscreen"></button>')
          }
        })
      },
      destroyEditor () {
        if (!this.editor) return
        this.editor.off('change')
        this.editor.remove()
      },
      setValue (value) {
        this.editor.setValue(value)
        if (this.divideImg) {
          this.divider()
        } else {
          this.parseImg()
        }
      },
      getValue () {
        return this.editor.getValue()
      },
      setHtml (value) {
        this.editor.setHtml(value)
      },
      getHtml () {
        return this.editor.getHtml()
      },
      exec (cmd) {
        this.editor.exec(cmd)
      },
      /**
       * 对图片新增viewer组件效果
       */
      parseImg () {
        setTimeout(() => {
          $('.tui-editor-contents').find('img:not(.viewer-image)').each((i, v) => {
            const markedVue = new Vue({
              components: {
                Viewer
              },
              data () {
                return {
                  image: v.src
                }
              },
              template: `
                <viewer :options="{toolbar: false, title: false, navbar: false}" :images="[image]"><img :src="image"
                                                                                                        class="viewer-image">
                </viewer>`
            }).$mount()
            $(v).replaceWith(markedVue.$el)
          })
        }, 500)
      },
      /**
       * 将文字与图片分开展示
       */
      divider () {
        setTimeout(() => {
          $(`#${this.id}`).find('img:not(.viewer-image)').each((i, v) => {
            const markedVue = new Vue({
              components: {
                Viewer
              },
              data () {
                return {
                  image: v.src
                }
              },
              template: `
                <viewer :options="{toolbar: false, title: false, navbar: false}" :images="[image]"><img :src="image"
                                                                                                        class="viewer-image">
                </viewer>`
            }).$mount()
            $(v).remove()
            const $targetDom = $(`#${this.id}`).next('.img-list')
            $targetDom.children().length < 9 ? $targetDom.append(markedVue.$el) : ''
          })
        }, 500)
      }
    }
  }
</script>
<style scoped>
  @import '../../../node_modules/viewerjs/dist/viewer.css';
  @import '../../../node_modules/codemirror/lib/codemirror.css';
  @import "../lib/css/tui-color-picker.css";
  @import '../../../node_modules/tui-editor/dist/tui-editor.css';
  @import '../../../node_modules/tui-editor/dist/tui-editor-contents.css';
  @import "../lib/css/index.css";
</style>
