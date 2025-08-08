import React, { useState } from 'react';
import { callApi } from './apiClient';

function sha256(str) {
  return crypto.subtle.digest('SHA-256', new TextEncoder().encode(str)).then(buf => {
    return Array.from(new Uint8Array(buf)).map(x => x.toString(16).padStart(2, '0')).join('');
  });
}

function App() {
  const [username, setUsername] = useState('');
  const [provider, setProvider] = useState('gemini');
  const [geminiKey, setGeminiKey] = useState('');
  const [openrouterKey, setOpenrouterKey] = useState('');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  const apiKey = provider === 'gemini' ? geminiKey : openrouterKey;

  const handleSend = async () => {
    if (!/^\w{3,20}$/.test(username)) {
      alert('使用者名稱需為 3-20 位英數字');
      return;
    }
    if (!apiKey.trim()) {
      alert('請輸入 API 金鑰');
      return;
    }
    const text = await callApi(provider, apiKey, input);
    setOutput(text);
  };

  const handleExport = async () => {
    const state = { username, provider, data: { input, output } };
    const signature = await sha256(JSON.stringify(state) + username + geminiKey + openrouterKey);
    const blob = new Blob([JSON.stringify({ ...state, signature }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'backup.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const text = await file.text();
    const obj = JSON.parse(text);
    const sig = obj.signature; delete obj.signature;
    const valid = sig === await sha256(JSON.stringify(obj) + username + geminiKey + openrouterKey);
    if (!valid) { alert('驗證失敗'); return; }
    setInput(obj.data.input || '');
    setOutput(obj.data.output || '');
  };

  return (
    <div style={{ padding: '1rem', fontFamily: 'sans-serif' }}>
      <h1>AI 語言學習大師 (示例)</h1>
      <div style={{ marginTop: '1rem' }}>
        <label>使用者名稱: </label>
        <input value={username} onChange={e => setUsername(e.target.value)} />
      </div>
      <div style={{ marginTop: '0.5rem' }}>
        <label>API 提供者: </label>
        <select value={provider} onChange={e => setProvider(e.target.value)}>
          <option value="gemini">Gemini</option>
          <option value="openrouter">OpenRouter</option>
        </select>
      </div>
      <div style={{ marginTop: '0.5rem' }}>
        {provider === 'gemini' ? (
          <input type="password" placeholder="Gemini API Key" value={geminiKey} onChange={e => setGeminiKey(e.target.value)} />
        ) : (
          <input type="password" placeholder="OpenRouter API Key" value={openrouterKey} onChange={e => setOpenrouterKey(e.target.value)} />
        )}
      </div>
      <textarea style={{ width: '100%', height: '6rem', marginTop: '1rem' }} value={input} onChange={e => setInput(e.target.value)} placeholder="輸入提示語..." />
      <button style={{ marginTop: '0.5rem' }} onClick={handleSend}>送出</button>
      <pre style={{ whiteSpace: 'pre-wrap', background: '#f3f4f6', padding: '1rem', marginTop: '1rem' }}>{output}</pre>
      <div style={{ marginTop: '1rem' }}>
        <button onClick={handleExport}>匯出紀錄</button>
        <input type="file" accept="application/json" onChange={handleImport} />
      </div>
    </div>
  );
}

export default App;
