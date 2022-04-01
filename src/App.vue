<template>
  <div id="app">
    <div>{{ $store.state.name }}</div>
    <div>{{ $store.state.age }}</div>
    <div>getters: {{ $store.getters.getAge }}</div>
    <div @click="$store.state.age += 1">on click</div>
  </div>
</template>

<script>
export default {
  name: 'App',
  components: {}
}
</script>
