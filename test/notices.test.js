const { test, describe, before, after } = require('node:test');
const assert = require('node:assert');
const { createTestContext } = require('./test_helper');

describe('2. Notices & Topics API (공지사항 및 활동별 게시판) TDD Suite', () => {
  const ctx = createTestContext();
  let baseUrl;
  let adminToken = 'wood-admin-session-active';
  let createdNoticeId = null;

  before(async () => {
    const res = await ctx.start();
    baseUrl = res.baseUrl;
  });

  after(async () => {
    await ctx.stop();
  });

  test('GET /api/topics - 주제 목록 조회 및 통계 (has_new 플래그 정확도)', async () => {
    const res = await fetch(`${baseUrl}/api/topics`);
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.success, true);
    assert.ok(Array.isArray(data.data));
    assert.ok(data.data.length >= 4);

    const camp = data.data.find(t => t.id === 'camp');
    assert.ok(camp);
    assert.strictEqual(typeof camp.notice_count, 'number');
    assert.strictEqual(typeof camp.has_new, 'boolean');
  });

  test('POST /api/notices - 공지사항 등록 유효성 검사 (필수 항목 누락 시 400)', async () => {
    const res = await fetch(`${baseUrl}/api/notices`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-token': adminToken
      },
      body: JSON.stringify({ title: '제목만 있음' })
    });
    const data = await res.json();
    assert.strictEqual(res.status, 400);
    assert.strictEqual(data.success, false);
  });

  test('POST /api/notices - 공지사항 정상 등록', async () => {
    const res = await fetch(`${baseUrl}/api/notices`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-token': adminToken
      },
      body: JSON.stringify({
        topic_id: 'camp',
        title: 'TDD 가을 야영 공지사항',
        author: '훈련대장',
        content: 'TDD를 통해 검증된 가을 야영 세부 계획입니다.',
        is_important: true
      })
    });
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.success, true);
    assert.ok(data.id > 0);
    createdNoticeId = data.id;
  });

  test('GET /api/notices - 공지 목록 조회 및 검색 필터링', async () => {
    const res = await fetch(`${baseUrl}/api/notices?topic_id=camp&search=TDD`);
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.success, true);
    assert.ok(data.data.length >= 1);
    
    const item = data.data.find(n => n.id === createdNoticeId);
    assert.ok(item, '방금 생성된 공지사항이 검색되어야 함');
    assert.strictEqual(item.is_important, 1);
  });

  test('GET /api/notices/:id - 단일 공지 조회 및 조회수(views) 자동 증가 검증', async () => {
    // 1차 조회
    const res1 = await fetch(`${baseUrl}/api/notices/${createdNoticeId}`);
    const data1 = await res1.json();
    assert.strictEqual(res1.status, 200);
    const initialViews = data1.data.views;

    // 2차 조회
    const res2 = await fetch(`${baseUrl}/api/notices/${createdNoticeId}`);
    const data2 = await res2.json();
    assert.strictEqual(res2.status, 200);
    assert.strictEqual(data2.data.views, initialViews + 1, '조회수가 1 증가해야 함');
  });

  test('PUT /api/notices/:id - 공지사항 수정(업데이트)', async () => {
    const res = await fetch(`${baseUrl}/api/notices/${createdNoticeId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-token': adminToken
      },
      body: JSON.stringify({
        topic_id: 'camp',
        title: '[수정됨] TDD 가을 야영 공지사항 최종안',
        author: '총괄대장',
        content: '수정된 야영 내용입니다.',
        is_important: false
      })
    });
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.success, true);

    // 수정 내용 확인
    const checkRes = await fetch(`${baseUrl}/api/notices/${createdNoticeId}`);
    const checkData = await checkRes.json();
    assert.strictEqual(checkData.data.title, '[수정됨] TDD 가을 야영 공지사항 최종안');
    assert.strictEqual(checkData.data.author, '총괄대장');
    assert.strictEqual(checkData.data.is_important, 0);
  });

  test('DELETE /api/notices/:id - 공지사항 삭제', async () => {
    const res = await fetch(`${baseUrl}/api/notices/${createdNoticeId}`, {
      method: 'DELETE',
      headers: { 'x-admin-token': adminToken }
    });
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.success, true);

    // 삭제 확인
    const checkRes = await fetch(`${baseUrl}/api/notices/${createdNoticeId}`);
    assert.strictEqual(checkRes.status, 404);
  });
});
