import React, { useState } from "react";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Upload from "./pages/Upload";
import MCQs from "./pages/MCQ";

function App() {

  const [page, setPage] = useState("home");
  const [questions, setQuestions] = useState([]);

  return (
    <div>

      <Navbar setPage={setPage} page={page} />

      {page === "home" && <Home setPage={setPage} />}
      {page === "upload" && <Upload setQuestions={setQuestions} setPage={setPage} />}
      {page === "mcq" && <MCQs questions={questions} setPage={setPage} />}

    </div>
  );
}

export default App;