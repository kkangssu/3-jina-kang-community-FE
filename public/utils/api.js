import { API_URL } from './config.js';

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