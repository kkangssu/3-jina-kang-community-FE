import { signup } from '../../utils/api.js';
import { ROUTES } from '../../utils/routes.js';

document.addEventListener('DOMContentLoaded', function() {
    M.updateTextFields();

    const signupForm = document.getElementById('signup-form');
    signupForm.addEventListener('submit', handleSignup);
});

async function handleSignup(e) {
    e.preventDefault();

    // 입력값 받아오기
    const profileImageId = 1;
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const nickname = document.getElementById('nickname').value.trim();

    // 입력값 검증
    if(!profileImageId) {
        M.toast({ html: '프로필 사진을 업로드해주세요.' });
        return;
    }

    if(!email) {
        M.toast({ html: '이메일을 입력해주세요.' });
        return;
    }

    if(!isValidEmail(email)) {
        M.toast({ html: '올바른 이메일을 입력해주세요.' });
        return;
    }
    
    if(!password) {
        M.toast({ html: '비밀번호를 입력해주세요.' });
        return;
    }

    if(!nickname) {
        M.toast({ html: '닉네임을 입력해주세요.' });
        return;
    }
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = '회원가입 중...';

    // API 호출
    try {
        const data = await signup(email, password, nickname, profileImageId);

        // 로그인 페이지로 이동
        setTimeout(() => {
            window.location.replace(ROUTES.LOGIN);
        }, 500);
    } catch (error) {
        console.error('회원가입 에러: ',error);

        M.toast({ html: '회원가입 실패: ' + error.message });

        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}