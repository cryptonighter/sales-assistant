// pages/api/config.js
import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      // Read .env.local
      const envPath = path.join(process.cwd(), '.env.local');
      let config = {};
      if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf8');
        envContent.split('\n').forEach(line => {
          const [key, value] = line.split('=');
          if (key && value) {
            config[key.trim()] = value.trim();
          }
        });
      }
      res.status(200).json(config);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else if (req.method === 'POST') {
    try {
      const newConfig = req.body;
      // Write to .env.local
      const envPath = path.join(process.cwd(), '.env.local');
      let envContent = '';
      Object.keys(newConfig).forEach(key => {
        if (newConfig[key]) {
          envContent += `${key}=${newConfig[key]}\n`;
        }
      });
      fs.writeFileSync(envPath, envContent);
      res.status(200).json({ message: 'Configuration saved' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}