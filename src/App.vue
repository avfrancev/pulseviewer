<script setup lang="ts">

</script>

<template>
  <!-- main(class="container grid px-2 mx-auto min-h-svh") -->
  <main class="container mx-auto px-2 min-h-svh flex flex-col max-sm:max-w-[100svw]">
    <Navbar />
    <PulsesViewer />
  </main>

  <!-- Toast notifications -->
  <ToastContainer />
</template>

<style lang="sass">
  html, body
    scroll-behavior: smooth
    height: 100%
    width: 100%
    &[data-theme='light']
      background-image: url("/corrugation.png")
    &[data-theme='dark']
      background-image: url("/fake-brick.png")

  #app
    position: relative
    width: 100%
    min-height: 100vh

  path, circle
    vector-effect: non-scaling-stroke
</style>
