<template>
    <q-drawer show-if-above side="left" overlay bordered>
      <q-list>
        <q-item clickable v-ripple>
          <q-item-section avatar>
            <q-avatar>
              <img src="https://via.placeholder.com/50" alt="User Avatar">
            </q-avatar>
          </q-item-section>
          <q-item-section>
            <q-item-label>Amit Prajapati</q-item-label>
            <q-item-label caption>online</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  import { useQuasar } from 'quasar';
  
  const $q = useQuasar();
  </script>
  
  <style scoped>
  .q-drawer {
    width: 250px;
  }
  </style>
  