// layout.js
import { logout } from './api.js';

// 공통 레이아웃 삽입
async function loadLayout() {
    try {
        await loadHeader();
        initHeaderEvents();
    } catch (error) {
        console.error('레이아웃 로드 실패:', error);
    }
}

// 헤더 로드
async function loadHeader() {
    const headerResponse = await fetch('/components/header.html');
    const headerHTML = await headerResponse.text();
    
    const headerElement = document.querySelector('header');
    if (headerElement) {
        headerElement.innerHTML = headerHTML;
        headerElement.classList.add('loaded');
    }
    
    // Materialize Dropdown 초기화
    const dropdownElements = document.querySelectorAll('.dropdown-trigger');
    M.Dropdown.init(dropdownElements, {
        coverTrigger: false,
        constrainWidth: false
    });
    
    // 프로필 이미지 설정
    loadProfileImage();
}

// 프로필 이미지 로드
function loadProfileImage() {
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    const profileImage = document.getElementById('profile-image');
    
    if (profileImage) {
        profileImage.src = userInfo.profileImage || '/assets/images/default-profile.png';
    }
}

// 헤더 이벤트 초기화
function initHeaderEvents() {
    // 로그아웃 버튼
    const logoutLink = document.querySelector('#dropdown a[href="#!"]');
    if (logoutLink) {
        logoutLink.addEventListener('click', handleLogoutClick);
    }
}

// 로그아웃 클릭 핸들러
function handleLogoutClick(e) {
    e.preventDefault();
    
    if (confirm('로그아웃하시겠습니까?')) {
        logout(); // auth.js에서 import한 함수
    }
}

// DOM 로드 완료 후 레이아웃 로드
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadLayout);
} else {
    loadLayout();
}

export { loadLayout };