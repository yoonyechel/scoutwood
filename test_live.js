async function testLiveSite() {
  const targetUrl = 'https://scoutwood.vercel.app';
  console.log('Testing live site:', targetUrl);

  try {
    // 1. GET /api/gallery
    console.log('\n--- 1. Testing GET /api/gallery ---');
    const getRes = await fetch(`${targetUrl}/api/gallery`);
    console.log('GET status:', getRes.status);
    const getData = await getRes.json();
    console.log('GET response:', JSON.stringify(getData, null, 2));

    // 2. POST /api/gallery (Upload image)
    console.log('\n--- 2. Testing POST /api/gallery ---');
    const formData = new FormData();
    formData.append('title', '라이브 배포 테스트 사진');
    formData.append('category', '캠프');
    formData.append('description', 'Vercel 라이브 환경 테스트 업로드');
    formData.append('activity_date', '2026-10-27');

    const pngBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');
    formData.append('image', new Blob([pngBuffer], { type: 'image/png' }), 'live_test.png');

    const uploadRes = await fetch(`${targetUrl}/api/gallery`, {
      method: 'POST',
      headers: { 'x-admin-token': 'wood-admin-session-active' },
      body: formData
    });

    console.log('POST status:', uploadRes.status);
    const uploadText = await uploadRes.text();
    console.log('POST response text:', uploadText);

    let uploadData;
    try {
      uploadData = JSON.parse(uploadText);
    } catch (e) {
      console.log('Could not parse JSON response');
    }

    // 3. If uploaded, test fetching the uploaded image url
    if (uploadData && uploadData.data && uploadData.data.image_url) {
      const imgUrl = `${targetUrl}${uploadData.data.image_url}`;
      console.log('\n--- 3. Testing fetch uploaded image:', imgUrl);
      const imgRes = await fetch(imgUrl);
      console.log('Image fetch status:', imgRes.status, 'Content-Type:', imgRes.headers.get('content-type'));
    }

  } catch (err) {
    console.error('Error during live test:', err);
  }
}

testLiveSite();
