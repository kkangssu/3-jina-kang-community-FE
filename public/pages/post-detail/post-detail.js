import { getPostDetail, getCommentList, createComment } from '../../utils/api.js';
import { formatDateTime } from '../../utils/common.js';

let postId = null;
let currentCursor = null;
let isLoading = false;
let hasNext = true;

// DOM 요소
// 게시글
const postDetailContainer = document.getElementById('post-detail-container');
// 댓글 작성
const commentContent = document.getElementById('comment-content');
const commentLength = document.getElementById('comment-length');
const submitCommentBtn = document.querySelector('#comment-write-container button[type="submit"]');
// 댓글 목록
const commentListContainer = document.getElementById('comment-list-container');
const commentWriteContainer = document.getElementById('comment-write-container');
const loadCommentBtn = document.querySelector('#load-comment-container button');

function getPostIdFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('postId');
}

// 게시글 상세 조회
async function fetchPostDetail() {
    try {
        const post = await getPostDetail(postId);
        renderPostDetail(post);
    } catch (error) {
        M.toast({ html: '게시글 상세 조회 실패: ' + error.message });
        console.error('게시글 상세 조회 에러: ',error);
    }
}

// 게시글 상세 렌더링
function renderPostDetail(post) {
    const postActions = post.isAuthor ? `
        <div class="post-actions">
            <button class="btn waves-effect waves-light purple lighten-4" data-action="edit">
            <i class="material-icons left">edit</i>수정
            </button>
            <button class="btn waves-effect waves-light purple lighten-4" data-action="delete">
            <i class="material-icons left">delete</i>삭제
            </button>
        </div>
    ` : '';

    postDetailContainer.innerHTML = `
        <div class="card">
            <div class="card-content">
                <h4 class="post-title">${post.title}</h4>
                <div class="post-data">
                    <span class="post-author">${post.authorName}</span>
                    <span class="post-created-at">${formatDateTime(post.createdAt)}</span>
                    ${postActions}
                </div>
                <div class="divider"></div>
                <div class="post-content">${post.content}</div>
                <div class="post-status grey-text" style="margin: 20px 0;">
                    <span><i class="material-icons left">thumb_up</i>${post.likeCount}</span>
                    <span><i class="material-icons left">visibility</i>${post.viewCount}</span>
                </div>
            </div>
        </div>
    `;

    if(post.isAuthor) {
        setupPostActions();
    }
}

// 댓글 카드
function createCommentCard(comment) {
    const card = document.createElement('div');
    card.className = 'card comment-item';

    const commentActions = comment.isAuthor ? `
        <div class="comment-actions">
            <button class="btn waves-effect waves-light purple lighten-4" data-action="edit">
            <i class="material-icons left">edit</i>수정
            </button>
            <button class="btn waves-effect waves-light purple lighten-4" data-action="delete">
            <i class="material-icons left">delete</i>삭제
            </button>
        </div>
    ` : '';

    card.innerHTML = `
        <div class="card comment-item">
            <div class="comment-content">
                <div class="comment-author">${comment.authorName}</div>
                <div class="comment-created-at">${formatDateTime(comment.createdAt)}</div>
                <div class="comment-content" style="margin-top: 10px;">
                    ${comment.content}
                </div>
                ${commentActions}
            </div>
        </div>
    `;
    return card;
}

// 댓글 목록 조회
async function fetchCommentList(cursor = null) {
    if(isLoading) return;
    isLoading = true;
    try {
        const response = await getCommentList(postId, currentCursor);

        if(currentCursor === null && response.data.length === 0) {
            commentListContainer.innerHTML = '<div class="no-comment">댓글이 없습니다.</div>';
            return;
        }
        
        renderCommentList(response.data);

        currentCursor = response.nextCursor;
        hasNext = response.hasNext;

        updateLoadCommentButton();
    } catch (error) {
        M.toast({ html: '댓글 목록 조회 실패: ' + error.message });
        console.error('댓글 목록 조회 에러: ',error);
    } finally {
        isLoading = false;
    }
}

// 댓글 목록 렌더링
function renderCommentList(comments) {
    comments.forEach(comment => {
        const commentCard = createCommentCard(comment);
        commentListContainer.appendChild(commentCard);
    });

    setupCommentActions();
}

// 댓글 더보기 버튼
function updateLoadCommentButton() {
    if(hasNext) {
        loadCommentBtn.style.display = 'block';
    } else {
        loadCommentBtn.style.display = 'none';
    }
}

// 이벤트 리스너 설정
function setupEventListeners() {
    submitCommentBtn.addEventListener('click', handleSubmitComment);
    loadCommentBtn.addEventListener('click', handleFetchCommentList);
    // 댓글 입력 이벤트
    commentContent.addEventListener('input', handleCommentInput);
}

// 댓글 입력 이벤트 -> 댓글 입력 안하거나 500자 넘어가면 등록버튼 비활성화
function handleCommentInput(e) {
    const length = e.target.value.length;
    commentLength.textContent = length;

    if(length === 0 || length > 500) {
        submitCommentBtn.disabled = true;
    } else {
        submitCommentBtn.disabled = false;
    }
}

// 댓글 등록 이벤트
async function handleSubmitComment(e) {
    e.preventDefault();

    const content = commentContent.value.trim();

    if(!content) {
        M.toast({ html: '댓글을 입력해주세요.' });
        return;
    }
    if(content.length > 500) {
        M.toast({ html: '500자 이하로 입력해주세요.' });
        return;
    }
    
    submitCommentBtn.disabled = true;
    const originalText = submitCommentBtn.textContent;
    submitCommentBtn.textContent = '등록 중...';

    try {
        await createComment(postId, content);

        // 댓글 입력 필드 초기화
        commentContent.value = '';
        commentLength.textContent = 0;

        // 댓글 목록 조회
        currentCursor = null;
        await fetchCommentList();
    } catch (error) {
        M.toast({ html: '댓글 등록 실패: ' + error.message });
        console.error('댓글 등록 에러: ',error);
    } finally {
        submitCommentBtn.disabled = false;
        submitCommentBtn.textContent = originalText;
    }
}

// 더보기 버튼 이벤트
async function handleFetchCommentList() {
    if(!hasNext || isLoading) return;

    loadCommentBtn.disabled = true;
    loadCommentBtn.textContent = '댓글 목록 조회 중...';

    try {
        await fetchCommentList(currentCursor);
    } finally {
        loadCommentBtn.disabled = false;
        loadCommentBtn.textContent = '더보기';
    }
}

/*
게시글 수정 이벤트
게시글 삭제 이벤트
댓글 수정 이벤트
댓글 삭제 이벤트
*/

// 초기화
async function init() {
    postId = getPostIdFromURL('postId');
    if(!postId) {
        M.toast('게시글이 없습니다.');
        window.location.href = '../post-list/post-list.html';
        console.error('게시글 ID가 없습니다.');
        return;
    }

    try {
        await Promise.all([
            fetchPostDetail(),
            fetchCommentList(),
        ]);

        setupEventListeners();
    } catch (error) {
        console.error('초기화 에러: ',error);
        M.toast({ html: '초기화 실패: ' + error.message });
    }
}

document.addEventListener('DOMContentLoaded', init);