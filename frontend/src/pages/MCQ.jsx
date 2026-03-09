import React, { useState } from "react";
import "../App.css";

function MCQs({ questions, setPage }) {
  const [userAnswers, setUserAnswers] = useState({});
  const [results, setResults] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const selectAnswer = (qid, selected) => {
    if (submitted) return; // Can't change answers after submission
    setUserAnswers((prev) => ({
      ...prev,
      [qid]: selected,
    }));
  };

  const handleSubmit = async () => {
    const answers = Object.entries(userAnswers).map(([id, selected]) => ({
      id: parseInt(id),
      selected,
    }));

    try {
      const response = await fetch("http://localhost:5000/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });

      const data = await response.json();
      setResults(data);
      setSubmitted(true);
    } catch (error) {
      console.error("Error submitting answers:", error);
      alert("Failed to evaluate answers");
    }
  };

  const score = results?.score || 0;

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
          {Object.keys(userAnswers).length} of {questions.length} answered
          {results && ` · ${results.score}/${results.total} correct`}
        </p>
      </div>

      {questions.map((q, idx) => {
        const result = results?.results?.find((r) => r.id === q.id);
        const userSelected = userAnswers[q.id];
        const isAnswered = userSelected !== undefined;

        return (
          <div key={q.id} className="question-card">
            <div className="question-number">Question {idx + 1}</div>
            <div className="question-text">{q.question}</div>

            <div className="options-grid">
              {Object.entries(q.options).map(([key, value]) => (
                <button
                  key={key}
                  className={`option-btn ${
                    submitted
                      ? key === result?.correct_answer
                        ? "correct-answer"
                        : key === userSelected && result?.is_correct === false
                        ? "wrong-answer"
                        : ""
                      : userSelected === key
                      ? "selected"
                      : ""
                  }`}
                  onClick={() => selectAnswer(q.id, key)}
                  disabled={submitted}
                >
                  <span className="option-key">{key}</span>
                  {value}
                </button>
              ))}
            </div>

            {submitted && result && (
              <div className="result-feedback">
                {result.is_correct ? (
                  <span className="result-badge correct">✅ Correct</span>
                ) : (
                  <div className="result-feedback-wrong">
                    <span className="result-badge wrong">❌ Wrong</span>
                    <p className="correct-answer-text">
                      Correct answer: <strong>{result.correct_answer}</strong>
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      {!submitted ? (
        <button
          className="submit-btn"
          onClick={handleSubmit}
          disabled={Object.keys(userAnswers).length === 0}
        >
          Submit Answers
        </button>
      ) : (
        <div className="final-score">
          <h3>Final Score: {results.score}/{results.total}</h3>
          <button className="back-btn" onClick={() => setPage("upload")}>
            ↑ Upload Another PDF
          </button>
        </div>
      )}
    </div>
  );
}

export default MCQs;
