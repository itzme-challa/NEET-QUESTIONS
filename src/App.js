import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './Home';
import Play from './play'; // Update to './Play' if renaming the file
import Results from './results';

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
