<template>
  <div>
    <UInput v-model="value"/>
    <UTextarea v-model="value" />
  </div>
</template>

<script setup lang="ts">

const value = ref('')
const isOpen = ref(false)
</script>
