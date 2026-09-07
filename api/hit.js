import Redis from 'ioredis';

let redis;
function getRedis() {
  if (!redis) {
    redis = new Redis(process.env.KV_REST_API_URL, {
      tls: {}, // force TLS even if the URL scheme doesn't say rediss://
      maxRetriesPerRequest: 1, // fail fast instead of retrying 20x while we debug
      connectTimeout: 5000,
    });
  }
  return redis;
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const client = getRedis();
    const count = await client.incr('profile_views'); // atomic +1, no set path
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json({ value: count });
  } catch (err) {
    return res.status(500).json({ error: err.message }); // remove once confirmed working
  }
}
