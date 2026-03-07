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

    # 2. Prepare Prompt (Strict JSON instructions)
    prompt = f"""
Return ONLY a valid JSON object. No preamble, no markdown, no extra braces.
Generate 10 MCQ questions from the provided text.

Schema:
{{
 "questions":[
  {{
   "id":1,
   "question":"...",
   "options":{{"A":"...","B":"...","C":"...","D":"..."}},
   "answer":"A"
  }}
 ]
}}

TEXT:
{text}
"""

    # 3. Call AI Model
    try:
        response = client.chat.completions.create(
            model="meta-llama/Meta-Llama-3-8B-Instruct",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=1500, # Increased to prevent truncation
            temperature=0.3  # Lower temperature for more stable JSON
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
            "correct": is_correct,
            "correct_answer": correct_answer
        })

    return jsonify({
        "score": score,
        "total": len(generated_questions),
        "results": results
    })


if __name__ == "__main__":
    # Running on 5000 by default
    app.run(debug=True, port=5000)