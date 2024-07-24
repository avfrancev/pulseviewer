<template lang="pug">
.container.mx-auto.px-2.mt-4
  PulsesViewer
</template>

<script setup>
import PulsesViewer from "@/modules/PulsesViewer/PulsesViewer.vue"
</script>

<style lang="sass">
html, body
  scroll-behavior: smooth
  height: 100%
  display: grid
  &[data-theme='cupcake']
    background-image: url("corrugation.png")
  &[data-theme='dark']
    background-image: url("dark-dotted-2.png")
  
#app
  position: relative
  width: 100%
  min-height: 100vh
  
path
  vector-effect: non-scaling-stroke

</style>
