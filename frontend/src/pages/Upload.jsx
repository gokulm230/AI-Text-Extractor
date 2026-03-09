import React, { useState, useRef } from "react";
import "../App.css";

function Upload({ setQuestions, setPage }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("http://127.0.0.1:5000/generate-questions", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      // Check if response contains an error
      if (data.error) {
        setError(data.error);
        setLoading(false);
        return;
      }

      setQuestions(data.questions);
      setPage("mcq");
    } catch (err) {
      console.error("Upload failed:", err);
      setError("Failed to connect to server. Please make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="upload-container">
      <div className="page-header">
        <h2>Upload PDF</h2>
        <p>Select a PDF and we'll generate 10 MCQs from it using AI.</p>
      </div>

      <div
        className={`upload-card ${file ? "has-file" : ""}`}
        onClick={() => inputRef.current?.click()}
      >
        <span className="upload-icon">📂</span>
        <div className="upload-label">
          {file ? "File ready to process" : "Drop your PDF here"}
        </div>
        <div className="upload-sublabel">
          {file ? file.name : "or click to browse files"}
        </div>

        <input
          ref={inputRef}
          type="file"
          accept=".pdf"
          className="upload-file-input"
          onChange={(e) => setFile(e.target.files[0])}
          onClick={(e) => e.stopPropagation()}
        />

        {!file && (
          <label className="upload-browse-btn" onClick={(e) => e.stopPropagation()}>
            Browse files
          </label>
        )}

        {file && (
          <div className="file-selected" onClick={(e) => e.stopPropagation()}>
            ✅ {file.name}
          </div>
        )}
      </div>

      {loading ? (
        <div className="loading-overlay">
          <div className="spinner" />
          <p>Generating questions…</p>
        </div>
      ) : error ? (
        <div className="error-container">
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            <div className="error-content">
              <h3>Error Generating Questions</h3>
              <p>{error}</p>
              {error.includes("invalid JSON") && (
                <p className="error-hint">
                  💡 The AI model returned invalid data. Try uploading a different PDF or try again.
                </p>
              )}
            </div>
          </div>
          <button
            className="error-retry-btn"
            onClick={() => {
              setError(null);
              setFile(null);
              inputRef.current?.click();
            }}
          >
            Try Another File
          </button>
        </div>
      ) : (
        <button
          className="generate-btn"
          onClick={handleUpload}
          disabled={!file || loading}
        >
          ✨ Generate Questions
        </button>
      )}
    </div>
  );
}

export default Upload;
