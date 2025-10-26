import { getProfile, editProfile, uploadFile, checkNickname } from '../../utils/api.js';
import { ROUTES } from '../../utils/routes.js';

// 상태 관리
let currentNickname = '';
let currentProfileImageUrl = '';
let nicknameVerified = false;
let selectedImage = null;

// DOM 요소
const profileImagePreview = document.getElementById('profile-image-preview');
const profileImageUpload = document.getElementById('profile-image-upload');
const emailInput = document.getElementById('email');
const nicknameInput = document.getElementById('nickname');
const checkNicknameBtn = document.getElementById('check-nickname-btn');
const profileEditForm = document.getElementById('profile-edit-form');
const saveBtn = document.getElementById('save-btn');
const passwordChangeBtn = document.getElementById('password-change-btn');

// 프로필 조회
async function fetchProfile() {
    try {
        const response = await getProfile();
        const profile = response.data;
        currentNickname = profile.nickname;
        currentProfileImageUrl = profile.profileImageUrl;

        emailInput.value = profile.email;
        nicknameInput.value = profile.nickname;

        if (profile.profileImageUrl) {
            profileImagePreview.src = profile.profileImageUrl;
        }
    } catch (error) {
        console.error('프로필 로드 실패:', error);
        M.toast({ html: '프로필을 불러올 수 없습니다.' });
    }
}

// 프로필 이미지 업로드
function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
        M.toast({ html: '이미지 파일만 선택할 수 있습니다.' });
        return;
    }

    selectedImage = file;

    const reader = new FileReader();
    reader.onload = (event) => {
        profileImagePreview.src = event.target.result;
    };
    reader.readAsDataURL(file);

    updateSaveButtonState();
}

// 닉네임 중복확인
async function handleCheckNickname() {
    const nickname = nicknameInput.value.trim();

    if (!nickname) {
        M.toast({ html: '닉네임을 입력해주세요.' });
        return;
    }

    if (nickname === currentNickname) {
        M.toast({ html: '현재 닉네임과 동일합니다.' });
        nicknameVerified = true;
        updateSaveButtonState();
        return;
    }

    checkNicknameBtn.disabled = true;
    const originalText = checkNicknameBtn.textContent;
    checkNicknameBtn.textContent = '확인 중...';

    try {
        const response = await checkNickname(nickname);

        if (response.available) {
            M.toast({ html: '사용 가능한 닉네임입니다.' });
            nicknameVerified = true;
            updateSaveButtonState();
        } else {
            M.toast({ html: '이미 사용 중인 닉네임입니다.' });
            nicknameVerified = false;
            saveBtn.disabled = true;
        }
    } catch (error) {
        console.error('닉네임 중복확인 실패:', error);
        M.toast({ html: '닉네임 확인 중 오류가 발생했습니다.' });
    } finally {
        checkNicknameBtn.disabled = false;
        checkNicknameBtn.textContent = originalText;
    }
}

// 닉네임 입력 시 검증 상태 초기화
function handleNicknameInput() {
    nicknameVerified = false;
    updateSaveButtonState();
}

// 저장 버튼 상태 업데이트
function updateSaveButtonState() {
    // 닉네임이 변경되었고 검증된 경우 또는 이미지가 선택된 경우 활성화
    const nicknameChanged = nicknameInput.value.trim() !== currentNickname;
    const hasChanges = (nicknameChanged && nicknameVerified) || selectedImage;
    
    saveBtn.disabled = !hasChanges;
}

// 프로필 저장
async function handleSaveProfile(e) {
    e.preventDefault();

    if (!nicknameVerified) {
        M.toast({ html: '닉네임 중복확인을 해주세요.' });
        return;
    }

    const nickname = nicknameInput.value.trim();
    let profileImageUrl = currentProfileImageUrl;

    saveBtn.disabled = true;
    const originalText = saveBtn.textContent;
    saveBtn.textContent = '저장 중...';

    try {
        // 이미지가 새로 선택된 경우에만 업로드
        if (selectedImage) {
            const formData = new FormData();
            formData.append('file', selectedImage);
            const uploadResponse = await uploadFile(formData);
            profileImageUrl = uploadResponse.data.fileUrl;
        }

        // 항상 profileImageUrl 포함해서 전송
        const updateData = {
            nickname: nickname,
            profileImageUrl: profileImageUrl
        };

        await editProfile(updateData);
        M.toast({ html: '프로필이 성공적으로 수정되었습니다.' });

        currentNickname = nickname;
        currentProfileImageUrl = profileImageUrl;
        selectedImage = null;
        nicknameVerified = false;
        profileImageUpload.value = '';

    } catch (error) {
        console.error('프로필 수정 실패:', error);
        M.toast({ html: '프로필 수정 중 오류가 발생했습니다.' });
    } finally {
        saveBtn.disabled = true;
        saveBtn.textContent = originalText;
    }
}


// 비밀번호 변경
function handlePasswordChange() {
    window.location.href = ROUTES.PASSWORD_CHANGE;
}

// 이벤트 리스너 설정
function setupEventListeners() {
    profileImageUpload.addEventListener('change', handleImageUpload);
    checkNicknameBtn.addEventListener('click', handleCheckNickname);
    nicknameInput.addEventListener('input', handleNicknameInput);
    profileEditForm.addEventListener('submit', handleSaveProfile);
    passwordChangeBtn.addEventListener('click', handlePasswordChange);
}

// 초기화
async function init() {
    try {
        await fetchProfile();
        setupEventListeners();
    } catch (error) {
        console.error('초기화 에러:', error);
        M.toast({ html: '페이지를 불러올 수 없습니다.' });
    }
}

document.addEventListener('DOMContentLoaded', init);