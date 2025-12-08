// 배포시 변경 필요
const API_URL = '/api'

// 기본 프로필 이미지 정보 (S3에 업로드된 이미지)
const DEFAULT_PROFILE_IMAGE = {
    fileName: 'base_user_profile.png',
    fileKey: 'uploads/profiles/050fa20b-51fa-4cc5-a114-8454d74738f0.png',
    s3Url: 'https://ktb-community-jina.s3.ap-northeast-2.amazonaws.com/uploads/profiles/050fa20b-51fa-4cc5-a114-8454d74738f0.png',
    contentType: 'image/png',
    url: 'https://ktb-community-jina.s3.ap-northeast-2.amazonaws.com/uploads/profiles/050fa20b-51fa-4cc5-a114-8454d74738f0.png'
}

export { API_URL, DEFAULT_PROFILE_IMAGE };