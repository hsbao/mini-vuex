export const mapState = (arrayList) => {
  let map = {}
  for (let i = 0; i < arrayList.length; i++) {
    const stateName = arrayList[i]
    map[stateName] = function () {
      return this.$store.state[stateName] || ''
    }
  }
  return map
}

export const mapGetters = (arrayList) => {
  let map = {}
  for (let i = 0; i < arrayList.length; i++) {
    const getterName = arrayList[i]
    map[getterName] = function () {
      return this.$store.getters[getterName] || ''
    }
  }
  return map
}

export const mapMutations = (arrayList) => {
  let map = {}
  for (let i = 0; i < arrayList.length; i++) {
    const methodName = arrayList[i]
    map[methodName] = function (payload) {
      this.$store.commit(methodName, payload)
    }
  }
  return map
}

export const mapActions = (arrayList) => {
  let map = {}
  for (let i = 0; i < arrayList.length; i++) {
    const methodName = arrayList[i]
    map[methodName] = function (payload) {
      this.$store.dispatch(methodName, payload)
    }
  }
  return map
}
