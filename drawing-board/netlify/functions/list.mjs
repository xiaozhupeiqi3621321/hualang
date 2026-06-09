import { getStore } from '@netlify/blobs';

export const handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers };
  }

  const password = event.queryStringParameters?.password || '';
  const envPwd = process.env.GALLERY_PASSWORD || '';

  if (envPwd && password !== envPwd) {
    return { statusCode: 401, headers, body: JSON.stringify({ error: '密码错误' }) };
  }

  try {
    const store = getStore('drawings');
    const listStr = await store.get('_list', { type: 'json' });
    const list = Array.isArray(listStr) ? listStr : [];

    const entries = [];
    for (const id of list) {
      const raw = await store.get(id, { type: 'json' });
      if (raw) entries.push(raw);
    }

    entries.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

    return { statusCode: 200, headers, body: JSON.stringify(entries) };
  } catch (err) {
    console.error('list error:', err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: '服务器内部错误' }) };
  }
};
