import { API_URL } from './config.js';

// 공통 API 요청 함수
// 인증 불필요
export async function request (endpoint, options = {}, errorContext) {
    try {
        const response = await fetch( `${API_URL}/${endpoint}`, {
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

        return apiResponse.data;
    } catch (error) {
        console.error(errorContext, error);
        throw error;
    }
}
// 인증 필요
export async function requestWithAuth (endpoint, options = {}, errorContext) {
    try {
        const accessToken = localStorage.getItem('accessToken');

        if(!accessToken) {
            throw new Error('UNAUTHORIZED');
        }

        const response = await fetch( `${API_URL}/${endpoint}`, {
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

        return apiResponse.data;
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
    return http.postWithAuth('auth/logout', {}, '로그아웃 에러');
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
export async function createPost(title, content, postImageId) {
    const endpoint = `posts`;
    return http.postWithAuth(endpoint, { title, content, postImageId }, '게시글 작성 에러');
}

// 게시글 수정
export async function updatePost(postId, title, content, imageId) {
    const endpoint = `posts/${postId}`;
    return http.putWithAuth(endpoint, { title, content, postImageId }, '게시글 수정 에러');
}

// 게시글 삭제
export async function deletePost(postId) {
    const endpoint = `posts/${postId}`
    return http.deleteWithAuth(endpoint, '게시글 삭제 에러');
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
    return http.putWithAuth(endpoint, { content }, '댓글 수정 에러');
}

// 댓글 삭제
export async function deleteComment(postId, commentId) {
    const endpoint = `${postId}/comments/${commentId}`;
    return http.deleteWithAuth(endpoint, '댓글 삭제 에러');
}

// user API
// 회원가입
export async function signup (email, password, nickname, profileImageId) {
    const endpoint = `users`;
    return http.post(endpoint, { email, password, nickname, profileImageId }, '회원가입 에러');
}

// file API
