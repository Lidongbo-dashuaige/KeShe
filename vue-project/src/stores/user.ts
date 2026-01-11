import { ref } from 'vue';

interface User {
  id: number;
  username: string;
  email?: string;
  avatar?: string;
  joinDate?: string;
}

const user = ref<User | null>(null);

console.log('Initializing user store, current user:', user.value);

function loadUserFromStorage() {
  const stored = localStorage.getItem('user');
  console.log('Loading user from storage:', stored);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      user.value = parsed;
      console.log('User loaded from storage:', user.value);
    } catch (e) {
      console.error('Failed to parse user from localStorage:', e);
    }
  }
}

loadUserFromStorage();

export function useUserStore() {
  function setUser(newUser: User) {
    user.value = newUser;
    localStorage.setItem('user', JSON.stringify(newUser));
  }

  function logout() {
    user.value = null;
    localStorage.removeItem('user');
  }

  function updateUser(updates: Partial<User>) {
    if (user.value) {
      user.value = { ...user.value, ...updates };
      localStorage.setItem('user', JSON.stringify(user.value));
    }
  }

  return {
    user,
    isLoggedIn: () => !!user.value,
    setUser,
    logout,
    updateUser
  };
}
