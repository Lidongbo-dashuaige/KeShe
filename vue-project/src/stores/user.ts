import { ref } from 'vue';

interface User {
  id: number;
  username: string;
  email?: string;
  avatar?: string;
  joinDate?: string;
}

const user = ref<User | null>(null);

function loadUserFromStorage() {
  const stored = localStorage.getItem('user');
  if (stored) {
    try {
      user.value = JSON.parse(stored);
    } catch (e) {
      console.error('Failed to parse user from localStorage');
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
    isLoggedIn: user,
    setUser,
    logout,
    updateUser
  };
}
