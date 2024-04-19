<template>
  <div class="space-y-4">
    <p class="hover:decoration-4 text-violet-400 text-2xl "><a href="https://github.com/yumexupanic/wsfmp4.js"
        target="_blank">wsfmp4.js</a></p>
    <div>
      <div class="relative mt-2 rounded-md shadow-sm">
        <input type="text" name="price" id="price" v-model="url"
          class="block w-full rounded-md border-0 py-1.5 pl-7 pr-20 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          placeholder="ws://">
      </div>
    </div>
    <video ref="media" width="1280" height="720" controls autoplay muted></video>
  </div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue';
import WSFMP4 from 'wsfmp4.js'

let media = ref(null)
let url = ref("ws://127.0.0.1:6060/stream")
let wsfmp4

const setup = () => {
  if (!url.value) {
    return
  }
  if (wsfmp4) {
    wsfmp4.destroy()
  }

  wsfmp4 = new WSFMP4(media.value, {
    debug: true,
    url: url.value
  })
}

watch(url, setup)
onMounted(setup)
</script>


<style scoped></style>
