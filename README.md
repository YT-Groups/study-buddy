# 📚 StudyBuddy – Smart Flashcard Generator

**StudyBuddy** is an AI-powered study assistant that helps students turn their lecture notes and study materials into interactive flashcards. Upload PDFs, Word docs, or text files, and StudyBuddy automatically generates concise question–answer flashcards using a local Large Language Model (LLM).  

The flashcards are stored in decks, which you can study using a spaced repetition system (SRS) to maximize retention.

---

## 🚀 Features
- 📄 Upload lecture files (**PDF, DOCX, TXT**)  
- 🤖 AI-powered **flashcard generation** using a local LLM (Mistral via Ollama)  
- 🧠 Built-in **spaced repetition algorithm** for effective studying  
- 📂 Organize flashcards into decks by subject or topic  
- 🌐 Modern web app interface with drag & drop file uploads  
- 🔒 Runs **fully offline** (no external API costs)  

---

## 🛠️ Tech Stack
- **Frontend**: React + Vite + TypeScript + TailwindCSS  
- **Backend**: FastAPI (Python)  
- **AI/LLM**: Mistral 7B served locally via **Ollama**  
- **PDF/Docx Parsing**: pdf.js, Mammoth.js  
- **Flashcard Logic**: Custom spaced repetition system  
- **State Management**: React Context API  

---

## ⚡ Quick Start

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/your-username/studybuddy.git
cd studybuddy
```

### 2️⃣ Start the Backend (FastAPI)
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

### 3️⃣ Start Ollama with Mistral
Make sure [Ollama](https://ollama.ai/) is installed and run:
```bash
ollama run mistral
```

### 4️⃣ Start the Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
```

Now open [http://localhost:8080](http://localhost:8080) in your browser 🎉  

---

## 🔮 Future Improvements
- 📱 **Mobile App Integration** (React Native / Expo) for on-the-go studying  
- ☁️ **Cloud sync** for accessing decks across multiple devices  
- 🗣️ **Voice-based flashcard review** (text-to-speech & speech-to-text)  
- 📊 **Analytics dashboard** to track study progress and mastery levels  
- 🤝 **Collaboration features** – share decks with classmates or study groups  
- 🧑‍🏫 **Educator tools** – allow teachers to create & distribute decks for students  

---

## 📌 Why StudyBuddy?
Students often have lots of material but limited time. StudyBuddy bridges the gap by automatically distilling raw lecture notes into flashcards, making revision more active and efficient.
