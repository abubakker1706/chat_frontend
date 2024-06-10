<template>
    <q-input outlined v-model="searchQuery" placeholder="Search users..." @keyup.enter="searchUsers">
      <template v-slot:append>
        <q-icon name="search" @click="searchUsers" />
      </template>
    </q-input>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  
  const searchQuery = ref('');
  
  const searchUsers = () => {
    // Your search users logic
  };
  </script>
  