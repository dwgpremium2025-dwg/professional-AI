import { User, Role } from '../types';

// Simulating Firebase Database with LocalStorage
const STORAGE_KEY = 'perpect_ai_users';

const DEFAULT_ADMIN: User = {
  id: 'admin-001',
  username: 'admin',
  role: Role.ADMIN,
  isActive: true
};

// Initial setup
const initDB = () => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    // Seed with admin and one test user
    const initialUsers = [
      DEFAULT_ADMIN,
      {
        id: 'user-001',
        username: 'member1',
        role: Role.MEMBER,
        isActive: true,
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
      }
    ];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialUsers));
    
    // Initial creds setup
    localStorage.setItem('perpect_ai_creds', JSON.stringify({
      'admin': '1234',
      'member1': '123456'
    }));
  } else {
    // Force update admin password to 1234 for existing sessions (Development convenience)
    const creds = JSON.parse(localStorage.getItem('perpect_ai_creds') || '{}');
    creds['admin'] = '1234';
    localStorage.setItem('perpect_ai_creds', JSON.stringify(creds));
  }
};

initDB();

export const authService = {
  login: (username: string, pass: string): User | null => {
    const creds = JSON.parse(localStorage.getItem('perpect_ai_creds') || '{}');
    if (creds[username] === pass) {
      const users = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      const user = users.find((u: User) => u.username === username);
      
      if (user) {
        if (!user.isActive) throw new Error("Account is inactive.");
        if (user.expiryDate && new Date(user.expiryDate) < new Date()) {
          throw new Error("Account expired.");
        }
        return user;
      }
    }
    return null;
  },

  getAllUsers: (): User[] => {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  },

  addUser: (username: string, pass: string, expiryDate?: string) => {
    const users = authService.getAllUsers();
    if (users.find(u => u.username === username)) throw new Error("User exists");

    const newUser: User = {
      id: `user-${Date.now()}`,
      username,
      role: Role.MEMBER,
      isActive: true,
      expiryDate
    };

    users.push(newUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));

    const creds = JSON.parse(localStorage.getItem('perpect_ai_creds') || '{}');
    creds[username] = pass;
    localStorage.setItem('perpect_ai_creds', JSON.stringify(creds));
    
    return newUser;
  },

  updatePassword: (username: string, newPass: string) => {
    const creds = JSON.parse(localStorage.getItem('perpect_ai_creds') || '{}');
    creds[username] = newPass;
    localStorage.setItem('perpect_ai_creds', JSON.stringify(creds));
    
    // Force logout (logic handled in frontend by checking validity on actions)
  },

  toggleStatus: (userId: string) => {
    const users = authService.getAllUsers();
    const idx = users.findIndex(u => u.id === userId);
    if (idx !== -1 && users[idx].role !== Role.ADMIN) {
      users[idx].isActive = !users[idx].isActive;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
    }
    return users;
  }
};