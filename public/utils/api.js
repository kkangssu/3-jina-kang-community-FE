import { API_URL } from './config.js';

// 공통 API - 인증 필요
async function fetchGetAPI(url, options = {}) {
    const accessToken = localStorage.getItem('accessToken');

    if(!accessToken) {
        throw new Error('로그인 후 이용해주세요');
    }

    const response = await fetch(url, {
        method: 'GET',
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
}

// auth API
export async function login(email, password) {
    try {
        const response = await fetch( `${API_URL}/auth`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ email, password }),
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
        console.error('로그인 에러: ',error);
        throw error;
    }
}

// post API
// 게시글 목록 조회
export async function getPostList(cursor = null) {
    try {
        let url = `${API_URL}/posts`;
        if(cursor != null) {
            url += `?cursor=${cursor}`;
        }

        return await fetchGetAPI(url);
    } catch (error) {
        console.error('게시글 목록 조회 에러: ',error);
        throw error;
    }
}

// 게시글 상세 조회
export async function getPostDetail(postId) {
    try {
        let url = `${API_URL}/posts/${postId}`;

        return await fetchGetAPI(url);
    } catch (error) {
        console.error('게시글 상세 조회 에러: ',error);
        throw error;
    }
}


// comment API
// 댓글 목록 조회
export async function getCommentList(postId, cursor = null) {
    try {
        let url = `${API_URL}/comments/${postId}`;
        
        if(cursor != null) {
            url += `?cursor=${cursor}`;
        }

        return await fetchGetAPI(url);
    } catch (error) {
        console.error('댓글 목록 조회 에러: ',error);
        throw error;
    }
}

// 댓글 작성
export async function createComment(postId, content) {
    try {
        let url = `${API_URL}/comments/${postId}`;

        return await fetchPostAPI(url, {
            method: 'POST',
            body: JSON.stringify({ content }),
        });
    } catch (error) {
        console.error('댓글 작성 에러: ',error);
        throw error;
    }
}

// user API

// file API
