// ── AURUM Server Configuration ──────────────────────────────
// 1. Copy this file and rename it to config.js
// 2. Fill in your real values
// 3. NEVER commit config.js to GitHub — it's in .gitignore

module.exports = {
  // Database (XAMPP defaults)
  DB_HOST: 'localhost',
  DB_USER: 'root',
  DB_PASS: '',         // your MySQL password if set
  DB_NAME: 'aurum_db',

  // Server port
  PORT: 5555,

  // JWT secret — change this to any random string in production
  JWT_SECRET: 'change_this_to_a_random_secret',

  // Groq API key for the AI Assistant (FREE)
  // Get your free key at: https://console.groq.com → API Keys
  GROQ_API_KEY: '',
};