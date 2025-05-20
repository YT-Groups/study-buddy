import spacy
import random
from typing import List, Dict, Tuple, Any
import re
from collections import Counter
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

class GeneralQuizAlgorithm:
    """
    General Quiz Algorithm for extracting concepts and generating quiz questions
    from regular documents (PDF, DOCX, PPTX).
    """
    
    def __init__(self, nlp_model="en_core_web_md"):
        """
        Initialize the General Quiz Algorithm.
        
        Args:
            nlp_model: The spaCy model to use for NLP processing
        """
        self.nlp = spacy.load(nlp_model)
        self.question_types = ["definition", "true_false", "cloze", "multiple_choice"]
        self.similarity_threshold = 0.75  # Threshold for duplicate detection
        self.context_window_size = 3  # Number of sentences for context
        
    def preprocess_text(self, text: str) -> List[str]:
        """
        Preprocess the text by splitting into sentences and cleaning.
        
        Args:
            text: The raw text from the document
            
        Returns:
            A list of preprocessed sentences
        """
        # Replace multiple newlines with a single one
        text = re.sub(r'\n+', '\n', text)
        
        # Split text into sentences using spaCy
        doc = self.nlp(text)
        sentences = [sent.text.strip() for sent in doc.sents if len(sent.text.strip()) > 10]
        
        return sentences
    
    def extract_concepts(self, sentences: List[str]) -> List[Dict[str, Any]]:
        """
        Extract key concepts, entities, and relationships from sentences.
        
        Args:
            sentences: List of preprocessed sentences
            
        Returns:
            List of dictionaries containing concepts and their context
        """
        concepts = []
        
        for i, sentence in enumerate(sentences):
            doc = self.nlp(sentence)
            
            # Get context (sentences before and after)
            start_idx = max(0, i - self.context_window_size)
            end_idx = min(len(sentences), i + self.context_window_size + 1)
            context = " ".join(sentences[start_idx:end_idx])
            
            # Extract noun phrases
            noun_phrases = [chunk.text for chunk in doc.noun_chunks]
            
            # Extract named entities
            entities = [(ent.text, ent.label_) for ent in doc.ents]
            
            # Check for definition patterns like "X is a Y" or "X refers to Y"
            definition_matches = re.finditer(r'([A-Z][^.,:;]+)\s+(is|are|refers to|means|defines|represents|constitutes)\s+([^.,:;]+)', sentence)
            
            for match in definition_matches:
                term = match.group(1).strip()
                definition = match.group(3).strip()
                concepts.append({
                    'type': 'definition',
                    'term': term,
                    'definition': definition,
                    'sentence': sentence,
                    'context': context
                })
            
            # Extract key verbs and their subjects/objects
            for token in doc:
                if token.pos_ == "VERB" and token.dep_ == "ROOT":
                    subjects = [subj.text for subj in token.lefts if subj.dep_ in ("nsubj", "nsubjpass")]
                    objects = [obj.text for obj in token.rights if obj.dep_ in ("dobj", "pobj")]
                    
                    if subjects and objects:
                        concepts.append({
                            'type': 'relationship',
                            'verb': token.text,
                            'subjects': subjects,
                            'objects': objects,
                            'sentence': sentence,
                            'context': context
                        })
        
        return concepts
    
    def generate_questions(self, concepts: List[Dict[str, Any]], num_questions: int = 20) -> List[Dict[str, Any]]:
        """
        Generate quiz questions from extracted concepts.
        
        Args:
            concepts: List of extracted concepts
            num_questions: Maximum number of questions to generate
            
        Returns:
            List of generated questions
        """
        questions = []
        
        # First, generate a variety of questions from the concepts
        for concept in concepts:
            if concept['type'] == 'definition':
                questions.append(self._create_definition_question(concept))
                questions.append(self._create_cloze_question(concept))
                questions.append(self._create_true_false_question(concept))
                questions.append(self._create_multiple_choice_question(concept, concepts))
            
            elif concept['type'] == 'relationship':
                if len(concept['subjects']) > 0 and len(concept['objects']) > 0:
                    questions.append(self._create_relationship_question(concept))
                    
        # Apply quality scoring
        scored_questions = self._score_questions(questions)
        
        # Remove duplicates
        unique_questions = self._remove_duplicates(scored_questions)
        
        # Ensure question diversity
        diverse_questions = self._ensure_diversity(unique_questions)
        
        # Return the top N questions
        return diverse_questions[:num_questions]
    
    def _create_definition_question(self, concept: Dict[str, Any]) -> Dict[str, Any]:
        """Create a definition-based question."""
        term = concept['term']
        definition = concept['definition']
        
        return {
            'question_type': 'short_answer',
            'question': f"What is {term}?",
            'answer': definition,
            'context': concept['context'],
            'source_sentence': concept['sentence'],
            'difficulty': 'medium'  # Default difficulty
        }
    
    def _create_cloze_question(self, concept: Dict[str, Any]) -> Dict[str, Any]:
        """Create a fill-in-the-blank question."""
        term = concept['term']
        definition = concept['definition']
        
        cloze_text = concept['sentence'].replace(term, "________")
        
        return {
            'question_type': 'cloze',
            'question': f"Fill in the blank: {cloze_text}",
            'answer': term,
            'context': concept['context'],
            'source_sentence': concept['sentence'],
            'difficulty': 'easy'  # Cloze questions are often easier
        }
    
    def _create_true_false_question(self, concept: Dict[str, Any]) -> Dict[str, Any]:
        """Create a true/false question."""
        term = concept['term']
        definition = concept['definition']
        
        # 50% chance of creating a false statement
        if random.random() > 0.5:
            # True statement
            statement = f"{term} is {definition}."
            answer = True
        else:
            # Find another definition to create a false statement
            # (simplified - in practice, would need to ensure the statement is actually false)
            definition = f"not {definition}"
            statement = f"{term} is {definition}."
            answer = False
        
        return {
            'question_type': 'true_false',
            'question': f"True or False: {statement}",
            'answer': answer,
            'context': concept['context'],
            'source_sentence': concept['sentence'],
            'difficulty': 'easy'  # True/False questions are often easier
        }
    
    def _create_multiple_choice_question(self, concept: Dict[str, Any], all_concepts: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Create a multiple-choice question with distractors."""
        term = concept['term']
        correct_answer = concept['definition']
        
        # Generate distractors
        distractors = self._generate_distractors(concept, all_concepts)
        
        # Ensure we have at least 3 distractors
        while len(distractors) < 3:
            distractors.append(f"None of the above regarding {term}")
        
        # Limit to 3 distractors
        distractors = distractors[:3]
        
        # Create options including the correct answer
        options = distractors + [correct_answer]
        random.shuffle(options)
        
        return {
            'question_type': 'multiple_choice',
            'question': f"What is {term}?",
            'options': options,
            'answer': correct_answer,
            'context': concept['context'],
            'source_sentence': concept['sentence'],
            'difficulty': 'medium'  # Default difficulty
        }
    
    def _create_relationship_question(self, concept: Dict[str, Any]) -> Dict[str, Any]:
        """Create a question based on subject-verb-object relationship."""
        subject = concept['subjects'][0]
        verb = concept['verb']
        obj = concept['objects'][0]
        
        # Format depends on the verb
        if verb in ["is", "are", "was", "were"]:
            question = f"What {verb} {subject}?"
            answer = obj
        else:
            question = f"What does {subject} {verb}?"
            answer = obj
        
        return {
            'question_type': 'short_answer',
            'question': question,
            'answer': answer,
            'context': concept['context'],
            'source_sentence': concept['sentence'],
            'difficulty': 'medium'  # Default difficulty
        }
    
    def _generate_distractors(self, concept: Dict[str, Any], all_concepts: List[Dict[str, Any]]) -> List[str]:
        """Generate plausible but incorrect answers for MCQs."""
        correct_definition = concept['definition']
        distractors = []
        
        # Method 1: Use semantically similar definitions from other concepts
        definitions = [c['definition'] for c in all_concepts if c['type'] == 'definition' and c['definition'] != correct_definition]
        
        if definitions:
            # Calculate semantic similarity
            vectorizer = TfidfVectorizer()
            try:
                tfidf_matrix = vectorizer.fit_transform([correct_definition] + definitions)
                similarity_scores = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:])[0]
                
                # Get semantically similar but not identical definitions
                for i, score in enumerate(similarity_scores):
                    if 0.3 < score < 0.8:  # Similar but not too similar
                        distractors.append(definitions[i])
                        if len(distractors) >= 5:
                            break
            except:
                # Fallback if vectorization fails
                pass
        
        # Method 2: Use frequency analysis from the context
        if len(distractors) < 3:
            # Extract words from the context excluding stop words
            context_doc = self.nlp(concept['context'])
            context_words = [token.text for token in context_doc if not token.is_stop and token.is_alpha]
            
            # Find frequent words to create misleading definitions
            word_counter = Counter(context_words)
            common_words = [word for word, count in word_counter.most_common(10)]
            
            # Create plausible but incorrect definitions
            if common_words:
                for _ in range(min(3, 5 - len(distractors))):
                    fake_definition = f"a {random.choice(common_words)} that {random.choice(common_words)} the {random.choice(common_words)}"
                    if fake_definition != correct_definition:
                        distractors.append(fake_definition)
        
        return list(set(distractors))  # Remove duplicates
    
    def _score_questions(self, questions: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Score questions based on clarity and quality."""
        scored_questions = []
        
        for question in questions:
            score = 0
            
            # Length of answer (not too short, not too long)
            if 'answer' in question:
                answer_length = len(str(question['answer']).split())
                if 2 <= answer_length <= 15:
                    score += 2
                elif answer_length > 0:
                    score += 1
            
            # Question has context
            if question.get('context') and len(question['context']) > 50:
                score += 1
                
            # Question type variety (give bonus to less common question types)
            if question['question_type'] in ['multiple_choice', 'cloze']:
                score += 1
            
            # For MCQs, check if we have enough options
            if question['question_type'] == 'multiple_choice' and len(question.get('options', [])) >= 4:
                score += 1
            
            # Add the score to the question
            question['quality_score'] = score
            scored_questions.append(question)
            
        # Sort by score, descending
        return sorted(scored_questions, key=lambda q: q['quality_score'], reverse=True)
    
    def _remove_duplicates(self, questions: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Remove duplicate or very similar questions."""
        unique_questions = []
        question_texts = []
        
        for question in questions:
            q_text = question['question'].lower()
            
            # Check if this question is similar to any existing one
            is_duplicate = False
            for existing_q in question_texts:
                # Simple similarity using character-level comparison
                similarity = self._text_similarity(q_text, existing_q)
                if similarity > self.similarity_threshold:
                    is_duplicate = True
                    break
            
            if not is_duplicate:
                unique_questions.append(question)
                question_texts.append(q_text)
                
        return unique_questions
    
    def _text_similarity(self, text1: str, text2: str) -> float:
        """Calculate simple text similarity ratio."""
        # Count matching characters
        matches = sum(c1 == c2 for c1, c2 in zip(text1, text2))
        
        # Calculate similarity ratio
        total_length = max(len(text1), len(text2))
        if total_length > 0:
            return matches / total_length
        return 0
    
    def _ensure_diversity(self, questions: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Ensure diversity in question types and difficulty."""
        diverse_questions = []
        type_counts = {q_type: 0 for q_type in self.question_types}
        
        # First pass: add top scoring questions of each type
        for question in questions:
            q_type = question['question_type']
            if type_counts[q_type] < max(3, len(questions) // len(self.question_types)):
                diverse_questions.append(question)
                type_counts[q_type] += 1
        
        # Second pass: add remaining high-scoring questions
        remaining = [q for q in questions if q not in diverse_questions]
        diverse_questions.extend(sorted(remaining, key=lambda q: q['quality_score'], reverse=True))
        
        return diverse_questions

    def process_document(self, document_text: str, num_questions: int = 20) -> List[Dict[str, Any]]:
        """
        Process a document and generate quiz questions.
        
        Args:
            document_text: The raw text extracted from the document
            num_questions: Maximum number of questions to generate
            
        Returns:
            List of generated questions
        """
        # Preprocess the document text
        sentences = self.preprocess_text(document_text)
        
        # Extract concepts from the sentences
        concepts = self.extract_concepts(sentences)
        
        # Generate questions from the concepts
        questions = self.generate_questions(concepts, num_questions)
        
        return questions

# Example usage
if __name__ == "__main__":
    # Sample text for testing
    sample_text = """
    Machine learning is a subset of artificial intelligence focused on building systems that learn from data.
    Neural networks are computational models inspired by the human brain's structure and function.
    Deep learning is a subset of machine learning that uses neural networks with many layers.
    The perceptron is a type of artificial neuron that forms the basis of many neural network architectures.
    Supervised learning occurs when algorithms are trained on labeled data to make predictions or decisions.
    """
    
    # Create an instance of the algorithm
    quiz_algo = GeneralQuizAlgorithm()
    
    # Process the sample text and generate questions
    generated_questions = quiz_algo.process_document(sample_text, 10)
    
    # Print the generated questions
    for i, question in enumerate(generated_questions, 1):
        print(f"\nQuestion {i}:")
        print(f"Type: {question['question_type']}")
        print(f"Question: {question['question']}")
        
        if question['question_type'] == 'multiple_choice':
            print("Options:")
            for j, option in enumerate(question['options'], 1):
                print(f"  {j}. {option}")
                
        print(f"Answer: {question['answer']}")
        print(f"Quality Score: {question.get('quality_score', 'N/A')}")