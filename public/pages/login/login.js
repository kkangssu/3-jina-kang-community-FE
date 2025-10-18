import { login } from '../../utils/api.js';

document.addEventListener('DOMContentLoaded', function() {
    M.updateTextFields();

    const loginForm = document.getElementById('login-form');
   
    loginForm.addEventListener('submit', handleLogin);
});

async function handleLogin(e) {
    e.preventDefault();

    // 입렵값 받아오기
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    // 입력값 검증
    if (!email ) {
        M.toast({ html: '이메일을 입력해주세요.' });
        return;
    }
    if(!isValidEmail(email)) {
        M.toast({ html: '올바른 이메일을 입력해주세요.' });
        return;
    }
    if( !password ) {
        M.toast({ html: '비밀번호를 입력해주세요.' });
        return;
    }

    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = '로그인 중...';

    // API 호출
    try {
        const data = await login(email, password);
        // accessToken 저장
        localStorage.setItem('accessToken', data.accessToken);
        // 회원 정보 저장
        localStorage.setItem('user', JSON.stringify(data.userInfo));
        // 게시글 목록으로 이동
        setTimeout(() => {
            window.location.href = '../post-list/post-list.html';
        }, 500);
    } catch (error) {
        console.error('로그인 에러: ',error);

        M.toast({ html: '로그인 실패: ' + error.message });

        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    } 
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}
