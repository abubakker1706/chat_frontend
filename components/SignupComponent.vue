<template>
    <div>


<q-card dark bordered class="bg-blue-9 my-card" style="width: 30%; left: 35%;margin-top: 10%;height:55vh;border-radius: 10px">
      <q-card-section>
        <div class="text-h6">Signup Page</div>
      
      </q-card-section>

      <q-separator dark inset />

      <q-card-section style="display: flex;flex-direction: column;gap: 1rem">
        <q-input v-model="username" label="Username" color="blue" bg-color="white"/>
        <q-input v-model="email" type="email" label="Email"   color="blue" bg-color="white" />
        <q-input v-model="password" type="password" label="Password"   color="blue" bg-color="white" />
      
        <q-btn color="primary" @click="signup">Signup</q-btn>
      </q-card-section>
      <p style="margin-left: 10rem;">Already have account? <label style="cursor: pointer;"><NuxtLink to="/login" style="color:white">Login</NuxtLink></label></p>
    </q-card>
    </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
const username = ref('')

const password = ref('')
const email = ref('')
const router = useRouter();
const authStore = useAuthStore();

const signup = async () => {
  try {
    await authStore.signup(username.value, email.value, password.value);
    alert("Signup successful")
    router.push('/login');
  } catch (error) {
    console.error('Signup failed:', error);
  }
};


</script>

<style lang="scss" scoped>

</style>