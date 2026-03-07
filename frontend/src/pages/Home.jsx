import React from "react";
import "../App.css";

const features = [
  {
    icon: "📄",
    bg: "#ede9fe",
    title: "PDF Upload",
    desc: "Upload any PDF document and let the AI extract relevant content automatically.",
  },
  {
    icon: "🤖",
    bg: "#dbeafe",
    title: "AI-Powered",
    desc: "Uses LLaMA 3 via Hugging Face to generate high-quality questions from text.",
  },
  {
    icon: "✅",
    bg: "#dcfce7",
    title: "Instant Feedback",
    desc: "Answer questions and get immediate correct / wrong feedback per option.",
  },
];

const pipeline = [
  { label: "Upload PDF", desc: "Select a PDF file from your device" },
  { label: "Text Extraction", desc: "PyMuPDF extracts raw text from the document" },
  { label: "AI Processing", desc: "LLaMA 3 reads the text and crafts 10 MCQs" },
  { label: "Answer & Review", desc: "Pick answers and see your score instantly" },
];

function Home({ setPage }) {
  return (
    <div className="container">
      {/* Hero */}
      <div className="hero">
        <div className="hero-badge">✦ Powered by LLaMA 3</div>

        <h1 className="hero-title">
          Turn any PDF into<br />
          <span>smart MCQs</span>
        </h1>

        <p className="hero-desc">
          Upload a document, and our AI will generate 10 multiple-choice questions
          so you can study, test, or share knowledge effortlessly.
        </p>

        <button className="hero-cta" onClick={() => setPage("upload")}>
          Get Started →
        </button>
      </div>

      {/* Feature cards */}
      <div className="features-grid">
        {features.map((f) => (
          <div className="feature-card" key={f.title}>
            <div className="feature-icon" style={{ background: f.bg }}>
              {f.icon}
            </div>
            <div className="feature-title">{f.title}</div>
            <div className="feature-desc">{f.desc}</div>
          </div>
        ))}
      </div>

      {/* Pipeline */}
      <div className="pipeline-section">
        <div className="pipeline-title">⚡ How it works</div>
        <div className="pipeline-steps">
          {pipeline.map((step, i) => (
            <div className="pipeline-step" key={step.label}>
              <div className="pipeline-connector">
                <div className="pipeline-dot" />
                {i < pipeline.length - 1 && <div className="pipeline-line" />}
              </div>
              <div className="pipeline-content">
                <h4>{step.label}</h4>
                <p>{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Home;
