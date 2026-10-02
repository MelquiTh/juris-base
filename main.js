const { app, BrowserWindow, ipcMain, safeStorage, shell } = require('electron');
const path = require('path');

const aiConfigPath = path.join(app.getPath('userData'), 'juris-ai-config.json');

function readAiConfig() {
  try {
    const config = require('fs').readFileSync(aiConfigPath, 'utf8');
    return JSON.parse(config);
  } catch {
    return { provider: '', connected: false };
  }
}

function writeAiConfig(config) {
  const fs = require('fs');
  fs.writeFileSync(aiConfigPath, JSON.stringify(config), 'utf8');
}

function getAiApiKey() {
  const config = readAiConfig();
  if (!config.encryptedKey || !safeStorage.isEncryptionAvailable()) throw new Error('Conecte uma IA antes de analisar documentos.');
  return { provider: config.provider, apiKey: safeStorage.decryptString(Buffer.from(config.encryptedKey, 'base64')) };
}

async function analyzeWithAi(text, process) {
  const { provider, apiKey } = getAiApiKey();
  const prompt = `Você é um assistente jurídico para organização de processos. Analise o texto abaixo e responda SOMENTE com JSON válido, sem markdown, usando exatamente estas chaves: cnj, court, phase, date, nextAction, observation, summary. Não invente dados; use string vazia quando não houver certeza. date deve estar em YYYY-MM-DD. court deve ser um destes valores: TJSP, TRF3, TRT2, TJDFT, TRT10, TRF1. phase deve ser: Conhecimento, Instrução, Recurso, Execução ou Cumprimento de sentença. Gere uma próxima ação objetiva e uma observação curta. Processo atual: ${JSON.stringify(process)}. Texto: ${text.slice(0, 90000)}`;
  let response;
  if (provider === 'claude') {
    response = await fetch('https://api.anthropic.com/v1/messages', {method: 'POST', headers: {'content-type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01'}, body: JSON.stringify({model: 'claude-3-5-haiku-latest', max_tokens: 1200, messages: [{role: 'user', content: prompt}]})});
  } else if (provider === 'openai') {
    response = await fetch('https://api.openai.com/v1/chat/completions', {method: 'POST', headers: {'content-type': 'application/json', authorization: 'Bearer ' + apiKey}, body: JSON.stringify({model: 'gpt-4o-mini', response_format: {type: 'json_object'}, messages: [{role: 'user', content: prompt}]})});
  } else {
    response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + encodeURIComponent(apiKey), {method: 'POST', headers: {'content-type': 'application/json'}, body: JSON.stringify({contents: [{parts: [{text: prompt}]}], generationConfig: {responseMimeType: 'application/json'}})});
  }
  if (!response.ok) throw new Error('O provedor não conseguiu analisar este documento.');
  const payload = await response.json();
  const raw = provider === 'claude' ? payload.content?.[0]?.text : provider === 'openai' ? payload.choices?.[0]?.message?.content : payload.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!raw) throw new Error('A IA não retornou uma análise válida.');
  try { return JSON.parse(raw.replace(/^```json\s*|\s*```$/g, '').trim()); } catch { throw new Error('A resposta da IA não veio em formato válido.'); }
}

async function testAiConnection(provider, apiKey) {
  if (provider === 'claude') {
    const response = await fetch('https://api.anthropic.com/v1/messages', { method: 'POST', headers: {'content-type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01'}, body: JSON.stringify({model: 'claude-3-5-haiku-latest', max_tokens: 8, messages: [{role: 'user', content: 'Responda apenas OK.'}]}) });
    if (!response.ok) throw new Error('A chave Claude foi recusada pelo provedor.');
  } else if (provider === 'openai') {
    const response = await fetch('https://api.openai.com/v1/models', {headers: {authorization: 'Bearer ' + apiKey}});
    if (!response.ok) throw new Error('A chave OpenAI foi recusada pelo provedor.');
  } else if (provider === 'gemini') {
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models?key=' + encodeURIComponent(apiKey));
    if (!response.ok) throw new Error('A chave Gemini foi recusada pelo provedor.');
  }
}

ipcMain.handle('ai:get-config', () => {
  const config = readAiConfig();
  return { provider: config.provider || '', connected: Boolean(config.encryptedKey) };
});

ipcMain.handle('ai:save-config', (_event, { provider, apiKey }) => {
  if (!provider || !apiKey?.trim()) throw new Error('Informe o provedor e a chave de API.');
  if (!safeStorage.isEncryptionAvailable()) throw new Error('O armazenamento seguro do sistema não está disponível.');
  writeAiConfig({ provider, encryptedKey: safeStorage.encryptString(apiKey.trim()).toString('base64') });
  return { provider, connected: true };
});

ipcMain.handle('ai:disconnect', () => {
  writeAiConfig({ provider: '', connected: false });
  return { provider: '', connected: false };
});

ipcMain.handle('ai:open-provider', (_event, provider) => {
  const urls = {
    claude: 'https://console.anthropic.com/settings/keys',
    openai: 'https://platform.openai.com/api-keys',
    gemini: 'https://aistudio.google.com/app/apikey'
  };
  if (urls[provider]) shell.openExternal(urls[provider]);
});

function createWindow() {
  const window = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 980,
    minHeight: 680,
    backgroundColor: '#f6f8fb',
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      spellcheck: true
    }
  });

  window.loadFile(path.join(__dirname, 'index.html'));
}

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

ipcMain.handle('ai:test-config', (_event, { provider, apiKey }) => testAiConnection(provider, apiKey.trim()).then(() => ({ok: true})));
ipcMain.handle('ai:analyze', (_event, { text, process }) => analyzeWithAi(text, process));