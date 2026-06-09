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

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const { image, message } = JSON.parse(event.body);

    if (!image) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: '缺少图像数据' }) };
    }

    const store = getStore('drawings');
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    const entry = {
      id,
      image,
      message: message || '',
      createdAt: Date.now(),
    };

    const listStr = await store.get('_list', { type: 'json' });
    const list = Array.isArray(listStr) ? listStr : [];
    list.push(id);
    await store.set('_list', JSON.stringify(list));
    await store.set(id, JSON.stringify(entry));

    return { statusCode: 200, headers, body: JSON.stringify({ ok: true, id }) };
  } catch (err) {
    console.error('submit error:', err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: '服务器内部错误' }) };
  }
};
