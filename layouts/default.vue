<template>
  <div>
    <header style="position: sticky; top: 0; background-color: #1976D2; height: 7vh; display: flex; align-items: center; justify-content: flex-end;">
      <nav style="margin: 0; padding: 0; display: flex;">
        <ul style="display: flex; gap: 2rem; list-style-type: none; padding: 0; margin: 0; margin-right: 2rem">
          <li><NuxtLink to="/">Home</NuxtLink></li>
          <li><NuxtLink to="/about">About</NuxtLink></li>
          <li><NuxtLink to="/product">Product</NuxtLink></li>
          <li v-if="!authStore.user"><NuxtLink to="/login">Login</NuxtLink></li>
          <li v-else>
            <NuxtLink to="/chat">Chat</NuxtLink>
            <button @click="logout" style="background: none; border: none; color: white; cursor: pointer;">Logout</button>
          </li>
        </ul>
        <q-chip v-if="user">
        <q-avatar>
          <img src="https://cdn.quasar.dev/img/boy-avatar.png">
        </q-avatar>
        {{ user?.username }}
      </q-chip>
      </nav>
    </header>
    <div>
      <slot />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useAuthStore } from '../stores/auth';
import axios from 'axios';

const authStore = useAuthStore();
const tokenString = localStorage.getItem('user');
  const token = JSON.parse(tokenString);
  const user = ref(null)
const fetchUserData = async () => {
  try {
    const response = await axios.get('http://localhost:8080/api/auth/user', {
      headers: {
        'Authorization': `Bearer ${token?.token}`
      }
    });
    console.log('User data In layout:', response.data); 
    user.value = response.data; 
  } catch (error) {
    console.error('Error fetching user data:', error);
  }
};
const logout = () => {
  authStore.logout();
};
onMounted(() => {
  if(token){
  fetchUserData()
  }
})
</script>

<style scoped>
a {
  text-decoration: none;
  color: white;
}
</style>
