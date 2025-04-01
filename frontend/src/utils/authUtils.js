export const saveAuthData = (data, rememberMe = false) => {
  const storage = rememberMe ? localStorage : sessionStorage;
  
  // Save to selected storage
  storage.setItem('token', data.token);
  storage.setItem('role', data.role);
  storage.setItem('userId', data.userId || '1');
  storage.setItem('rememberMe', rememberMe.toString());

  // Clear other storage to prevent conflicts
  const otherStorage = rememberMe ? sessionStorage : localStorage;
  otherStorage.clear();
};

export const getAuthData = () => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  const role = localStorage.getItem('role') || sessionStorage.getItem('role');
  const userId = localStorage.getItem('userId') || sessionStorage.getItem('userId');

  return { token, role, userId };
};

export const clearAuthData = () => {
  localStorage.clear();
  sessionStorage.clear();
};

export const isAuthenticated = () => {
  const { token } = getAuthData();
  return !!token;
};