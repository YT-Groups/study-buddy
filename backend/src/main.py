from fastapi import FastAPI
from pydantic import BaseModel
from typing import List
from openai import OpenAI
import instructor
import re
from fastapi.middleware.cors import CORSMiddleware

# ✅ Correct: Only initialize FastAPI once
app = FastAPI()

# ✅ Add CORS middleware before defining routes
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080"],  # Use ["*"] for dev if needed
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Now wrap the client AFTER middleware setup
client = instructor.from_openai(OpenAI(base_url="http://localhost:11434/v1", api_key="ollama"))

class Flashcard(BaseModel):
    front: str
    back: str

class FlashcardList(BaseModel):
    items: List[Flashcard]

class FlashcardRequest(BaseModel):
    text: str
    topic: str = None  # Optional for auto-inferred topics

@app.post("/generate-flashcards", response_model=FlashcardList)
def generate_flashcards(req: FlashcardRequest):
    def chunk_text_by_headers(text):
        pattern = re.compile(r"(?:^|\n)([A-Z][A-Z\s\-:0-9]{5,})\n")
        matches = list(pattern.finditer(text))

        chunks = []
        for i, match in enumerate(matches):
            start = match.end()
            end = matches[i + 1].start() if i + 1 < len(matches) else len(text)
            topic = match.group(1).strip()
            chunk_content = text[start:end].strip()
            if chunk_content:
                chunks.append((topic, chunk_content))

        if not chunks:
            words = text.split()
            chunks = [(req.topic or "General", " ".join(words[i:i + 800])) for i in range(0, len(words), 800)]

        return chunks

    chunks = chunk_text_by_headers(req.text)
    all_flashcards = []

    for topic, chunk in chunks:
        prompt = f"Topic: {topic}\n\nContent:\n{chunk}"
        try:
            response = client.chat.completions.create(
                model="mistral",
                response_model=FlashcardList,
                messages=[
                    {
                        "role": "system",
                        "content": "You are an academic flashcard generator. Generate concise question-answer flashcards from the following lecture content. Each flashcard should be based on one concept."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ]
            )
            all_flashcards.extend(response.items)
        except Exception as e:
            print(f"Error generating flashcards for topic '{topic}': {e}")
            continue

    return FlashcardList(items=all_flashcards)
