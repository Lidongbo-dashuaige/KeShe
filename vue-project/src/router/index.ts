import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';
import Topics from '../views/Topics.vue';
import Practice from '../views/Practice.vue';
import Profile from '../views/Profile.vue';
import AIAssistant from '../views/AIAssistant.vue';
import Login from '../views/Login.vue';
import Register from '../views/Register.vue';
import { useUserStore } from '../stores/user';

const routes = [
  { path: '/', component: Home },
  { path: '/topics', component: Topics },
  { path: '/practice', component: Practice },
  { 
    path: '/profile', 
    component: Profile,
    meta: { requiresAuth: true }
  },
  { path: '/ai-assistant', component: AIAssistant },
  { 
    path: '/login', 
    component: Login,
    meta: { guest: true }
  },
  { 
    path: '/register', 
    component: Register,
    meta: { guest: true }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach((to, from, next) => {
  const userStore = useUserStore();
  const isLoggedIn = !!userStore.user.value;
  
  if (to.meta.requiresAuth && !isLoggedIn) {
    next({ path: '/login', query: { redirect: to.fullPath } });
  } else if (to.meta.guest && isLoggedIn) {
    next({ path: '/' });
  } else {
    next();
  }
});

export default router;
