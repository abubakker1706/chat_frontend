<template>
    <q-dialog v-model="show" persistent>
      <q-card>
        <q-card-section>
          <q-input outlined v-model="searchQuery" placeholder="Search users..." @keyup.enter="searchUsers">
            <template v-slot:append>
              <q-icon name="search" @click="searchUsers" />
            </template>
          </q-input>
          <q-list bordered>
            <q-item v-for="user in searchResults" :key="user.id" clickable @click="addMember(user)">
              <q-item-section>{{ user.username }}</q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Close" color="primary" @click="closeDialog" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  
  const show = ref(true);
  const searchQuery = ref('');
  const searchResults = ref([]);
  
  const searchUsers = () => {
    // Your search users logic
  };
  
  const addMember = () => {
    // Your add member logic
  };
  
  const closeDialog = () => {
    // Your close dialog logic
  };
  </script>
  