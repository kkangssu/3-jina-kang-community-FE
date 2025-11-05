// storage.js - 로컬 스토리지 관련 로직
/*
토큰 저장, 조회, 삭제
회원 정보 저장, 조회, 삭제
전체관리 - 로그아웃

+ 만료
*/

const STORAGE_KEYS = {
    ACCESS_TOKEN: 'accessToken',
    USER: 'user',
}

// access token
// 토큰 저장
export function setAccessToken(token) {
    // 토큰이 빈 경우 -> 실패하면 로그인 페이지로 이동
    if(!token || token.trim() === '') {
        clearAuth();
        return;
    }
    // 토큰 저장 -> 실패하면 로그인 페이지로 이동
    try {
        localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
    } catch (error) {
        console.error('토큰 저장 에러:', error);
        M.toast({ html: '토큰 저장 실패: ' + error.message });
        clearAuth();
    }
}

// 토큰 조회
export function getAccessToken() {
    return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
}

// 토큰 삭제
export function removeAccessToken() {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
}

// user
// 회원 정보 저장
export function setUser(user) {
    // 회원 정보가 빈 경우 -> 실패하면 로그인 페이지로 이동
    if(!user) {
        clearAuth();
        return;
    }
    // 회원 정보 저장 -> 실패하면 로그인 페이지로 이동
    try {
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    } catch (error) {
        console.error('회원 정보 저장 에러:', error);
        M.toast({ html: '회원 정보 저장 실패: ' + error.message });
        clearAuth();
    }
}

// 회원 정보 조회
export function getUser() {
    try {
        const userData = localStorage.getItem(STORAGE_KEYS.USER);
        if(!userData) {
            return null;
        }
        return JSON.parse(userData);
    } catch (error) {
        console.error('회원 정보 조회 에러:', error);
        return null;
    }
}

// 회원 정보 삭제
export function removeUser() {
    localStorage.removeItem(STORAGE_KEYS.USER);
}

// 로컬스토리지에 저장한 데이터 삭제 후 로그인페이지로 이동
export function clearAuth() {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
    window.location.href = ROUTES.LOGIN;
}