async function testNewsletterAPI() {
  try {
    console.log('🧪 Test de l\'API Newsletter...');
    
    const testEmail = 'test-' + Date.now() + '@example.com';
    
    const response = await fetch('http://localhost:3001/api/newsletter/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: testEmail }),
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ API Newsletter fonctionne !');
      console.log('📧 Email testé:', testEmail);
      console.log('📝 Réponse:', data.message);
    } else {
      console.log('❌ Erreur API:', response.status);
      console.log('📝 Message:', data.message);
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du test API:', error);
  }
}

testNewsletterAPI();