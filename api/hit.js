import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  // Only GET is allowed, and there is no code path anywhere below that
  // accepts a "value" param — this closes off the tampering vector
  // entirely instead of just trying to gate it.
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const count = await kv.incr('profile_views'); // atomic +1, nothing else possible
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json({ value: count });
  } catch (err) {
    return res.status(500).json({ error: 'Counter unavailable' });
  }
}
