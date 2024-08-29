<template lang="pug">
DialogRoot
  slot(name="trigger")
  DialogPortal
    DialogOverlay(class="bg-black/50 data-[state=open]:animate-overlayShow fixed inset-0 z-30")
      DialogContent(
        class="flex flex-col w-full lg:w-1/2 md:w-3/4 fixed top-[50%] mb-12 h-[90svh] left-[50%] container translate-x-[-50%] translate-y-[-50%] rounded bg-base-100 p-4 shadow-xl focus:outline-none z-[100]")
        slot(name="content")
</template>
