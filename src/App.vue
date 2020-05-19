<template>
  <div id="app">
    <pk-markdown :upload-url="'/user-api/uploadFile/image'" :value="value" @input-value="change" />
    <hr>
    <p>页面效果如下</p>
    <pk-markdown id="viewer" :value="value" viewer />
  </div>
</template>

<script>
import PkMarkdown from '../package/pk-markdown'

export default {
  name: 'App',
  components: {
    PkMarkdown
  },
  data() {
    return {
      value: ''
    }
  },
  methods: {
    change(value) {
      this.value = value
    }
  }
}
</script>
<style>
  #viewer {
    overflow: auto;
    height: calc(100vh - 8px - 300px - (21px + 32px) - 20px);
    border: 1px solid #ddd;
  }
</style>
