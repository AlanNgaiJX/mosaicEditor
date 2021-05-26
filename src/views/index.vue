<template>
  <div>
    <button @click="toEditor">to editor</button>
    <button @click="toOne">to one</button>
  </div>
</template>

<script>
export default {
  methods:{
    toEditor(){
      this.$router.push({
        path: 'editor'
      })
    },
    toOne(){
      this.$router.push({
        path: 'one'
      })
    }
  }
}
</script>