// ── AURUM Server Configuration ──────────────────────────────
// Edit these values directly instead of using a .env file

module.exports = {
  // Database (XAMPP defaults)
  DB_HOST: 'localhost',
  DB_USER: 'root',
  DB_PASS: '',
  DB_NAME: 'aurum_db',

  // Server port
  PORT: 5555,

  // JWT secret
  JWT_SECRET: 'aurum_secret_2024',

  // Groq API key for the AI Assistant feature (FREE - no credit card needed)
  // Get your free key at: https://console.groq.com → API Keys
  GROQ_API_KEY: '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',
};