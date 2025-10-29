// auth.js - 인증 관련 로직

export function isAuthenticated() {
    return !!localStorage.getItem('accessToken');
}

export function getAuthToken() {
    return localStorage.getItem('accessToken');
}