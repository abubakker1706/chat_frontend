<template>
    <div>
      IM Bhala 
      <button @click="counterStore.increase">+</button>
      <span>{{counterStore.count}}</span>
      <button @click="counterStore.decrease">-</button>
      <div>
      -------------------------------------------------------------
      </div>
      <Abu :user="user"/>
      
    </div>
</template>

<script setup>
 
 import { useCounterStore } from '~/stores/counter';

 const counterStore = useCounterStore()
const user = ref("User is from bhal component")


</script>

<style lang="scss" scoped>

</style>