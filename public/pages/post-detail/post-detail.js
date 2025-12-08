import { getPostDetail, getCommentList, createComment, deletePost, deleteComment, updateComment, postLike, deletePostLike } from '../../utils/api.js';
import { formatDateTime } from '../../utils/common.js';
import { isAuthenticated } from '../../utils/auth.js';
import { ROUTES } from '../../utils/routes.js';

if (!isAuthenticated()) {
    window.location.href = '/pages/login/login.html';
}

let postId = null;
let currentPost = null;
let currentCursor = null;
let isLoading = false;
let hasNext = true;
let comments = [];

// DOM 요소
const backBtn = document.getElementById('back-btn');
const postDetailContainer = document.getElementById('post-detail-container');
const postActionsContainer = document.getElementById('post-actions');
const commentContent = document.getElementById('comment-content');
const commentLength = document.getElementById('comment-length');
const submitCommentBtn = document.getElementById('submit-comment-btn');
const commentListContainer = document.getElementById('comment-list-container');
const loadCommentContainer = document.getElementById('load-comment-container');
const loadCommentBtn = document.getElementById('load-comment-btn');

function getPostIdFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('postId');
}

// 게시글 상세 조회
async function fetchPostDetail() {
    try {
        const apiData = await getPostDetail(postId);
        currentPost = apiData.data;
        renderPostDetail(currentPost);
    } catch (error) {
        M.toast({ html: '게시글 상세 조회 실패: ' + error.message });
        console.error('게시글 상세 조회 에러: ', error);
    }
}

// 댓글 개수 업데이트
function updateCommentCount(count) {
    const commentCount = document.querySelector('#comment-count-display');
    if (commentCount) {
        commentCount.textContent = count;
    }
}

// 게시글 상세 렌더링
function renderPostDetail(post) {
    // 수정/삭제 버튼 렌더링 (작성자만)
    if (post.isAuthor) {
        postActionsContainer.innerHTML = `
            <button class="btn waves-effect waves-light" data-action="edit">수정</button>
            <button class="btn waves-effect waves-light" data-action="delete">삭제</button>
        `;
    }

    // 첨부 이미지
    const imageGallery = post.postFiles && post.postFiles.length > 0
        ? `
        <div class="post-images">
            ${post.postFiles
                .sort((a, b) => a.imageIndex - b.imageIndex)
                .map(file => `<img src="${file.url}" alt="${file.fileName}">`)
                .join('')}
        </div>
        `
        : '';

    // 좋아요 아이콘 (isLiked에 따라 다른 아이콘)
    const likeIconClass = post.isLiked ? 'thumb_up' : 'thumb_up_off_alt';
    const likeIconColor = post.isLiked ? 'color: #7c3aed;' : '';

    // 본문 카드
    postDetailContainer.innerHTML = `
        <h4 class="post-title">${post.title}</h4>
        <div class="post-meta">
            <div class="post-author-info">
                <span class="post-author">${post.authorName}</span>
                <span class="post-date">${formatDateTime(post.createdAt)}</span>
            </div>
        </div>
        <div class="divider"></div>
        <div class="post-content">${post.content.replace(/\n/g, '<br>')}</div>
        ${imageGallery}
        <div class="post-stats">
            <span id="like-button" style="cursor: pointer;">
                <i class="material-icons" style="${likeIconColor}">${likeIconClass}</i>
                <span id="like-count">${post.likeCount}</span>
            </span>
            <span><i class="material-icons">visibility</i> ${post.viewCount}</span>
            <span><i class="material-icons">comment</i> <span id="comment-count-display">...</span></span>
        </div>
    `;
}

// 댓글 카드
function createCommentCard(comment) {
    const card = document.createElement('div');
    card.className = 'comment-card';
    card.dataset.commentId = comment.commentId;

    const commentActions = comment.isAuthor
        ? `
        <div class="comment-actions">
            <button class="btn waves-effect waves-light" data-action="edit">수정</button>
            <button class="btn waves-effect waves-light" data-action="delete">삭제</button>
        </div>
        `
        : '';

    card.innerHTML = `
        <div class="comment-header">
            <div class="comment-author-info">
                <span class="comment-author">${comment.authorName}</span>
                <span class="comment-date">${formatDateTime(comment.createdAt)}</span>
            </div>
            ${commentActions}
        </div>
        <div class="comment-content">${comment.content.replace(/\n/g, '<br>')}</div>
    `;
    return card;
}

// 댓글 목록 조회
async function fetchCommentList(cursor = null) {
    if (isLoading) return;
    isLoading = true;

    try {
        const apiData = await getCommentList(postId, cursor);
        const commentList = apiData.data;

        if (cursor === null && commentList.data.length === 0) {
            updateCommentCount(0);
            updateLoadCommentButton(false);
            return;
        }

        // 첫 댓글 목록 조회 시 초기화
        if (cursor === null) {
            commentListContainer.innerHTML = '';
            comments = [];
        }

        comments = comments.concat(commentList.data);

        renderCommentList(commentList.data);

        updateCommentCount(commentList.count);

        currentCursor = commentList.nextCursor;
        hasNext = commentList.hasNext;

        updateLoadCommentButton(hasNext);
    } catch (error) {
        M.toast({ html: '댓글 목록 조회 실패: ' + error.message });
        console.error('댓글 목록 조회 에러: ', error);
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
}

// 댓글 목록 삭제 후 렌더링
function renderCommentListAfterDelete(comments) {
    commentListContainer.innerHTML = '';
    comments.forEach(comment => {
        const commentCard = createCommentCard(comment);
        commentListContainer.appendChild(commentCard);
    });
}

// 댓글 더보기 버튼 표시/숨김
function updateLoadCommentButton(show) {
    if (show) {
        loadCommentContainer.style.display = 'block';
    } else {
        loadCommentContainer.style.display = 'none';
    }
}

// 뒤로가기 버튼
function handleBackClick() {
    window.location.href = ROUTES.POSTS;
}

// 게시글 수정/삭제 이벤트
function handlePostAction(e) {
    const editBtn = e.target.closest('[data-action="edit"]');
    const deleteBtn = e.target.closest('[data-action="delete"]');

    if (editBtn) {
        handleEditPost();
    } else if (deleteBtn) {
        handleDeletePost();
    }
}

// 좋아요/좋아요 취소 이벤트
async function handleLikeToggle() {
    if (!currentPost) return;

    const likeButton = document.getElementById('like-button');
    const likeIcon = likeButton.querySelector('i');
    const likeCountElement = document.getElementById('like-count');

    // 중복 클릭 방지
    likeButton.style.pointerEvents = 'none';

    try {
        if (currentPost.isLiked) {
            // 좋아요 취소
            await deletePostLike(postId);
            currentPost.isLiked = false;
            currentPost.likeCount--;

            // 아이콘 업데이트
            likeIcon.textContent = 'thumb_up_off_alt';
            likeIcon.style.color = '';
        } else {
            // 좋아요
            await postLike(postId);
            currentPost.isLiked = true;
            currentPost.likeCount++;

            // 아이콘 업데이트
            likeIcon.textContent = 'thumb_up';
            likeIcon.style.color = '#7c3aed';
        }

        // 좋아요 개수 업데이트
        likeCountElement.textContent = currentPost.likeCount;
    } catch (error) {
        M.toast({ html: '좋아요 처리 실패: ' + error.message });
        console.error('좋아요 에러: ', error);
    } finally {
        // 클릭 다시 활성화
        likeButton.style.pointerEvents = 'auto';
    }
}

// 댓글 수정/삭제 이벤트
function handleCommentAction(e) {
    const editBtn = e.target.closest('[data-action="edit"]');
    const deleteBtn = e.target.closest('[data-action="delete"]');
    const saveBtn = e.target.closest('[data-action="save"]');
    const cancelBtn = e.target.closest('[data-action="cancel"]');

    if (editBtn) {
        handleEditComment(e);
    } else if (deleteBtn) {
        handleDeleteComment(e);
    } else if (saveBtn) {
        handleSaveComment(e);
    } else if (cancelBtn) {
        handleCancelEdit(e);
    }
}

// 댓글 입력 이벤트
function handleCommentInput(e) {
    const length = e.target.value.length;
    commentLength.textContent = length;

    if (length === 0 || length > 500) {
        submitCommentBtn.disabled = true;
    } else {
        submitCommentBtn.disabled = false;
    }
}

// 댓글 등록 이벤트
async function handleSubmitComment(e) {
    e.preventDefault();

    const content = commentContent.value.trim();

    if (!content) {
        M.toast({ html: '댓글을 입력해주세요.' });
        return;
    }
    if (content.length > 500) {
        M.toast({ html: '500자 이하로 입력해주세요.' });
        return;
    }

    submitCommentBtn.disabled = true;
    const originalText = submitCommentBtn.textContent;
    submitCommentBtn.textContent = '등록 중...';

    try {
        const apiData = await createComment(postId, content);
        const newComment = apiData.data;

        comments.unshift(newComment);

        const commentElement = createCommentCard(newComment);
        commentListContainer.prepend(commentElement);

        const currentCounter = parseInt(document.querySelector('#comment-count-display').textContent) || 0;
        updateCommentCount(currentCounter + 1);

        // 댓글 입력 필드 초기화
        commentContent.value = '';
        commentLength.textContent = 0;

        M.toast({ html: '댓글이 등록되었습니다.' });
    } catch (error) {
        M.toast({ html: '댓글 등록 실패: ' + error.message });
        console.error('댓글 등록 에러: ', error);
    } finally {
        submitCommentBtn.disabled = false;
        submitCommentBtn.textContent = originalText;
    }
}

// 더보기 버튼 이벤트
async function handleFetchCommentList() {
    if (!hasNext || isLoading) return;

    loadCommentBtn.disabled = true;
    loadCommentBtn.textContent = '댓글 목록 조회 중...';

    try {
        await fetchCommentList(currentCursor);
    } finally {
        loadCommentBtn.disabled = false;
        loadCommentBtn.textContent = '더보기';
    }
}

// 게시글 수정 핸들러
function handleEditPost() {
    window.location.href = `../post-edit/post-edit.html?postId=${postId}`;
}

// 게시글 삭제 핸들러
async function handleDeletePost() {
    if (!confirm('정말 삭제하시겠습니까?')) {
        return;
    }

    const deleteBtn = postActionsContainer.querySelector('[data-action="delete"]');

    deleteBtn.disabled = true;
    const originalText = deleteBtn.textContent;
    deleteBtn.textContent = '삭제 중...';

    try {
        await deletePost(postId);

        M.toast({ html: '게시글이 삭제되었습니다.' });

        window.location.href = ROUTES.POSTS;
    } catch (error) {
        M.toast({ html: '게시글 삭제 실패: ' + error.message });
        deleteBtn.disabled = false;
        deleteBtn.textContent = originalText;
    }
}

// 댓글 수정 핸들러
function handleEditComment(e) {
    const commentCard = e.target.closest('.comment-card');
    const commentId = commentCard.dataset.commentId;

    const commentData = comments.find(comment => comment.commentId == commentId);
    if (!commentData) {
        M.toast({ html: '댓글을 찾을 수 없습니다.' });
        return;
    }

    const currentContent = commentData.content;

    commentCard.innerHTML = `
        <div class="comment-edit-mode">
            <textarea id="edit-comment-${commentId}">${currentContent}</textarea>
            <div class="comment-actions" style="margin-top: 8px;">
                <button class="btn waves-effect waves-light" data-action="save">저장</button>
                <button class="btn waves-effect waves-light" data-action="cancel">취소</button>
            </div>
        </div>
    `;

    const textarea = commentCard.querySelector('textarea');
    textarea.focus();
}

// 댓글 삭제 핸들러
async function handleDeleteComment(e) {
    const commentCard = e.target.closest('.comment-card');
    const commentId = commentCard.dataset.commentId;

    if (!confirm('정말 삭제하시겠습니까?')) {
        return;
    }

    try {
        await deleteComment(postId, commentId);

        const deletedCommentId = Number(commentId);

        comments = comments.filter(comment => comment.commentId !== deletedCommentId);

        const currentCounter = parseInt(document.querySelector('#comment-count-display').textContent) || 0;
        updateCommentCount(currentCounter - 1);

        renderCommentListAfterDelete(comments);

        M.toast({ html: '댓글이 삭제되었습니다.' });
    } catch (error) {
        M.toast({ html: '댓글 삭제 실패: ' + error.message });
        console.error('댓글 삭제 에러: ', error);
    }
}

// 댓글 수정 저장 핸들러
async function handleSaveComment(e) {
    const commentCard = e.target.closest('.comment-card');
    const commentId = commentCard.dataset.commentId;
    const textarea = commentCard.querySelector(`#edit-comment-${commentId}`);
    const newContent = textarea.value.trim();

    // 유효성 검사
    if (!newContent) {
        M.toast({ html: '댓글을 입력해주세요.' });
        return;
    }
    if (newContent.length > 500) {
        M.toast({ html: '500자 이하로 입력해주세요.' });
        return;
    }

    // 버튼 비활성화
    const saveBtn = e.target.closest('[data-action="save"]');
    saveBtn.disabled = true;
    saveBtn.textContent = '저장 중...';

    try {
        // 1. API 호출
        await updateComment(postId, commentId, newContent);

        // 2. 로컬 comments 배열 데이터 업데이트
        const commentData = comments.find(c => c.commentId == commentId);
        if (commentData) {
            commentData.content = newContent;
        }

        // 3. 카드 재생성 및 교체
        const updatedCard = createCommentCard(commentData);
        commentCard.parentNode.replaceChild(updatedCard, commentCard);

        M.toast({ html: '댓글이 수정되었습니다.' });

    } catch (error) {
        M.toast({ html: '댓글 수정 실패: ' + error.message });
        console.error('댓글 수정 에러: ', error);
        saveBtn.disabled = false;
        saveBtn.textContent = '저장';
    }
}

// 댓글 수정 취소 핸들러
function handleCancelEdit(e) {
    const commentCard = e.target.closest('.comment-card');
    const commentId = commentCard.dataset.commentId;

    // 1. 원본 데이터 찾기
    const commentData = comments.find(c => c.commentId == commentId);
    if (!commentData) return;

    // 2. 원본 데이터로 카드 재생성 및 교체
    const originalCard = createCommentCard(commentData);
    commentCard.parentNode.replaceChild(originalCard, commentCard);
}

// 이벤트 리스너 설정
function setupEventListeners() {
    // 뒤로가기 버튼
    backBtn.addEventListener('click', handleBackClick);
    // 댓글 입력 이벤트
    submitCommentBtn.addEventListener('click', handleSubmitComment);
    commentContent.addEventListener('input', handleCommentInput);
    // 댓글 더보기 이벤트
    loadCommentBtn.addEventListener('click', handleFetchCommentList);
    // 게시글 수정/삭제 이벤트
    postActionsContainer.addEventListener('click', handlePostAction);
    // 좋아요 버튼 이벤트 (이벤트 위임)
    postDetailContainer.addEventListener('click', (e) => {
        const likeButton = e.target.closest('#like-button');
        if (likeButton) {
            handleLikeToggle();
        }
    });
    // 댓글 수정/삭제 이벤트
    commentListContainer.addEventListener('click', handleCommentAction);
}

// 초기화
async function init() {
    postId = getPostIdFromURL('postId');
    if (!postId) {
        M.toast({ html: '게시글이 없습니다.' });
        window.location.href = ROUTES.POSTS;
        console.error('게시글 ID가 없습니다.');
        return;
    }

    try {
        await fetchPostDetail();
        try {
            await fetchCommentList();
        } catch (error) {
            console.warn('댓글 로딩 실패:', error);
            commentListContainer.innerHTML = '...준비 중...';
        }

        setupEventListeners();
    } catch (error) {
        console.error('초기화 에러: ', error);
        M.toast({ html: '페이지를 불러올 수 없습니다.' });
    }
}

document.addEventListener('DOMContentLoaded', init);
