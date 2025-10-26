import { createPost, uploadFile } from '../../utils/api.js';
import { ROUTES } from '../../utils/routes.js';

let uploadedFiles = [];

// DOM 요소
// 뒤로가기 버튼
const backBtn = document.getElementById('back-btn');
// 게시물
const postForm = document.getElementById('post-form');
const postTitle = document.getElementById('post-title');
const postContent = document.getElementById('post-content');
const fileInput = document.getElementById('file-input');
const fileList = document.getElementById('file-list');
const postSaveBtn = document.getElementById('post-save-btn');

// 초기화
function init() {
    // Materialize textarea 자동 높이 조절 초기화
    M.textareaAutoResize(postContent);

    // 이벤트리스너 등록
    backBtn.addEventListener('click', handleBackClick);
    postForm.addEventListener('submit', handleSubmit);
    fileInput.addEventListener('change', handleFileSelect);
}

// 파일 첨부
const MAX_FILE_COUNT = 5;
function handleFileSelect(e) {
    const files = e.target.files;

    // 파일이 선택되지 않은 경우
    if(!files || files.length === 0) {
        return;
    }

    const currentFileCount = uploadedFiles.length;
    const newFileCount = files.length;
    const totalFileCount = currentFileCount + newFileCount;

    // 첨부할 파일 개수를 초과한 경우
    if(totalFileCount > MAX_FILE_COUNT) {
        M.toast({ html: `최대 ${MAX_FILE_COUNT}개까지 첨부할 수 있습니다.` });
        e.target.value = '';
        return;
    }

    // 선택된 파일 순회하며 업로드
    Array.from(files).forEach(async (file) => {
        // 파일 타입 검사
        const validation = validateFile(file);

        if(!validation.valid) {
            M.toast({ html: validation.message });
            return;
        }

        // 파일 업로드
        uploadSingleFile(file);
    });
    e.target.value = '';
}

// 파일 업로드
async function uploadSingleFile(file) {
    try {
        // 로딩 표시 (파일명과 함께)
        showFileUploadLoading(file.name);
        // FormData 생성
        const formData = new FormData();
        formData.append('file', file);
        // 파일 업로드
        const response = await uploadFile(formData);
        // 성공
        if(response.success || response.data) {
            uploadedFiles.push({
                fileName: response.data.fileName,
                fileUrl: response.data.fileUrl,
                contentType: response.data.contentType,
                fileOrder: null
            })

            updateFileList();

            M.toast({ html: `${file.name} 업로드 완료` });
        } else if(!response.success && response.error) {
            M.toast({ html: `${file.name} 업로드 실패: ${response.message}` });
        } else {
            throw new Error('파일 업로드 응답이 올바르지 않습니다.');
        }
    } catch (error) {
        console.error('파일 업로드 에러: ', error);
        M.toast({ html: `${file.name} 업로드 실패: ${error.message}` });
    } finally {
        hideFileUploadLoading();
    }
}

// 입력 유효성 검사
function validateForm() {
    const title = postTitle.value.trim();
    const content = postContent.value.trim();
    
    // 제목 필수 입력 검사
    if (!title) {
        return {
            valid: false,
            message: '제목을 입력해주세요.'
        };
    }
    
    // 제목 최대 길이 검사 (255자)
    if (title.length > 255) {
        return {
            valid: false,
            message: `제목은 최대 255자까지 입력 가능합니다. (현재 ${title.length}자)`
        };
    }

    if(!content) {
        return {
            valid: false,
            message: '본문을 입력해주세요.'
        };
    }
    
    // 모든 검증 통과
    return {
        valid: true,
        message: ''
    };
}

// 저장 버튼 이벤트 핸들러
async function handleSubmit(event) {
    // 기본 폼 제출 동작 방지
    event.preventDefault();
    
    // 폼 유효성 검사
    const validation = validateForm();
    if (!validation.valid) {
        M.toast({ html: validation.message });
        return;
    }
    
    try {
        // 제출 버튼 비활성화 - 중복 제출 방지
        toggleSubmitButton(true);
        
        // 제목, 본문 가져오기
        const pTitle = postTitle.value.trim();
        const pContent = postContent.value.trim();
        
        // fileOrder 부여
        const imageList = assignFileOrder();
        
        // 요청 데이터 구성
        const requestData = {
            title: pTitle,
            content: pContent,
            postImages: imageList
        };
        
        // 서버에 게시물 생성 요청
        const response = await createPost(requestData);
        
        // 성공 응답 처리
        if (response.success && response.data) {
            M.toast({ html: '게시물이 작성되었습니다.' });
            
            // 작성된 게시물 상세 페이지로 이동
            const postId = response.data.postId;
            console.log('이동할 URL:', `${ROUTES.POST_DETAIL}?id=${postId}`);
            window.location.href = `${ROUTES.POST_DETAIL}?postId=${postId}`;
        } else if (!response.success && response.error) {
            // 백엔드 에러 응답 처리
            M.toast({ html: '게시글 저장 실패: ' + response.error.message });
            toggleSubmitButton(false);
        } else {
            throw new Error('게시물 작성 응답이 올바르지 않습니다.');
        }
        
    } catch (error) {
        // 네트워크 에러 또는 기타 예외 처리
        console.error('게시물 작성 실패:', error);    
        M.toast({ html: '게시글 저장 실패: ' + error.message });
        toggleSubmitButton(false);
    }
}


// 뒤로가기 버튼
function handleBackClick() {
    console.log('뒤로가기 버튼 클릭됨');
    const title = postTitle.value.trim();
    const content = postContent.value.trim();
    const hasFiles = uploadedFiles.length > 0;
    
    // 작성 중인 내용이 있는지 확인
    const hasContent = title || content || hasFiles;
    
    if (hasContent) {
        // 작성 중인 내용이 있으면 확인 메시지 표시
        const confirmed = confirm('작성 중인 내용이 있습니다. 저장하지 않고 나가시겠습니까?');
        
        if (!confirmed) {
            // 취소하면 아무것도 하지 않음
            return;
        }
    }
    
    // 게시물 목록 페이지로 이동
    window.location.href = ROUTES.POSTS;
}

// 유틸리티 함수
// 파일 유효성 검증
function validateFile(file) {
    // 파일 크기 제한 (5MB)
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB를 바이트로 변환
    
    // 허용된 이미지 타입
    const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    
    // 파일 타입 검증
    if (!ALLOWED_TYPES.includes(file.type)) {
        return {
            valid: false,
            message: `${file.name}은(는) 지원하지 않는 파일 형식입니다. (JPG, PNG, WEBP만 가능)`
        };
    }
    
    // 파일 크기 검증
    if (file.size > MAX_FILE_SIZE) {
        const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
        return {
            valid: false,
            message: `${file.name}의 크기가 너무 큽니다. 최대 5MB까지 업로드 가능합니다.)`
        };
    }
    
    // 모든 검증 통과
    return {
        valid: true,
        message: ''
    };
}

// 파일 목록 업데이트
function updateFileList() {
    // 파일이 없으면 목록 숨김
    if (uploadedFiles.length === 0) {
        fileList.style.display = 'none';
        fileList.innerHTML = '';
        return;
    }
    
    // 파일 목록 표시
    fileList.style.display = 'block';
    
    // 파일 목록 HTML 생성
    fileList.innerHTML = uploadedFiles.map((file, index) => `
        <div class="collection-item">
            <div class="row valign-wrapper" style="margin-bottom: 0;">
                <div class="col s10">
                    <i class="material-icons tiny">image</i>
                    <span>${file.fileName}</span>
                </div>
                <div class="col s2 right-align">
                    <button type="button" class="btn-flat btn-small" onclick="removeFile(${index})" style="padding: 0;">
                        <i class="material-icons">close</i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// 파일 삭제
function removeFile(index) {
    // 배열에서 해당 인덱스 제거
    uploadedFiles.splice(index, 1);
    
    // UI 업데이트
    updateFileList();
    
    // 삭제 완료 메시지
    M.toast({ html: '파일이 삭제되었습니다.' });
}

// 저장 전 첨부 파일에 번호 부여
function assignFileOrder() {
    return uploadedFiles.map((file, index) => ({
        ...file,
        fileOrder: index + 1 // 1부터 시작
    }));
}

// 저장 버튼 활성/비활성 토글
function toggleSubmitButton(disabled) {
    postSaveBtn.disabled = disabled;
    
    if (disabled) {
        postSaveBtn.classList.add('disabled');
    } else {
        postSaveBtn.classList.remove('disabled');
    }
}

// 파일 업로드 로딩 표시
function showFileUploadLoading(fileName) {
    // 간단하게 버튼 비활성화 + 토스트로 업로드 중 표시
    fileInput.disabled = true;
    postSaveBtn.disabled = true;
    
    M.toast({
        html: `${fileName} 업로드 중...`,
        classes: 'blue darken-1',
        displayLength: 100000 // 업로드 완료될 때까지 유지
    });
}

// 파일 업로드 로딩 숨김
function hideFileUploadLoading() {
    // 버튼 재활성화
    fileInput.disabled = false;
    postSaveBtn.disabled = false;
    
    // 토스트 닫기
    M.Toast.dismissAll();
}

document.addEventListener('DOMContentLoaded', init);