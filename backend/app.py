from flask import Flask, request, jsonify
import fitz  # PyMuPDF
from openai import OpenAI
from flask_cors import CORS
import json
import re
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

# Allow your frontend to communicate with this backend
CORS(app, origins=["http://localhost:5173"])

# Initialize Hugging Face / OpenAI Client
client = OpenAI(
    base_url="https://router.huggingface.co/v1",
    api_key=os.getenv("HF_API_KEY")
)

# Store generated questions temporarily (In-memory storage)
generated_questions = []

@app.route("/")
def home():
    return "Backend running"

@app.route("/generate-questions", methods=["POST"])
def generate_questions():
    global generated_questions

    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]
    
    try:
        # 1. Extract Text from PDF
        doc = fitz.open(stream=file.read(), filetype="pdf")
        text = ""
        for page in doc:
            text += page.get_text()
        
        # Clean non-printable characters and limit length
        text = "".join(char for char in text if char.isprintable() or char in "\n\r\t")
        text = text[:4500] 

        if not text.strip():
            return jsonify({"error": "PDF contains no readable text"}), 400

    except Exception as e:
        return jsonify({"error": f"Failed to process PDF: {str(e)}"}), 500

    # 2. Prepare Prompt (Optimized with variety)
    prompt = f"""You are an expert educator creating diverse, high-quality multiple choice questions.

TASK: Generate exactly 10 unique MCQ questions from the provided text.

REQUIREMENTS:
- Vary difficulty levels: mix easy, medium, and hard questions
- Questions must test comprehension, analysis, and recall
- All information in questions and answers must come from the TEXT
- Options should be plausible but clearly distinguishable
- No trick questions - one answer should be definitively correct
- Vary question types (definitions, concepts, comparisons, applications)

OUTPUT FORMAT (strict JSON, no markdown, no extra text):
{{
 "questions":[
  {{
   "id":1,
   "question":"Clear, specific question text here?",
   "options":{{"A":"Option A","B":"Option B","C":"Option C","D":"Option D"}},
   "answer":"A"
  }},
  {{
   "id":2,
   "question":"Different question from the text?",
   "options":{{"A":"Option A","B":"Option B","C":"Option C","D":"Option D"}},
   "answer":"B"
  }}
 ]
}}

TEXT TO ANALYZE:
{text}

Generate the JSON response now:"""

    # 3. Call AI Model
    try:
        response = client.chat.completions.create(
            model="meta-llama/Meta-Llama-3-8B-Instruct",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=1500,
            temperature=0.8,  # Increased for more variety and randomness
            top_p=0.9  # Added for better sampling diversity
        )

        result = response.choices[0].message.content.strip()

        # 4. Robust JSON Parsing
        # Find the actual start of the JSON object
        start_idx = result.find('{')
        if start_idx == -1:
            raise ValueError("No JSON object found in response")
        
        json_payload = result[start_idx:]

        # Use raw_decode to handle "Extra Data" at the end of the string
        decoder = json.JSONDecoder()
        parsed, _ = decoder.raw_decode(json_payload)

        generated_questions = parsed.get("questions", [])
        return jsonify(parsed)

    except (json.JSONDecodeError, ValueError) as e:
        return jsonify({
            "error": "AI returned invalid JSON structure",
            "details": str(e),
            "raw_output_detected": result[:200] + "..."
        }), 500
    except Exception as e:
        return jsonify({"error": f"AI Request failed: {str(e)}"}), 500


@app.route("/evaluate", methods=["POST"])
def evaluate():
    global generated_questions

    if not generated_questions:
        return jsonify({"error": "No questions session active. Please generate questions first."}), 400

    data = request.json
    user_answers = data.get("answers", [])

    score = 0
    results = []

    # Map for quick lookup
    questions_map = {q["id"]: q["answer"] for q in generated_questions}

    for user in user_answers:
        qid = user.get("id")
        selected = user.get("selected")
        correct_answer = questions_map.get(qid)

        is_correct = (selected == correct_answer)
        if is_correct:
            score += 1

        results.append({
            "id": qid,
            "status": "correct" if is_correct else "wrong",
            "your_answer": selected,
            "correct_answer": correct_answer,
            "is_correct": is_correct
        })

    return jsonify({
        "score": score,
        "total": len(generated_questions),
        "results": results
    })


if __name__ == "__main__":
    # Running on 5000 by default
    app.run(debug=True, port=5000)