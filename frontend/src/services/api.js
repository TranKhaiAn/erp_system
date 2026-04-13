import axios from 'axios';

// Khởi tạo một đối tượng axios với cấu hình mặc định
const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL, // Lấy từ file .env
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000, // Quá 10s không thấy server trả lời là báo lỗi TimeOut
});

// INTERCEPTOR REQUEST: Can thiệp trước khi gửi API đi
api.interceptors.request.use(
    (config) => {
        // Tìm token ở cả 2 túi (localStorage và sessionStorage)
        const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
        
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// INTERCEPTOR RESPONSE: Can thiệp khi Server trả dữ liệu về
api.interceptors.response.use(
    (response) => {
        return response.data;
    },
    (error) => {
        if (error.response && error.response.status === 401) {
            if (error.config.url.includes('/auth/login')) {
                return Promise.reject(error);
            }

            console.error("Phiên đăng nhập hết hạn!");
            
            // ĐÃ SỬA: Dọn sạch cả 2 túi để thằng Vue Router không bị nhầm lẫn nữa
            localStorage.removeItem('accessToken');
            localStorage.removeItem('userInfo');
            sessionStorage.removeItem('accessToken');
            sessionStorage.removeItem('userInfo');
            
            window.location.href = '/login'; 
        }
        return Promise.reject(error);
    }
);

export default api;