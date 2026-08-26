async function testAll() {
  try {
    const resLogin = await fetch('http://127.0.0.1:8000/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: 'wood1234' })
    });
    const loginData = await resLogin.json();
    console.log('Login result:', loginData);

    const resMembers = await fetch('http://127.0.0.1:8000/api/members', {
      headers: { 'x-admin-token': loginData.token }
    });
    const membersData = await resMembers.json();
    console.log('Members response:', membersData);
  } catch (err) {
    console.error('Error:', err);
  }
}
testAll();
