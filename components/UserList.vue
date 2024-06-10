<template>
    <q-list bordered>
      <q-item v-for="user in users" :key="user.id" clickable @click="selectUser(user)">
        <q-item-section>{{ user.username }}</q-item-section>
      </q-item>
    </q-list>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  
  const users = ref([]);
  
  const selectUser = (user) => {
    // Emit select event
  };
  </script>
  