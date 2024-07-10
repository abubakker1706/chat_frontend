<template>
    <div>
       This Abu 
      
       {{user}}

     
    </div>
</template>

<script setup>

import axios from 'axios';

const user = ref('')


const fetchUserFromSSR = async () => {
  try {
    const response = await axios.get('/api/user/get-all-users');
    
    // user.value = response.data;
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