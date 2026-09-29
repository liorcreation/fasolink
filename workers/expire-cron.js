export default {
  async scheduled(_event, env) {
    const response = await fetch(`${env.API_URL}/api/cron/expire`, {
      method: "POST",
      headers: { authorization: `Bearer ${env.CRON_SECRET}` },
    });
    if (!response.ok) {
      console.error(`FasoLink expiry failed: ${response.status}`);
    }
  },
};
