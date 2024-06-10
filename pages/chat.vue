<template>
    <div v-if="authStore.user">
      
    
 
      <ChatMain/>
    </div>
    <div v-else>
      <p>You are not logged in. Redirecting to login...</p>
    </div>
  </template>
  
  <script setup>
  import { onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  import { useAuthStore } from '../stores/auth';
  import ChatMain from "~/components/NewChat/ChatMain.vue"
  
  const authStore = useAuthStore();
  const router = useRouter();
  
  onMounted(() => {
    if (!authStore.user) {
      router.push('/login');
    }
  });
  </script>
  
  <style scoped>
  /* Add your styles here */
  </style>
  