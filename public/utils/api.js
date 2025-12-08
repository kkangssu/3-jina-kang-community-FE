import { API_URL } from './config.js';

let BASE_URL = "";
async function loadConfig() {
    try {
        const response = await fetch('/config'); // server.js에 요청
        const config = await response.json();
        
        // 가져온 API Gateway 주소로 설정!
        // 예: https://...execute-api.../prod
        BASE_URL = config.apiGatewayUrl; 
        console.log("Config loaded:", BASE_URL);
    } catch (e) {
        console.error("설정 로드 실패:", e);
    }
}

loadConfig();

// 공통 API 요청 함수
// 인증 불필요
export async function request (endpoint, options = {}, errorContext) {
    if (!BASE_URL) await loadConfig();
    try {
        const response = await fetch( `${BASE_URL}/${API_URL}/${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
            },
            ...options,
        });

        const apiResponse = await response.json();

        if(!response.ok) {
            throw new Error(apiResponse.message);
        }

        if(!apiResponse.success) {
            throw new Error(apiResponse.message);
        }

        return apiResponse;
    } catch (error) {
        console.error(errorContext, error);
        throw error;
    }
}
// 인증 필요
export async function requestWithAuth (endpoint, options = {}, errorContext) {
    if (!BASE_URL) await loadConfig();
    try {
        const accessToken = localStorage.getItem('accessToken');

        if(!accessToken) {
            throw new Error('UNAUTHORIZED');
        }

        const response = await fetch( `${BASE_URL}/${API_URL}/${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
            },
            credentials: 'include',
            ...options,
        });

        const apiResponse = await response.json();

        if(!response.ok) {
            throw new Error(apiResponse.message);
        }

        if(!apiResponse.success) {
            throw new Error(apiResponse.message);
        }

        return apiResponse;
    } catch (error) {
        console.error(errorContext, error);
        throw error;
    }
}

// method별 공통 API 요청 함수
export const http = {
    // 인증 불필요
    get: (endpoint, errorContext) => 
        request(endpoint, { method: 'GET' }, errorContext),
    post: (endpoint, body, errorContext) => 
        request(endpoint, { method: 'POST', body: JSON.stringify(body)}, errorContext),
    put: (endpoint, body, errorContext) => 
        request(endpoint, { method: 'PUT', body: JSON.stringify(body) }, errorContext),
    patch: (endpoint, body, errorContext) => 
        request(endpoint, { method: 'PATCH', body: JSON.stringify(body) }, errorContext),
    delete: (endpoint, errorContext) => 
        request(endpoint, { method: 'DELETE' }, errorContext),

    // 인증 필요
    getWithAuth: (endpoint, errorContext) => 
        requestWithAuth(endpoint, { method: 'GET' }, errorContext),
    postWithAuth: (endpoint, body, errorContext) => 
        requestWithAuth(endpoint, { method: 'POST', body: JSON.stringify(body) }, errorContext),
    putWithAuth: (endpoint, body, errorContext) => 
        requestWithAuth(endpoint, { method: 'PUT', body: JSON.stringify(body) }, errorContext),
    patchWithAuth: (endpoint, body, errorContext) => 
        requestWithAuth(endpoint, { method: 'PATCH', body: JSON.stringify(body) }, errorContext),
    deleteWithAuth: (endpoint, errorContext) => 
        requestWithAuth(endpoint, { method: 'DELETE' }, errorContext),
}

// auth API
// 로그인
export async function login(email, password) {
    return http.post('auth/login', { email, password }, '로그인 에러');
}

// 로그아웃
export async function logout() {
    try {
        await http.postWithAuth('auth/logout', {}, '로그아웃 에러');
    } catch (error) {
        console.error('로그아웃 에러:', error);
        throw error;
    } finally {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        window.location.href = '/pages/login/login.html';
    }
}

// access token 재발급
export async function refreshAccessToken() {
    return http.postWithAuth('auth/reissue/access', {}, 'access token 재발급 에러');
}

// post API
// 게시글 목록 조회
export async function getPostList(cursor = null) {
    const endpoint = cursor != null ? `posts?cursor=${cursor}` : 'posts';
    return http.getWithAuth(endpoint, '게시글 목록 조회 에러');
}

// 게시글 상세 조회
export async function getPostDetail(postId) {
    const url = `posts/${postId}`;
    return http.getWithAuth(url, '게시글 상세 조회 에러');
}

// 게시글 작성
export async function createPost(postData) {
    const endpoint = `posts`;
    return http.postWithAuth(endpoint, postData, '게시글 작성 에러');
}

// 게시글 수정
export async function updatePost(postId, postData) {
    const endpoint = `posts/${postId}`;
    return http.patchWithAuth(endpoint, postData, '게시글 수정 에러');
}

// 게시글 삭제
export async function deletePost(postId) {
    const endpoint = `posts/${postId}`
    return http.deleteWithAuth(endpoint, '게시글 삭제 에러');
}

// postLike API
// 좋아요
export async function postLike(postId) {
    const endpoint = `postLike/${postId}`;
    return http.postWithAuth(endpoint, {}, '좋아요 에러');
}

// 좋아요 취소
export async function deletePostLike(postId) {
    const endpoint = `postLike/${postId}`;
    return http.deleteWithAuth(endpoint, '좋아요 취소 에러');
}

// comment API
// 댓글 목록 조회
export async function getCommentList(postId, cursor = null) {
    const endpoint = cursor != null ? `${postId}/comments?cursor=${cursor}` : `${postId}/comments`;
    return http.getWithAuth(endpoint, '댓글 목록 조회 에러');
}

// 댓글 작성
export async function createComment(postId, content) {
    const endpoint = `${postId}/comments`;
    return http.postWithAuth(endpoint, { content }, '댓글 작성 에러');
}

// 댓글 수정
export async function updateComment(postId, commentId, content) {
    const endpoint = `${postId}/comments/${commentId}`;
    return http.patchWithAuth(endpoint, { content }, '댓글 수정 에러');
}

// 댓글 삭제
export async function deleteComment(postId, commentId) {
    const endpoint = `${postId}/comments/${commentId}`;
    return http.deleteWithAuth(endpoint, '댓글 삭제 에러');
}

// user API
// 회원가입
export async function signup (signupData) {
    const endpoint = `signup`;
    return http.post(endpoint, signupData, '회원가입 에러');
}

// 닉네임 중복확인 - 회원가입
export async function checkNicknameBeforeSignup(nickname) {
    const endpoint = `signup/check-nickname?nickname=${nickname}`;
    return http.get(endpoint, '닉네임 중복확인 에러');
}

// 이메일 중복확인 - 회원가입
export async function checkEmailBeforeSignup(email) {
    const endpoint = `signup/check-email?email=${email}`;
    return http.get(endpoint, '이메일 중복확인 에러');
}

// 회원 정보 조회
export async function getProfile() {
    const endpoint = `users/me`;
    return http.getWithAuth(endpoint, '회원 정보 조회 에러');
}

// 회원 정보 수정
export async function editProfile(userData) {
    const endpoint = `users/me`;
    return http.patchWithAuth(endpoint, userData, '회원 정보 수정 에러');
}

// 닉네임 중복확인 - 회원가입 후
export async function checkNickname(nickname) {
    const endpoint = `users/check-nickname?nickname=${nickname}`;
    return http.getWithAuth(endpoint, '닉네임 중복확인 에러');
}

// 비밀번호 확인
export async function checkPassword(passwordData) {
    const endpoint = `users/me/password`;
    return http.postWithAuth(endpoint, passwordData, '비밀번호 확인 에러');
}

// 비밀번호 변경
export async function editPassword(passwordData) {
    const endpoint = `users/me/password`;
    return http.patchWithAuth(endpoint, passwordData, '비밀번호 변경 에러');
}

// file API
// Presigned URL 받기
export async function getPresignedUrl(fileName, type) {
    if (!BASE_URL) await loadConfig();

    try {
        const response = await fetch(`${BASE_URL}/upload`, { 
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify({ 
                fileName: fileName, 
                type: type
            })
        });

        const apiResponse = await response.json();

        if (!response.ok) {
            throw new Error(apiResponse.message || 'Presigned URL 발급 실패');
        }

        return apiResponse;
    } catch (error) {
        console.error('Presigned URL 요청 에러:', error);
        throw error;
    }
}

// S3에 파일 업로드
export async function uploadFileToS3(presignedUrl, file) {
    try {
        const response = await fetch(presignedUrl, {
            method: 'PUT',
            headers: {
                'Content-Type': file.type,
            },
            body: file
        });

        if (!response.ok) {
            throw new Error('S3 업로드 실패');
        }

        return response;
    } catch (error) {
        console.error('S3 업로드 에러:', error);
        throw error;
    }
}

// 파일 업로드 (Presigned URL 방식)
export async function uploadFile(file, type) {
    try {
        // 1. Lambda에서 Presigned URL 받기
        const presignedResponse = await getPresignedUrl(file.name, type);
        const { presignedUrl, fileKey, s3Url } = presignedResponse.data;

        // 2. S3에 파일 직접 업로드
        await uploadFileToS3(presignedUrl, file);

        // 3. 업로드된 파일 정보 반환 (백엔드 요구 형식)
        return {
            fileName: file.name,
            fileKey: fileKey,
            s3Url: s3Url,
            contentType: file.type
        };
    } catch (error) {
        console.error('파일 업로드 에러:', error);
        throw error;
    }
}