import { getPostList } from '../../utils/api.js';
import { formatDateTime } from '../../utils/common.js';
import { ROUTES } from '../../utils/routes.js';
let currentCursor = null;
let isLoading = false;
let hasNext = true;

// DOM 요소
const postList = document.getElementById('post-list');

function setCreatePostButton() {
    const createPostButton = document.querySelector('.post-edit button');
    createPostButton.addEventListener('click', () => {
        window.location.href = ROUTES.POST_WRITE;
    });
}

// 게시글 카드
function createPostCard(post) {
    const card = document.createElement('div');
    card.className = "post-card grey lighten-5";
    card.dataset.postId = post.postId;

    card.innerHTML = `
        <div class="card-content">
            <div class="post-title">${post.title}</div>
            <div class="post-data">
                <div class="post-status">
                    좋아요 ${post.likeCount} 조회수 ${post.viewCount}
                </div>
                <div class="post-created-at">
                    ${formatDateTime(post.createdAt)}
                </div>
            </div>
            <div class="divider"></div>
            <div class="post-author"> ${post.authorName} </div>
        </div>
    `;
    
    card.addEventListener('click', () => {
        window.location.href = `../post-detail/post-detail.html?postId=${post.postId}`;
    });
    return card;
}

// 게시글 목록 조회
async function fetchPostList() {
    if(isLoading || !hasNext) return;

    isLoading = true;

    try {
        const apiData = await getPostList(currentCursor);
        const response = apiData.data;

        if(currentCursor === null && response.data.length === 0) {
            postList.innerHTML = '<div class="no-post">게시글이 없습니다.</div>';
            return;
        }
        renderPostList(response.data);

        currentCursor = response.nextCursor;
        hasNext = response.hasNext;
    } catch (error) {
        M.toast({ html: '게시글 목록 조회 실패: ' + error.message });
        console.error('게시글 목록 조회 에러: ',error);
    } finally {
        isLoading = false;
    }
}

// 게시글 목록 렌더링
function renderPostList(posts) {
    posts.forEach(post => {
        const card = createPostCard(post);
        postList.appendChild(card);
    });
}

// 무한 스크롤
function setupInfiniteScroll() {
    window.addEventListener('scroll', () => {
        const scrollHeight = document.documentElement.scrollHeight;
        const scrollTop = document.documentElement.scrollTop;
        const clientHeight = document.documentElement.clientHeight;

        if(scrollTop + clientHeight >= scrollHeight - 100) {
            fetchPostList();
        }
    });
}

// 초기화
async function init() {
    await fetchPostList();
    setCreatePostButton();
    setupInfiniteScroll();
}

document.addEventListener('DOMContentLoaded', init);