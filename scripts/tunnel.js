import localtunnel from 'localtunnel';

const PORT = process.env.PORT || 5000;

(async () => {
  try {
    const tunnel = await localtunnel({
      port: Number(PORT),
      local_host: '127.0.0.1',
    });

    console.log(`\n======================================================`);
    console.log(`🌐 FITNESS ARENA - LIVE PUBLIC URL ACTIVE!`);
    console.log(`🔗 Public Live URL:     ${tunnel.url}`);
    console.log(`📖 Interactive Swagger:  ${tunnel.url}/api/docs`);
    console.log(`🩺 Healthcheck:         ${tunnel.url}/api/health`);
    console.log(`======================================================\n`);

    setInterval(() => {}, 60000);

    tunnel.on('close', () => {
      console.log('Tunnel closed.');
    });

    tunnel.on('error', (err) => {
      console.error('Tunnel error:', err);
    });
  } catch (err) {
    console.error('Failed to establish tunnel:', err);
  }
})();
