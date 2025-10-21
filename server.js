const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

// 정적 파일 제공 - public 폴더를 루트로 설정
app.use(express.static('public'));

// 루트 경로 접속 시 로그인 페이지로 리다이렉트
app.get('/', (req, res) => {
    res.redirect('/pages/login/login.html');
});

// 404 처리
app.use((req, res) => {
    res.status(404).send('페이지를 찾을 수 없습니다.');
});

app.listen(PORT, () => {
    console.log(`서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
});