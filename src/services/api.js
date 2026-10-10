import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to inject JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('stocktrade_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor to handle unauthorized 401s
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If unauthorized, clear token and emit custom event or let AuthContext handle
      const currentPath = window.location.pathname;
      if (currentPath !== '/login' && currentPath !== '/register' && currentPath !== '/') {
        localStorage.removeItem('stocktrade_token');
        localStorage.removeItem('stocktrade_user');
        window.dispatchEvent(new Event('auth:unauthorized'));
      }
    }
    return Promise.reject(error);
  }
);

// Auth Services
export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getCurrentUser: () => api.get('/auth/me'),
};

// Stock Services
export const stockService = {
  getAllStocks: () => api.get('/stocks'),
  getStockById: (id) => api.get(`/stocks/${id}`),
  getStockBySymbol: (symbol) => api.get(`/stocks/symbol/${symbol}`),
  searchStocks: (query) => api.get(`/stocks/search?query=${encodeURIComponent(query || '')}`),
  createStock: (stockData) => api.post('/stocks', stockData),
  updateStock: (id, stockData) => api.put(`/stocks/${id}`, stockData),
  deleteStock: (id) => api.delete(`/stocks/${id}`),
  updateStockPrice: (id, price) => api.put(`/stocks/${id}/price`, { price }),
  simulateTick: () => api.post('/stocks/simulate-tick'),
};

// Trading Services
export const tradeService = {
  buyStock: (tradeData) => api.post('/trades/buy', tradeData),
  sellStock: (tradeData) => api.post('/trades/sell', tradeData),
  getUserTrades: (userId) => api.get(`/trades/user/${userId}`),
  getAllTrades: () => api.get('/trades'),
};

// Portfolio Services
export const portfolioService = {
  getUserPortfolio: (userId) => api.get(`/portfolio/${userId}`),
  getUserPortfolioSummary: (userId) => api.get(`/portfolio/${userId}/summary`),
};

// Wallet Services
export const walletService = {
  getWallet: (userId) => api.get(`/wallet/${userId}`),
  deposit: (depositData) => api.post('/wallet/deposit', depositData),
  withdraw: (withdrawData) => api.post('/wallet/withdraw', withdrawData),
  getWalletTransactions: (userId) => api.get(`/wallet/${userId}/transactions`),
};

// Admin Services
export const adminService = {
  getDashboard: () => api.get('/admin/dashboard'),
  getAllUsers: () => api.get('/admin/users'),
  updateUserStatus: (userId, status) => api.put(`/admin/users/${userId}/status`, { status }),
  getAllTransactions: () => api.get('/admin/transactions'),
  getUserPortfolio: (userId) => api.get(`/admin/users/${userId}/portfolio`),
};

export default api;
