<template>
    <div>
       This Abu 
       {{counterStore.count}}
       {{user}}

     
    </div>
</template>

<script setup>
import { defineProps } from 'vue';

import { useCounterStore } from '~/stores/counter';
import axios from 'axios';
const counterStore = useCounterStore()
const user = ref([])


const fetchUserFromSSR = async () => {
  try {
    const response = await axios.get('/api/user/get-all-users');
    
    user.value = response.data;
    console.log('fetching ssrrr', response.data);
  } catch (error) {
    console.log(error);
  }
};

onMounted(()=>{
    fetchUserFromSSR()

})

</script>

<style lang="scss" scoped>

</style>