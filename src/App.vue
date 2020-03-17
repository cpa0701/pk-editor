<template>
  <div id="app">
    <pk-markdown :upload-url="'/user-api/uploadFile/image'"/>
  </div>
</template>

<script>
  import PkMarkdown from "../package/pk-markdown"

  export default {
    name: 'App',
    components: {
      PkMarkdown
    }
  }
</script>
