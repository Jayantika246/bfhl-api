import express from 'express';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const OFFICIAL_EMAIL = process.env.OFFICIAL_EMAIL;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Helper functions
function fibonacci(n) {
  if (n <= 0) return [];
  if (n === 1) return [0];
  const fib = [0, 1];
  for (let i = 2; i < n; i++) {
    fib.push(fib[i - 1] + fib[i - 2]);
  }
  return fib;
}

function isPrime(num) {
  if (num < 2) return false;
  for (let i = 2; i <= Math.sqrt(num); i++) {
    if (num % i === 0) return false;
  }
  return true;
}

function gcd(a, b) {
  return b === 0 ? a : gcd(b, a % b);
}

function lcm(a, b) {
  return (a * b) / gcd(a, b);
}

async function callGeminiAI(prompt) {
  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
      {
        contents: [{ parts: [{ text: prompt }] }]
      }
    );
    return response.data.candidates[0].content.parts[0].text;
  } catch (error) {
    throw new Error('AI service error');
  }
}

// Routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'BFHL API is running',
    endpoints: {
      health: '/health',
      bfhl: '/bfhl (POST)'
    }
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.post('/bfhl', async (req, res) => {
  try {
    const { operation, data } = req.body;

    let result;
    switch (operation) {
      case 'fibonacci':
        result = fibonacci(data.n);
        break;
      case 'prime':
        result = isPrime(data.number);
        break;
      case 'lcm':
        result = lcm(data.a, data.b);
        break;
      case 'hcf':
        result = gcd(data.a, data.b);
        break;
      case 'ai':
        result = await callGeminiAI(data.prompt);
        break;
      default:
        return res.status(400).json({ error: 'Invalid operation' });
    }

    res.json({
      operation,
      result,
      email: OFFICIAL_EMAIL
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`BFHL API running on port ${PORT}`);
});
