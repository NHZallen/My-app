export async function callApi(provider, apiKey, prompt) {
  if (!provider || !apiKey) throw new Error('Missing provider or API key');
  if (provider === 'gemini') {
    const res = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });
    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    return text.trim();
  }
  if (provider === 'openrouter') {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': window.location.origin,
        'X-Title': 'AI 語言學習大師'
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-3.1-405b-instruct',
        messages: [{ role: 'user', content: prompt }]
      })
    });
    const data = await res.json();
    const text = data?.choices?.[0]?.message?.content || '';
    return text.trim();
  }
  throw new Error('Unknown provider');
}
