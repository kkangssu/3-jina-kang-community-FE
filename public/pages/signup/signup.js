import { signup, checkEmailBeforeSignup, checkNicknameBeforeSignup, uploadFile } from '../../utils/api.js';
import { ROUTES } from '../../utils/routes.js';
import { DEFAULT_PROFILE_IMAGE } from '../../utils/config.js';

let emailVerified = false;
let nicknameVerified = false;
let selectedImage = null;

// DOM 요소
const profileImagePreview = document.getElementById('profile-image-preview');
const profileImageUpload = document.getElementById('profile-image-upload');
const emailInput = document.getElementById('email');
const nicknameInput = document.getElementById('nickname');
const passwordInput = document.getElementById('password');
const checkEmailBtn = document.getElementById('check-email-btn');
const checkNicknameBtn = document.getElementById('check-nickname-btn');
const signupForm = document.getElementById('signup-form');
const signupBtn = document.getElementById('signup-btn');

// 프로필 이미지 업로드
async function handleImageUpload(e) {
    const file = e.target.files[0];
    if(!file) return;

    if(!file.type.startsWith('image/')) {
        M.toast({ html: '이미지 파일만 선택할 수 있습니다.' });
        return;
    }

    selectedImage = file;

    const reader = new FileReader();
    reader.onload = (event) => {
        profileImagePreview.src = event.target.result;
    };
    reader.readAsDataURL(file);
}

// 이메일 중복확인
async function handleCheckEmail() {
    const email = emailInput.value.trim();

    if(!email) {
        M.toast({ html: '이메일을 입력해주세요.' });
        return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if(!emailRegex.test(email)) {
        M.toast({ html: '올바른 이메일을 입력해주세요.' });
        return;
    }

    checkEmailBtn.disabled = true;
    const originalText = checkEmailBtn.textContent;
    checkEmailBtn.textContent = '확인 중...';

    try {
        const response = await checkEmailBeforeSignup(email);

        if(!response.data) {
            M.toast({ html: '사용 가능한 이메일입니다.' });
            emailVerified = true;
            updateSignupButtonState();
        }
        else {
            M.toast({ html: '이미 사용 중인 이메일입니다.' });
            emailVerified = false;
            updateSignupButtonState();
        }
    } catch (error) {
        console.error('이메일 중복확인 실패:', error);
        M.toast({ html: '이메일 확인 중 오류가 발생했습니다.' });
        emailVerified = false;
        updateSignupButtonState();
    } finally {
        checkEmailBtn.disabled = false;
        checkEmailBtn.textContent = originalText;
    }
}

// 닉네임 중복확인
async function handleCheckNickname() {
    const nickname = nicknameInput.value.trim();

    if (!nickname) {
        M.toast({ html: '닉네임을 입력해주세요.' });
        return;
    }

    checkNicknameBtn.disabled = true;
    const originalText = checkNicknameBtn.textContent;
    checkNicknameBtn.textContent = '확인 중...';

    try {
        const response = await checkNicknameBeforeSignup(nickname);

        if (!response.data) {
            M.toast({ html: '사용 가능한 닉네임입니다.' });
            nicknameVerified = true;
            updateSignupButtonState();
        } else {
            M.toast({ html: '이미 사용 중인 닉네임입니다.' });
            nicknameVerified = false;
            updateSignupButtonState();
        }
    } catch (error) {
        console.error('닉네임 중복확인 실패:', error);
        M.toast({ html: '닉네임 확인 중 오류가 발생했습니다.' });
        nicknameVerified = false;
        updateSignupButtonState();
    } finally {
        checkNicknameBtn.disabled = false;
        checkNicknameBtn.textContent = originalText;
    }
}

// 이메일 입력 시 검증 상태 초기화
function handleEmailInput() {
    emailVerified = false;
    updateSignupButtonState();
}

// 닉네임 입력 시 검증 상태 초기화
function handleNicknameInput() {
    nicknameVerified = false;
    updateSignupButtonState();
}

// 회원가입 버튼 상태 업데이트
function updateSignupButtonState() {
    const email = emailInput.value.trim();
    const nickname = nicknameInput.value.trim();
    const password = passwordInput.value.trim();

    const allFieldsFilled = email && nickname && password;
    const allVerified = emailVerified && nicknameVerified;

    signupBtn.disabled = !allFieldsFilled || !allVerified;
}

// 회원가입 처리
async function handleSignup(e) {
    e.preventDefault();

    if(!emailVerified) {
        M.toast({ html: '이메일 중복확인을 해주세요.' });
        return;
    }
    if(!nicknameVerified) {
        M.toast({ html: '닉네임 중복확인을 해주세요.' });
        return;
    }

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    const nickname = nicknameInput.value.trim();
    
    signupBtn.disabled = true;
    const originalText = signupBtn.textContent;
    signupBtn.textContent = '회원가입 중...';

    try {
        let profileImageData = null;

        // 이미지가 선택된 경우 업로드, 아니면 기본 이미지 정보 사용
        if (selectedImage) {
            profileImageData = await uploadFile(selectedImage, 'profiles');
        } else {
            // 기본 이미지 정보를 ProfileImageRequest 형식으로 설정
            profileImageData = {
                fileName: DEFAULT_PROFILE_IMAGE.fileName,
                fileKey: DEFAULT_PROFILE_IMAGE.fileKey,
                s3Url: DEFAULT_PROFILE_IMAGE.s3Url,
                contentType: DEFAULT_PROFILE_IMAGE.contentType
            };
        }

        const signupData = {
            email: email,
            password: password,
            nickname: nickname,
            profileImage: profileImageData
        };

        await signup(signupData);
        M.toast({ html: '회원가입이 성공적으로 완료되었습니다.' });

        setTimeout(() => {
            window.location.href = ROUTES.LOGIN;
        }, 500);
    } catch (error) {
        console.error('회원가입 실패:', error);
        M.toast({ html: '회원가입 실패: ' + error.message });
        signupBtn.disabled = false;
        signupBtn.textContent = originalText;
    }
}

// 이벤트 리스너
function setupEventListeners() {
    profileImageUpload.addEventListener('change', handleImageUpload);
    emailInput.addEventListener('input', handleEmailInput);
    nicknameInput.addEventListener('input', handleNicknameInput);
    checkEmailBtn.addEventListener('click', handleCheckEmail);
    checkNicknameBtn.addEventListener('click', handleCheckNickname);
    signupForm.addEventListener('submit', handleSignup);
}

// 초기화
async function init() {
    // 기본 프로필 이미지 설정
    profileImagePreview.src = DEFAULT_PROFILE_IMAGE.url;

    setupEventListeners();
    updateSignupButtonState();
}

document.addEventListener('DOMContentLoaded', init);