# NutriPlan AI - AI Powered Personalized Diet Planner

## 🚀 Features
- 🤖 AI-generated personalized 7-day diet plans
- 📊 BMI Calculator with category analysis
- 📈 Progress tracking with beautiful charts
- 📱 PWA support - install as mobile app
- 🌓 Dark/Light/System theme modes
- 📄 PDF export of diet plans
- 🔐 JWT authentication with bcrypt
- 🍛 Indian cuisine focused
- 💾 MongoDB database
- 🎨 Modern, responsive UI

## 🛠️ Tech Stack
- **Frontend**: React, Vite, TailwindCSS, Recharts
- **Backend**: Node.js, Express, MongoDB, Mongoose
- **AI**: OpenAI API / Gemini API
- **Auth**: JWT, bcrypt
- **PWA**: Service Workers, Web App Manifest

## 📦 Installation

### Prerequisites
- Node.js (v18+)
- MongoDB
- OpenAI or Gemini API key

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your credentials
npm run dev