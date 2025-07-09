import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './Home';
import Play from './Play'; // Updated to match PascalCase
import Results from './Results';

function App() {
  const [quizStarted, setQuizStarted] = useState(false);

  return (
    <Router>
      <div className="min-h-screen bg-gray-100 font-inter">
        <Routes>
          <Route path="/" element={<Home setQuizStarted={setQuizStarted} />} />
          <Route path="/play" element={<Play setQuizStarted={setQuizStarted} quizStarted={quizStarted} />} />
          <Route path="/results" element={<Results />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
