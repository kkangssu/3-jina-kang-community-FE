import { editPassword,  checkPassword } from '../../utils/api.js';
import { ROUTES } from '../../utils/routes.js';
import { isAuthenticated } from '../../auth.js';

if (!isAuthenticated()) {
    window.location.href = '/pages/login/login.html';
}

let oldPasswordVerified = false;

// DOM 요소
const oldPasswordInput = document.getElementById('old-password');
const checkOldPasswordBtn = document.getElementById('check-old-password-btn');
const newPasswordInput = document.getElementById('new-password');
const confirmPasswordInput = document.getElementById('confirm-password');
const changePasswordBtn = document.getElementById('change-password-btn');
const passwordChangeForm = document.getElementById('password-change-form');

// 기존 비밀번호 확인
async function handleCheckOldPassword() {
    const oldPassword = oldPasswordInput.value.trim();
    if(!oldPassword) {
        M.toast({ html: '기존 비밀번호를 입력해주세요.' });
        return;
    }

    checkOldPasswordBtn.disabled = true;
    const originalText = checkOldPasswordBtn.textContent;
    checkOldPasswordBtn.textContent = '확인 중...';

    try {
        const response = await checkPassword({ oldPassword: oldPassword });


        if(response.data) {
            M.toast({ html: '기존 비밀번호가 일치합니다.' });
            oldPasswordVerified = true;
            updateChangePasswordButtonState();
        } else {
            M.toast({ html: '기존 비밀번호가 일치하지 않습니다.' });
            oldPasswordVerified = false;
            changePasswordBtn.disabled = true;
        }
    } catch (error) {
        console.error('기존 비밀번호 확인 실패:', error);
        M.toast({ html: '기존 비밀번호 확인 중 오류가 발생했습니다.' });
    } finally {
        checkOldPasswordBtn.disabled = false;
        checkOldPasswordBtn.textContent = originalText;
    }
}

// 비밀번호 변경 버튼 업데이트
function updateChangePasswordButtonState() {
    const newPassword = newPasswordInput.value.trim();
    const confirmPassword = confirmPasswordInput.value.trim();
    
    const isValid = oldPasswordVerified &&
                    newPassword.length >= 8 &&
                    confirmPassword.length >= 8 &&
                    newPassword === confirmPassword;

    changePasswordBtn.disabled = !isValid;
}

// 비밀번호 변경
async function handleChangePassword(e) {
    e.preventDefault();

    const newPassword = newPasswordInput.value.trim();
    const confirmPassword = confirmPasswordInput.value.trim();

    if(!oldPasswordVerified) {
        M.toast({ html: '기존 비밀번호가 일치하지 않습니다.' });
        return;
    }
    if(newPassword !== confirmPassword) {
        M.toast({ html: '비밀번호가 일치하지 않습니다.' });
        return;
    }

    changePasswordBtn.disabled = true;
    const originalText = changePasswordBtn.textContent;
    changePasswordBtn.textContent = '변경 중...';

    try {
        const oldPassword = oldPasswordInput.value.trim();
        const passwordData = {
            oldPassword: oldPassword,
            newPassword: newPassword,
            confirmPassword: confirmPassword
        };
        await editPassword(passwordData);

        M.toast({ html: '비밀번호가 성공적으로 변경되었습니다.' });
        window.location.href = ROUTES.PROFILE_EDIT;
    } catch (error) {
        console.error('비밀번호 변경 실패:', error);
        M.toast({ html: '비밀번호 변경 중 오류가 발생했습니다.' });
    } finally {
        changePasswordBtn.disabled = false;
        changePasswordBtn.textContent = originalText;
    }
}

// 이벤트 리스너
function setupEventListeners() {
    checkOldPasswordBtn.addEventListener('click', handleCheckOldPassword);
    newPasswordInput.addEventListener('input', updateChangePasswordButtonState);
    confirmPasswordInput.addEventListener('input', updateChangePasswordButtonState);
    passwordChangeForm.addEventListener('submit', handleChangePassword);
}

// 초기화
async function init() {
    changePasswordBtn.disabled = true;
    setupEventListeners();
}

document.addEventListener('DOMContentLoaded', init);