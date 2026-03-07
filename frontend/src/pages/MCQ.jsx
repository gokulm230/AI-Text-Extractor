import React, { useState } from "react";
import "../App.css";

function MCQs({ questions, setPage }) {
  const [results, setResults] = useState({});

  const checkAnswer = (qid, selected, correct) => {
    if (results[qid]) return; // already answered
    setResults((prev) => ({
      ...prev,
      [qid]: selected === correct ? "correct" : "wrong",
    }));
  };

  const score = Object.values(results).filter((r) => r === "correct").length;

  if (!questions || questions.length === 0) {
    return (
      <div className="mcq-container">
        <div className="empty-state">
          <p>No questions yet. Upload a PDF to generate MCQs.</p>
          <button className="empty-state-btn" onClick={() => setPage("upload")}>
            ↑ Upload PDF
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mcq-container">
      <div className="mcq-header">
        <h2>MCQ Questions</h2>
        <p>
          {Object.keys(results).length} of {questions.length} answered
          {Object.keys(results).length > 0 && ` · ${score} correct`}
        </p>
      </div>

      {questions.map((q, idx) => (
        <div key={q.id} className="question-card">
          <div className="question-number">Question {idx + 1}</div>
          <div className="question-text">{q.question}</div>

          <div className="options-grid">
            {Object.entries(q.options).map(([key, value]) => (
              <button
                key={key}
                className="option-btn"
                onClick={() => checkAnswer(q.id, key, q.answer)}
              >
                <span className="option-key">{key}</span>
                {value}
              </button>
            ))}
          </div>

          {results[q.id] && (
            <span className={`result-badge ${results[q.id]}`}>
              {results[q.id] === "correct" ? "✅ Correct" : "❌ Wrong"}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

export default MCQs;
