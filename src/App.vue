<template>
  <div id="app">
    <div>{{ $store.state.name }}</div>
    <div>{{ $store.state.age }}</div>
    <div>getters: {{ $store.getters.getAge }}</div>
    <button @click="commitChangeName">commit</button>
    <button @click="dispatchChangeName">dispatch</button>
  </div>
</template>

<script>
export default {
  name: 'App',
  methods: {
    commitChangeName() {
      this.$store.commit('changeName', 'hongshibao1')
    },
    dispatchChangeName() {
      this.$store.dispatch('changeName', 'hongshibao2')
    }
  }
}
</script>
