<script setup lang="ts">
import { useHead } from '@vueuse/head'
import { computed, reactive } from 'vue'

const siteData = reactive({
  title: `My website`,
  description: `My beautiful website`,
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
    <router-link to="/"> home </router-link>
    <h1>MAIN {{ siteData.title }}!!!</h1>
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
