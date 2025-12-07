const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');
const API_GATEWAY_URL = process.env.API_GATEWAY_URL;
const BACKEND_HOST = process.env.BACKEND_HOST || 'localhost';

const app = express();
const PORT = 80;

if (!API_GATEWAY_URL) {
    console.error('❌ API_GATEWAY_URL 환경변수가 설정되지 않았습니다.');
    console.error('GitHub Secrets에 API_GATEWAY_URL을 설정해주세요.');
    process.exit(1);
}

console.log(`========================================`);
console.log(`🚀 Proxy Target Configured: ${BACKEND_HOST}`);
console.log(`========================================`);

app.get('/config', (req, res) => {
    res.json({
        apiGatewayUrl: API_GATEWAY_URL
    });
});

// API 프록시 설정 - Spring Boot로 전달
app.use('/api', createProxyMiddleware({
  target: `http://${BACKEND_HOST}:8080`,
  changeOrigin: true,
  pathRewrite: {
    '^/': '/api/'
  },
  logLevel: 'info',
  onProxyReq: (proxyReq, req, res) => {
    console.log(`[Proxy] Sending to: ${BACKEND_HOST}${proxyReq.path}`);
  },
  onError: (err, req, res) => {
    console.error('❌ Proxy Error:', err);
    res.status(504).json({ error: 'Proxy Timeout', details: err.message });
  }
}));

// Actuator 프록시 설정
app.use('/actuator', createProxyMiddleware({
  target: `http://${BACKEND_HOST}:8080`,
  changeOrigin: true,
  logLevel: 'info',
  onError: (err, req, res) => {
      console.error('❌ Actuator Proxy Error:', err);
      res.status(504).send('Actuator Error');
  }
}));

// Health check 엔드포인트 - ALB
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP' });
});

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