const { test, describe, before, after } = require('node:test');
const assert = require('node:assert');
const { createTestContext } = require('./test_helper');

describe('1. Members API (가입 신청 및 관리) TDD Suite', () => {
  const ctx = createTestContext();
  let baseUrl;
  let adminToken = 'wood-admin-session-active';
  let createdMemberId = null;

  before(async () => {
    const res = await ctx.start();
    baseUrl = res.baseUrl;
  });

  after(async () => {
    await ctx.stop();
  });

  test('POST /api/members/apply - 필수 입력 누락 시 400 반환', async () => {
    const res = await fetch(`${baseUrl}/api/members/apply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: '홍길동' }) // phone and scout_type missing
    });
    const data = await res.json();
    assert.strictEqual(res.status, 400);
    assert.strictEqual(data.success, false);
    assert.match(data.message, /필수/);
  });

  test('POST /api/members/apply - 정상 가입 신청 접수', async () => {
    const res = await fetch(`${baseUrl}/api/members/apply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'TDD대원',
        scout_type: '초등 (컵스카우트)',
        phone: '010-1234-5678',
        memo: '스카우트 대원이 되고 싶습니다!'
      })
    });
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.success, true);
    assert.ok(data.id > 0);
    createdMemberId = data.id;
  });

  test('GET /api/members - 관리자 권한으로 신청자 목록 및 카운트 조회', async () => {
    const res = await fetch(`${baseUrl}/api/members?status=all`, {
      headers: { 'x-admin-token': adminToken }
    });
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.success, true);
    assert.ok(Array.isArray(data.data));
    assert.ok(data.counts.total >= 1);
    assert.ok(data.counts.pending >= 1);
    
    const found = data.data.find(m => m.id === createdMemberId);
    assert.ok(found, '방금 신청한 대원이 목록에 존재해야 함');
    assert.strictEqual(found.name, 'TDD대원');
    assert.strictEqual(found.status, 'pending');
  });

  test('PATCH /api/members/:id/status - 신청서 상태 승인(approved)으로 변경', async () => {
    const res = await fetch(`${baseUrl}/api/members/${createdMemberId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-token': adminToken
      },
      body: JSON.stringify({ status: 'approved' })
    });
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.success, true);
    assert.match(data.message, /승인/);
  });

  test('PATCH /api/members/:id/status - 유효하지 않은 상태값 전달 시 400 반환', async () => {
    const res = await fetch(`${baseUrl}/api/members/${createdMemberId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-token': adminToken
      },
      body: JSON.stringify({ status: 'invalid_status' })
    });
    const data = await res.json();
    assert.strictEqual(res.status, 400);
    assert.strictEqual(data.success, false);
  });

  test('DELETE /api/members/:id - 신청서 삭제', async () => {
    const res = await fetch(`${baseUrl}/api/members/${createdMemberId}`, {
      method: 'DELETE',
      headers: { 'x-admin-token': adminToken }
    });
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.success, true);

    // 삭제 확인
    const checkRes = await fetch(`${baseUrl}/api/members?status=all`, {
      headers: { 'x-admin-token': adminToken }
    });
    const checkData = await checkRes.json();
    const found = checkData.data.find(m => m.id === createdMemberId);
    assert.strictEqual(found, undefined, '삭제된 회원은 목록에 없어야 함');
  });
});
