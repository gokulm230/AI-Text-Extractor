import React, { useState, useRef } from "react";
import "../App.css";

function Upload({ setQuestions, setPage }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("http://127.0.0.1:5000/generate-questions", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      setQuestions(data.questions);
      setPage("mcq");
    } catch (err) {
      console.error("Upload failed:", err);
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
