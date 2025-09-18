from fastapi import FastAPI
from pydantic import BaseModel
from typing import List
from fastapi.middleware.cors import CORSMiddleware
import requests
import re
import json

# Initialize FastAPI
app = FastAPI()

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Flashcard(BaseModel):
    front: str
    back: str

class FlashcardList(BaseModel):
    items: List[Flashcard]

class FlashcardRequest(BaseModel):
    text: str
    topic: str = None

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
            chunks = [(req.topic or "General", " ".join(words[i:i + 500])) for i in range(0, len(words), 500)]

        return chunks

    chunks = chunk_text_by_headers(req.text)
    all_flashcards = []

    for topic, chunk in chunks:
        prompt = f"""
You are an academic assistant. Generate 3-5 flashcards from the following topic.
Each flashcard should be a JSON object like this:
{{"front": "Question?", "back": "Answer."}}

Only output a JSON array.

Topic: {topic}

Content:
{chunk}
"""

        try:
            response = requests.post(
                "http://localhost:11434/api/generate",
                json={"model": "mistral", "prompt": prompt, "stream": False}
            )
            response.raise_for_status()
            result = response.json()
            text_output = result.get("response", "").strip()

            flashcard_data = json.loads(text_output)
            for card in flashcard_data:
                if 'front' in card and 'back' in card:
                    all_flashcards.append(Flashcard(front=card['front'], back=card['back']))
        except Exception as e:
            print(f"Failed to parse flashcards for topic '{topic}': {e}")
            continue

    return FlashcardList(items=all_flashcards)
