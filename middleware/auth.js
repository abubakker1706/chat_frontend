import { useAuthStore } from "~/stores/auth";

export default defineNuxtRouteMiddleware((to, from) => {
    const authStore = useAuthStore();
  
    if (!authStore.user && to.path === '/chat') {
      return navigateTo('/login');
    }
  });
  