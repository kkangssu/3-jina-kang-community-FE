// layout.js

// 공통 레이아웃 삽입
async function loadLayout() {
    try {
        // Header 로드
        const headerResponse = await fetch('/components/header.html');
        const headerHTML = await headerResponse.text();
        
        // Header 삽입
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
        
        // 프로필 이미지 설정 (localStorage에서 사용자 정보 가져오기)
        const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
        const profileImage = document.getElementById('profile-image');
        if (profileImage && userInfo.profileImage) {
            profileImage.src = userInfo.profileImage;
        } else if (profileImage) {
            // 기본 프로필 이미지
            profileImage.src = '/assets/images/default-profile.png';
        }
        
    } catch (error) {
        console.error('레이아웃 로드 실패:', error);
    }
}

// DOM 로드 완료 후 레이아웃 로드
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadLayout);
} else {
    loadLayout();
}

export { loadLayout };