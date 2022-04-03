<template>
  <div id="app">
    <div>{{ name }}</div>
    <div>{{ $store.state.age }}</div>
    <div>getters: {{ getAge }}</div>
    <button @click="changeName('hahaha')">commit</button>
    <button @click="dispatchChangeName('hehehe')">dispatch</button>
  </div>
</template>

<script>
import { mapState, mapGetters, mapMutations, mapActions } from './vuex'
export default {
  name: 'App',
  computed: {
    ...mapState(['name']),
    ...mapGetters(['getAge'])
  },
  methods: {
    // commitChangeName() {
    //   this.$store.commit('changeName', 'hongshibao1')
    // },
    ...mapMutations(['changeName']),
    // dispatchChangeName() {
    //   this.$store.dispatch('changeName', 'hongshibao2')
    // }
    ...mapActions(['dispatchChangeName'])
  }
}
</script>
