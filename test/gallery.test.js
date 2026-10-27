const { test, describe, before, after } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const { createTestContext } = require('./test_helper');

describe('3. Gallery API (활동 갤러리 업로드 및 업데이트) TDD Suite', () => {
  const ctx = createTestContext();
  let baseUrl;
  let adminToken = 'wood-admin-session-active';
  let createdGalleryId = null;
  let uploadedImageUrl = null;
  let updatedImageUrl = null;

  before(async () => {
    const res = await ctx.start();
    baseUrl = res.baseUrl;
  });

  after(async () => {
    await ctx.stop();
  });

  test('GET /api/gallery - 갤러리 목록 조회 및 카테고리 필터링', async () => {
    const res = await fetch(`${baseUrl}/api/gallery`);
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.success, true);
    assert.ok(Array.isArray(data.data));
    assert.ok(data.data.length >= 1);

    // 카테고리 필터 조회
    const filterRes = await fetch(`${baseUrl}/api/gallery?category=캠프`);
    const filterData = await filterRes.json();
    assert.strictEqual(filterRes.status, 200);
    assert.strictEqual(filterData.success, true);
    filterData.data.forEach(item => {
      assert.strictEqual(item.category, '캠프');
    });
  });

  test('POST /api/gallery - 파일 또는 제목 누락 시 400 반환', async () => {
    const formData = new FormData();
    formData.append('title', '파일 없는 사진');

    const res = await fetch(`${baseUrl}/api/gallery`, {
      method: 'POST',
      headers: { 'x-admin-token': adminToken },
      body: formData
    });
    const data = await res.json();
    assert.strictEqual(res.status, 400);
    assert.strictEqual(data.success, false);
    assert.match(data.message, /사진 파일/);
  });

  test('POST /api/gallery - 비이미지 파일 업로드 시 에러 핸들링 (400 반환)', async () => {
    const formData = new FormData();
    formData.append('title', '텍스트 파일');
    const textBlob = new Blob(['not an image content'], { type: 'text/plain' });
    formData.append('image', textBlob, 'test.txt');

    const res = await fetch(`${baseUrl}/api/gallery`, {
      method: 'POST',
      headers: { 'x-admin-token': adminToken },
      body: formData
    });
    const data = await res.json();
    assert.strictEqual(res.status, 400);
    assert.strictEqual(data.success, false);
    assert.match(data.message, /이미지/);
  });

  test('POST /api/gallery - 사진 정상 업로드 및 정적 서빙(/uploads/...) 확인', async () => {
    const formData = new FormData();
    formData.append('title', 'TDD 숲속 캠프 야영');
    formData.append('category', '캠프');
    formData.append('description', 'TDD로 업로드한 멋진 사진입니다.');
    formData.append('activity_date', '2026-10-27');
    
    // 1x1 투명 PNG 가상 바이너리
    const pngBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');
    const imgBlob = new Blob([pngBuffer], { type: 'image/png' });
    formData.append('image', imgBlob, 'tdd_camp.png');

    const res = await fetch(`${baseUrl}/api/gallery`, {
      method: 'POST',
      headers: { 'x-admin-token': adminToken },
      body: formData
    });
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.success, true);
    assert.ok(data.data.id > 0);
    assert.ok(data.data.image_url.startsWith('/uploads/'));
    
    createdGalleryId = data.data.id;
    uploadedImageUrl = data.data.image_url;

    // 업로드된 이미지가 정적 서빙 경로(/uploads/...)로 브라우저에서 다운로드 가능한지 검증
    const imgRes = await fetch(`${baseUrl}${uploadedImageUrl}`);
    assert.strictEqual(imgRes.status, 200, '업로드된 사진이 /uploads 경로로 올바르게 서비스되어야 함');
    assert.match(imgRes.headers.get('content-type'), /image/);
  });

  test('GET /api/gallery/:id - 단일 사진 상세 조회', async () => {
    const res = await fetch(`${baseUrl}/api/gallery/${createdGalleryId}`);
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.data.title, 'TDD 숲속 캠프 야영');
    assert.strictEqual(data.data.image_url, uploadedImageUrl);
  });

  test('PUT /api/gallery/:id - 사진 정보만 업데이트 (기존 이미지 유지)', async () => {
    const formData = new FormData();
    formData.append('title', '[수정] 숲속 캠프 야영 및 모닥불');
    formData.append('category', '숲속탐사');
    formData.append('description', '사진 설명이 수정되었습니다.');
    formData.append('activity_date', '2026-10-28');

    const res = await fetch(`${baseUrl}/api/gallery/${createdGalleryId}`, {
      method: 'PUT',
      headers: { 'x-admin-token': adminToken },
      body: formData
    });
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.success, true);

    // 변경 확인
    const checkRes = await fetch(`${baseUrl}/api/gallery/${createdGalleryId}`);
    const checkData = await checkRes.json();
    assert.strictEqual(checkData.data.title, '[수정] 숲속 캠프 야영 및 모닥불');
    assert.strictEqual(checkData.data.category, '숲속탐사');
    assert.strictEqual(checkData.data.image_url, uploadedImageUrl, '이미지가 유지되어야 함');
  });

  test('PUT /api/gallery/:id - 새로운 사진 파일로 교체(업데이트) 확인', async () => {
    const formData = new FormData();
    formData.append('title', '[최종 사진 교체] 숲속 탐사 완료');
    formData.append('category', '숲속탐사');
    
    // 교체할 새 이미지
    const newPngBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');
    const newImgBlob = new Blob([newPngBuffer], { type: 'image/png' });
    formData.append('image', newImgBlob, 'new_replaced.png');

    const res = await fetch(`${baseUrl}/api/gallery/${createdGalleryId}`, {
      method: 'PUT',
      headers: { 'x-admin-token': adminToken },
      body: formData
    });
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.success, true);
    assert.ok(data.data.image_url);
    assert.notStrictEqual(data.data.image_url, uploadedImageUrl, '이미지 URL이 새로운 파일로 업데이트되어야 함');
    updatedImageUrl = data.data.image_url;

    // 새 이미지가 실제로 서비스되는지 확인
    const newImgRes = await fetch(`${baseUrl}${updatedImageUrl}`);
    assert.strictEqual(newImgRes.status, 200, '교체된 새 사진이 정상 서빙되어야 함');
  });

  test('DELETE /api/gallery/:id - 사진 삭제 및 파일 정리 검증', async () => {
    const res = await fetch(`${baseUrl}/api/gallery/${createdGalleryId}`, {
      method: 'DELETE',
      headers: { 'x-admin-token': adminToken }
    });
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.success, true);

    // DB 삭제 확인
    const checkRes = await fetch(`${baseUrl}/api/gallery/${createdGalleryId}`);
    assert.strictEqual(checkRes.status, 404);

    // 물리적 파일 삭제 확인
    const physicalPath = path.join(__dirname, '..', updatedImageUrl);
    assert.strictEqual(fs.existsSync(physicalPath), false, '삭제 시 업로드 폴더의 이미지 파일도 삭제되어야 함');
  });
});
