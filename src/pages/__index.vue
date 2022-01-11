<script setup lang="ts">
import { useHead } from '@vueuse/head'
import { computed, reactive } from 'vue'

const siteData = reactive({
  title: `index page`,
  description: `My beautiful website - home!`,
})

useHead({
  // Can be static or computed
  title: computed(() => siteData.title),
  meta: [
    {
      name: `description`,
      content: computed(() => siteData.description),
    },
  ],
})
</script>

<template>
  <div>
    <h1>Index!!</h1>
    <router-link to="/main"> main </router-link>
  </div>
</template>

<style scoped>
a {
  color: #42b983;
}

label {
  margin: 0 0.5em;
  font-weight: bold;
}

code {
  background-color: #eee;
  padding: 2px 4px;
  border-radius: 4px;
  color: #304455;
}
</style>
