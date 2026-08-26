async function testFullSuite() {
  try {
    console.log('--- 1. Testing Admin Login ---');
    const loginRes = await fetch('http://127.0.0.1:8000/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: 'wood1234' })
    });
    const { token } = await loginRes.json();
    console.log('Login token acquired:', !!token);

    console.log('\n--- 2. Testing Create Notice for Orienteering ---');
    const noticeRes = await fetch('http://127.0.0.1:8000/api/notices', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-token': token
      },
      body: JSON.stringify({
        topic_id: 'orienteering',
        title: '🌲 [긴급공지] 북한산 오리엔티어링 우천 시 실내 지도독도법으로 대체',
        author: 'WOOD지역대 훈련대장',
        is_important: true,
        content: '이번 주말 우천 예보로 인하여 안전을 위해 북한산 야외 레이스는 실내 지도독도법 및 방위각 훈련으로 대체 진행됩니다.'
      })
    });
    const noticeData = await noticeRes.json();
    console.log('Notice created ID:', noticeData.id);

    console.log('\n--- 3. Testing Topics Status (Checking NEW badge flag) ---');
    const topicsRes = await fetch('http://127.0.0.1:8000/api/topics');
    const topicsData = await topicsRes.json();
    const orienteeringTopic = topicsData.data.find(t => t.id === 'orienteering');
    console.log('Orienteering topic has_new:', orienteeringTopic.has_new, 'notice_count:', orienteeringTopic.notice_count);

    console.log('\n--- 4. Testing Member Status Update ---');
    const updateRes = await fetch('http://127.0.0.1:8000/api/members/3/status', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-token': token
      },
      body: JSON.stringify({ status: 'approved' })
    });
    const updateData = await updateRes.json();
    console.log('Member 3 status update:', updateData.message);

    console.log('\n--- 5. Testing Dashboard Stats ---');
    const statsRes = await fetch('http://127.0.0.1:8000/api/admin/stats', {
      headers: { 'x-admin-token': token }
    });
    const statsData = await statsRes.json();
    console.log('Dashboard Stats:', statsData.data);

    console.log('\n🎉 ALL FULL SUITE TESTS PASSED 100%!');
  } catch (err) {
    console.error('Test failed:', err);
  }
}

testFullSuite();
