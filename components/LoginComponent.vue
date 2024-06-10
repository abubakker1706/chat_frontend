<template>
    <div>


<q-card dark bordered class="bg-blue-9 my-card" style="width: 30%; left: 35%;margin-top: 10%;height:45vh;border-radius: 10px">
      <q-card-section>
        <div class="text-h6">Login Page</div>
      
      </q-card-section>

      <q-separator dark inset />

      <q-card-section style="display: flex;flex-direction: column;gap: 1rem">
        <q-input v-model="email" label="Email" color="blue" bg-color="white"/>
        <q-input v-model="password" type="password" label="Password"   color="blue" bg-color="white" />
        <q-btn color="primary" @click="login">Login</q-btn>
      </q-card-section>
      <p style="margin-left: 10rem;">NOT A MEMBER? <label style="cursor: pointer;"><NuxtLink to="/signup" style="color:white">Signup</NuxtLink></label></p>
    </q-card>
    </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
const email = ref('')

const password = ref('')
const router = useRouter();
const authStore = useAuthStore();

const login = async () => {
  try {
    await authStore.login(email.value, password.value);
    alert("Login successful")
    router.push('/chat');
  } catch (error) {
    alert(error)
    console.error('Login failed:', error);
  }
};

</script>

<style lang="scss" scoped>

</style>