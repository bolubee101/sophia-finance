# AI Finance Assistant (Session-Based, TypeScript)

A smart assistant that analyzes bank statements and returns financial insights. This version:
- Uses GPT to handle analysis
- Tracks session per browser (no login needed)
- Saves and displays session-based history

## 💻 Tech Stack

- Node.js + TypeScript + Express
- MongoDB (Mongoose)
- OpenAI GPT
- PDF Parsing (`pdf-parse`)
- Multer (file upload)
- Static frontend served from backend

## 🚀 Setup Instructions

1. **Clone the repo**
2. **Install dependencies**

```bash
npm install
```

3. **Create a `.env` file**:

```env
OPENAI_API_KEY=your_openai_key
MONGO_URI=mongodb://localhost:27017/ai-finance
```

4. **Build and run**:

```bash
npm run build
npm start
```

Or during development:

```bash
npm run dev
```

5. **Access the app**:  
Visit `http://localhost:3000` in your browser.

## 📁 Features

- Secure file upload
- GPT-based analysis
- Browser-specific session via `localStorage`
- History saved per session in MongoDB
