// Dedicated Local Mock Authentication Service
// Provides zero-latency local fallback authentication when the remote backend is unreachable or returns 404.

export interface MockUserProfile {
  id: number | string;
  username: string;
  email: string;
  role: string;
  company?: string;
  created_at: string;
}

export interface AuthSuccessResponse {
  access_token: string;
  token: string;
  expires_in: number;
  expires_at: number;
  message: string;
  user: MockUserProfile;
  isMockFallback: boolean;
}

const STORAGE_USERS_KEY = 'kavach_users';
const STORAGE_CURRENT_USER_KEY = 'kavach_current_user';

const DEFAULT_USERS: MockUserProfile[] = [
  {
    id: 1,
    username: "demo",
    email: "demo@kavach.ai",
    role: "admin",
    company: "Kavach Enterprise AI",
    created_at: "2026-08-01T00:00:00.000Z"
  },
  {
    id: 2,
    username: "alokinfo30",
    email: "alokinfo30@gmail.com",
    role: "admin",
    company: "Kavach-AI Enterprise",
    created_at: "2026-08-15T00:00:00.000Z"
  }
];

export function getStoredUsers(): MockUserProfile[] {
  try {
    const raw = localStorage.getItem(STORAGE_USERS_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(DEFAULT_USERS));
      return DEFAULT_USERS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_USERS;
  }
}

export function saveStoredUsers(users: MockUserProfile[]): void {
  try {
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
  } catch (err) {
    console.warn("[MockAuth] Failed to write users to localStorage", err);
  }
}

export function generateMockJwt(user: MockUserProfile): string {
  try {
    const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
    const exp = Math.floor(Date.now() / 1000) + 15 * 60; // 15 mins
    const payload = btoa(JSON.stringify({
      sub: user.id,
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      company: user.company || "Enterprise Corp",
      exp,
      iat: Math.floor(Date.now() / 1000)
    }));
    const sig = btoa("kavach_mock_signature");
    return `${header}.${payload}.${sig}`;
  } catch {
    return `mock_token_${Date.now()}_${user.username}`;
  }
}

export function localMockLogin(usernameOrEmail: string, password?: string): AuthSuccessResponse {
  const users = getStoredUsers();
  const normalized = (usernameOrEmail || "demo").trim().toLowerCase();
  
  let targetUser = users.find(
    u => u.username.toLowerCase() === normalized || u.email.toLowerCase() === normalized
  );

  if (!targetUser) {
    // Dynamically provision local user profile if not previously registered
    targetUser = {
      id: Date.now(),
      username: usernameOrEmail.includes('@') ? usernameOrEmail.split('@')[0] : usernameOrEmail || "demo",
      email: usernameOrEmail.includes('@') ? usernameOrEmail : `${usernameOrEmail || "demo"}@kavach.ai`,
      role: "admin",
      company: "Kavach Enterprise",
      created_at: new Date().toISOString()
    };
    users.push(targetUser);
    saveStoredUsers(users);
  }

  const token = generateMockJwt(targetUser);
  const expiresAt = Date.now() + 15 * 60 * 1000;

  localStorage.setItem('token', token);
  localStorage.setItem('session_expires_at', expiresAt.toString());
  localStorage.setItem(STORAGE_CURRENT_USER_KEY, JSON.stringify(targetUser));

  console.info(`[MockAuth] Authenticated user "${targetUser.username}" via local fallback storage.`);

  return {
    access_token: token,
    token: token,
    expires_in: 900,
    expires_at: expiresAt,
    message: "Authenticated via local fallback service",
    user: targetUser,
    isMockFallback: true
  };
}

export function localMockRegister(
  username: string, 
  email: string, 
  password?: string, 
  company?: string
): AuthSuccessResponse {
  const users = getStoredUsers();
  const cleanUsername = (username || email.split('@')[0] || "user").trim();
  const cleanEmail = (email || `${cleanUsername}@example.com`).trim();

  // Check if user already exists
  const existing = users.find(u => u.email.toLowerCase() === cleanEmail.toLowerCase());
  if (existing) {
    return localMockLogin(cleanEmail, password);
  }

  const newUser: MockUserProfile = {
    id: Date.now(),
    username: cleanUsername,
    email: cleanEmail,
    role: "admin",
    company: company || "Enterprise Corp",
    created_at: new Date().toISOString()
  };

  users.push(newUser);
  saveStoredUsers(users);

  const token = generateMockJwt(newUser);
  const expiresAt = Date.now() + 15 * 60 * 1000;

  localStorage.setItem('token', token);
  localStorage.setItem('session_expires_at', expiresAt.toString());
  localStorage.setItem(STORAGE_CURRENT_USER_KEY, JSON.stringify(newUser));

  console.info(`[MockAuth] Registered new user "${newUser.username}" via local fallback storage.`);

  return {
    access_token: token,
    token: token,
    expires_in: 900,
    expires_at: expiresAt,
    message: "Registration completed via local fallback service",
    user: newUser,
    isMockFallback: true
  };
}

export function getLocalMockCurrentUser(): MockUserProfile {
  try {
    const raw = localStorage.getItem(STORAGE_CURRENT_USER_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }
  return DEFAULT_USERS[0];
}
