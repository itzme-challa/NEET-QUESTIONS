import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Play from './play';
import Results from './results';

function App() {
  const [quizStarted, setQuizStarted] = useState(false);

  return (
    <Router>
      <div className="min-h-screen bg-gray-100 font-inter">
        <Routes>
          <Route
            path="/"
            element={
              quizStarted ? (
                <Play setQuizStarted={setQuizStarted} />
              ) : (
                <div className="flex items-center justify-center h-screen">
                  <button
                    onClick={() => setQuizStarted(true)}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition"
                    id="start-btn"
                  >
                    Start Quiz
                  </button>
                </div>
              )
            }
          />
          <Route path="/results" element={<Results />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
