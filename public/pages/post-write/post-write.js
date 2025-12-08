import { createPost, uploadFile } from '../../utils/api.js';
import { ROUTES } from '../../utils/routes.js';
import { isAuthenticated } from '../../utils/auth.js';

if (!isAuthenticated()) {
    window.location.href = '/pages/login/login.html';
}

let selectedImages = [];

// DOM 요소
const backBtn = document.getElementById('back-btn');
const postForm = document.getElementById('post-form');
const postTitle = document.getElementById('post-title');
const postContent = document.getElementById('post-content');
const fileInput = document.getElementById('file-input');
const btnFile = document.querySelector('.btn-file');
const filePreviewList = document.getElementById('file-preview-list');
const postSaveBtn = document.getElementById('post-save-btn');

// 초기화
function init() {
    // 이벤트리스너 등록
    backBtn.addEventListener('click', handleBackClick);
    postSaveBtn.addEventListener('click', handleSubmit);
    btnFile.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', handleFileSelect);
}

// 파일 선택 처리
const MAX_FILE_COUNT = 5;
async function handleFileSelect(e) {
    const files = Array.from(e.target.files);

    if (!files || files.length === 0) {
        return;
    }

    const currentFileCount = selectedImages.length;
    const newFileCount = files.length;
    const totalFileCount = currentFileCount + newFileCount;

    // 첨부할 파일 개수를 초과한 경우
    if (totalFileCount > MAX_FILE_COUNT) {
        M.toast({ html: `최대 ${MAX_FILE_COUNT}개까지 첨부할 수 있습니다.` });
        e.target.value = '';
        return;
    }

    // 선택된 파일 순회하며 업로드
    for (const file of files) {
        // 파일 타입 검사
        if (!file.type.startsWith('image/')) {
            M.toast({ html: `${file.name}은(는) 이미지 파일이 아닙니다.` });
            continue;
        }

        // 파일 크기 검사 (5MB)
        const MAX_FILE_SIZE = 5 * 1024 * 1024;
        if (file.size > MAX_FILE_SIZE) {
            M.toast({ html: `${file.name}의 크기가 5MB를 초과합니다.` });
            continue;
        }

        // 파일 업로드
        await uploadSingleFile(file);
    }

    e.target.value = '';
}

// 단일 파일 S3 업로드
async function uploadSingleFile(file) {
    try {
        // 업로드 중 표시
        M.toast({ html: `${file.name} 업로드 중...`, classes: 'blue darken-1' });

        // S3 업로드 (presigned URL 방식)
        const imageData = await uploadFile(file, 'posts');

        // fileOrder 추가
        const imageWithOrder = {
            fileName: imageData.fileName,
            fileOrder: selectedImages.length,
            fileKey: imageData.fileKey,
            s3Url: imageData.s3Url,
            contentType: imageData.contentType
        };

        selectedImages.push(imageWithOrder);

        // 미리보기 표시
        displayImagePreview(file, imageWithOrder);

        M.toast({ html: `${file.name} 업로드 완료` });
    } catch (error) {
        console.error('이미지 업로드 에러:', error);
        M.toast({ html: `${file.name} 업로드 실패: ${error.message}` });
    }
}

// 이미지 미리보기 표시
function displayImagePreview(file, imageData) {
    const reader = new FileReader();
    reader.onload = (e) => {
        const previewItem = document.createElement('div');
        previewItem.className = 'image-preview-item';
        previewItem.dataset.index = imageData.fileOrder;

        previewItem.innerHTML = `
            <img src="${e.target.result}" alt="${file.name}">
            <span class="file-name">${file.name}</span>
            <button type="button" class="btn-remove-image">
                <i class="material-icons">close</i>
            </button>
        `;

        // 삭제 버튼 이벤트
        const removeBtn = previewItem.querySelector('.btn-remove-image');
        removeBtn.addEventListener('click', () => removeImage(imageData.fileOrder));

        filePreviewList.appendChild(previewItem);
    };
    reader.readAsDataURL(file);
}

// 이미지 삭제
function removeImage(index) {
    // 배열에서 삭제
    selectedImages = selectedImages.filter(img => img.fileOrder !== index);

    // fileOrder 재정렬
    selectedImages.forEach((img, idx) => {
        img.fileOrder = idx;
    });

    // 미리보기 다시 렌더링
    renderImagePreviews();

    M.toast({ html: '이미지가 삭제되었습니다.' });
}

// 이미지 미리보기 전체 다시 렌더링
function renderImagePreviews() {
    filePreviewList.innerHTML = '';

    selectedImages.forEach((imageData) => {
        // 미리보기를 다시 만들기 위해 fetch로 이미지 가져오기
        fetch(imageData.s3Url)
            .then(res => res.blob())
            .then(blob => {
                const file = new File([blob], imageData.fileName, { type: imageData.contentType });
                displayImagePreview(file, imageData);
            })
            .catch(err => {
                console.error('이미지 미리보기 렌더링 실패:', err);
            });
    });
}

// 입력 유효성 검사
function validateForm() {
    const title = postTitle.value.trim();
    const content = postContent.value.trim();

    if (!title) {
        return { valid: false, message: '제목을 입력해주세요.' };
    }

    if (title.length > 255) {
        return { valid: false, message: `제목은 최대 255자까지 입력 가능합니다. (현재 ${title.length}자)` };
    }

    if (!content) {
        return { valid: false, message: '본문을 입력해주세요.' };
    }

    return { valid: true, message: '' };
}

// 게시글 저장
async function handleSubmit(event) {
    event.preventDefault();

    // 폼 유효성 검사
    const validation = validateForm();
    if (!validation.valid) {
        M.toast({ html: validation.message });
        return;
    }

    try {
        // 제출 버튼 비활성화
        postSaveBtn.disabled = true;
        const originalText = postSaveBtn.textContent;
        postSaveBtn.textContent = '저장 중...';

        const title = postTitle.value.trim();
        const content = postContent.value.trim();

        // 요청 데이터 구성
        const postData = {
            title: title,
            content: content,
            postImages: selectedImages
        };

        // 서버에 게시글 생성 요청
        const response = await createPost(postData);

        if (response.success && response.data) {
            M.toast({ html: '게시글이 작성되었습니다.' });

            // 작성된 게시글 상세 페이지로 이동
            const postId = response.data.postId;
            window.location.href = `${ROUTES.POST_DETAIL}?postId=${postId}`;
        } else {
            throw new Error('게시글 작성 응답이 올바르지 않습니다.');
        }
    } catch (error) {
        console.error('게시글 작성 실패:', error);
        M.toast({ html: '게시글 저장 실패: ' + error.message });
        postSaveBtn.disabled = false;
        postSaveBtn.textContent = '저장';
    }
}

// 뒤로가기 버튼
function handleBackClick() {
    const title = postTitle.value.trim();
    const content = postContent.value.trim();
    const hasFiles = selectedImages.length > 0;

    const hasContent = title || content || hasFiles;

    if (hasContent) {
        const confirmed = confirm('작성 중인 내용이 있습니다. 저장하지 않고 나가시겠습니까?');
        if (!confirmed) {
            return;
        }
    }

    window.location.href = ROUTES.POSTS;
}

document.addEventListener('DOMContentLoaded', init);
