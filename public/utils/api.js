import { API_URL } from './config.js';

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
        const accessToken = localStorage.getItem('accessToken');

        if(!accessToken) {
            throw new Error('로그인 후 이용해주세요');
        }

        let url = `${API_URL}/posts`;
        if(cursor != null) {
            url += `?cursor=${cursor}`;
        }

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
            },
            credentials: 'include',
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
        console.error('게시글 목록 조회 에러: ',error);
        throw error;
    }
}

// 게시글 상세 조회
export async function getPostDetail(postId) {
    try {
        const accessToken = localStorage.getItem('accessToken');

        if(!accessToken) {
            throw new Error('로그인 후 이용해주세요');
        }

        let url = `${API_URL}/posts/${postId}`;

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
            },
            credentials: 'include',
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
        console.error('게시글 상세 조회 에러: ',error);
        throw error;
    }
}

// 게시글 삭제
export async function deletePost(postId) {
    try {
        const accessToken = localStorage.getItem('accessToken');

        if(!accessToken) {
            throw new Error('로그인 후 이용해주세요');
        }

        const url = `${API_URL}/posts/${postId}`;

        const response = await fetch(url, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
            },
            credentials: 'include',
        });

        // 204 No Content - body 없음
        if(response.status === 204) {
            return { success: true };
        }

        const apiResponse = await response.json();

        if(!response.ok) {
            throw new Error(apiResponse.message);
        }

        if(!apiResponse.success) {
            throw new Error(apiResponse.message);
        }

        return apiResponse.data;
    } catch (error) {
        console.error('게시글 삭제 에러: ',error);
        throw error;
    }
}

// comment API
// 댓글 목록 조회
export async function getCommentList(postId, cursor = null) {
    try {
        const accessToken = localStorage.getItem('accessToken');

        if(!accessToken) {
            throw new Error('로그인 후 이용해주세요');
        }

        let url = `${API_URL}/${postId}/comments`;
        
        if(cursor != null) {
            url += `?cursor=${cursor}`;
        }

        console.log('📍 요청 URL:', url); 

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
            },
            credentials: 'include',
        });

        console.log('📍 응답 상태:', response.status, response.ok);

        const apiResponse = await response.json();

        console.log('📍 API 응답:', apiResponse);

        if(!response.ok) {
            throw new Error(apiResponse.message);
        }

        if(!apiResponse.success) {
            throw new Error(apiResponse.message);
        }

        return apiResponse.data;
    } catch (error) {
        console.error('댓글 목록 조회 에러: ',error);
        throw error;
    }
}

// 댓글 작성
export async function createComment(postId, content) {
    try {
        const accessToken = localStorage.getItem('accessToken');

        if(!accessToken) {
            throw new Error('로그인 후 이용해주세요');
        }

        const url = `${API_URL}/${postId}/comments`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
            },
            credentials: 'include',
            body: JSON.stringify({ content }),
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
        console.error('댓글 작성 에러: ',error);
        throw error;
    }
}

// user API
// 회원가입
export async function signup (email, password, nickname, profileImageId) {
    try {
        const response = await fetch( `${API_URL}/users`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ email, password, nickname, profileImageId }),
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
        console.error('회원가입 에러: ',error);
        throw error;
    }
}

// file API
