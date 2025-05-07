const https = require('https');

function sendSlackNotification(message, webhookUrl) {
  if (!webhookUrl) return;

  const data = JSON.stringify({ text: message });

  const url = new URL(webhookUrl);
  const options = {
    hostname: url.hostname,
    path: url.pathname + url.search,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length,
    },
  };

  const req = https.request(options, (res) => {
    if (res.statusCode !== 200) {
      console.error(`Slack notification failed: ${res.statusCode}`);
    }
  });

  req.on('error', (error) => {
    console.error(`Slack error: ${error.message}`);
  });

  req.write(data);
  req.end();
}

module.exports = { sendSlackNotification };
