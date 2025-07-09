import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ref, set, getDatabase } from 'firebase/database';
import { db } from './firebase';

const questionsData = {
  "PHYSICS": [
    {
      "questionNumber": "Question 1",
      "image": "https://static.pw.live/5b09189f7285894d9130ccd0/02a847d7-b87c-4acb-b200-f0000337fde6.png",
      "correctOption": "C"
    },
    {
      "questionNumber": "Question 2",
      "image": "https://static.pw.live/5b09189f7285894d9130ccd0/997c16b0-9743-437b-8d94-f1731d3d03fe.png",
      "correctOption": "D"
    },
    {
      "questionNumber": "Question 3",
      "image": "https://static.pw.live/5b09189f7285894d9130ccd0/1303df44-4d76-43fd-bf65-85fa69cbbad5.png",
      "correctOption": "B"
    },
    {
      "questionNumber": "Question 4",
      "image": "https://static.pw.live/5b09189f7285894d9130ccd0/fa60933a-e038-43bf-996f-c767937675ae.png",
      "correctOption": "B"
    },
    {
      "questionNumber": "Question 5",
      "image": "https://static.pw.live/5b09189f7285894d9130ccd0/43032f03-6829-49d0-a07f-12e97847b21b.png",
      "correctOption": "B"
    },
    {
      "questionNumber": "Question 6",
      "image": "https://static.pw.live/5b09189f7285894d9130ccd0/352d6768-193e-4fa9-9fb0-2efb1a856330.png",
      "correctOption": "B"
    },
    {
      "questionNumber": "Question 7",
      "image": "https://static.pw.live/5b09189f7285894d9130ccd0/9af42518-e561-4aaa-beea-9dc55b7d1603.png",
      "correctOption": "A"
    },
    {
      "questionNumber": "Question 8",
      "image": "https://static.pw.live/5b09189f7285894d9130ccd0/f99e55ba-963d-42c2-985d-d3ee1a5067f0.png",
      "correctOption": "B"
    },
    {
      "questionNumber": "Question 9",
      "image": "https://static.pw.live/5b09189f7285894d9130ccd0/58a9e5af-b15a-437f-888e-63cf8a6d72f8.png",
      "correctOption": "C"
    }
  ],
  "CHEMISTRY": [
    {
      "questionNumber": "Question 1",
      "image": "https://static.pw.live/5b09189f7285894d9130ccd0/ee9f972c-2ebe-4b77-b591-95fda15e9030.png",
      "correctOption": "C"
    }
  ]
};

function Play({ setQuizStarted }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(3 * 3600); // 3 hours in seconds
  const navigate = useNavigate();

  const allQuestions = [
    ...questionsData.PHYSICS.map(q => ({ ...q, subject: 'PHYSICS' })),
    ...questionsData.CHEMISTRY.map(q => ({ ...q, subject: 'CHEMISTRY' })),
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleOptionSelect = (option) => {
    setSelectedOption(option);
    setAnswers({ ...answers, [allQuestions[currentQuestion].questionNumber]: option });
  };

  const handleSaveAndNext = () => {
    if (currentQuestion < allQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedOption(null);
    }
  };

  const handleSkip = () => {
    setAnswers({ ...answers, [allQuestions[currentQuestion].questionNumber]: 'Skipped' });
    if (currentQuestion < allQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedOption(null);
    }
  };

  const handleSubmit = async () => {
    const dbRef = ref(getDatabase(db), 'quiz_results/' + Date.now());
    await set(dbRef, { answers, timestamp: new Date().toISOString() });
    setQuizStarted(false);
    navigate('/results');
  };

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <div id="timer" className="text-xl font-bold text-center mb-4 text-gray-800">
        {formatTime(timeLeft)}
      </div>
      <div className="question-container bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="header-controls flex justify-end gap-3 mb-4">
          <button className="flex items-center px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg shadow-sm text-blue-600 font-medium hover:bg-gray-200 transition">
            <i className="fas fa-th mr-2"></i>Show Index
          </button>
          <span className="flex items-center justify-center w-10 h-10 bg-gray-100 border border-gray-300 rounded-lg shadow-sm text-gray-500 cursor-pointer hover:bg-gray-200 transition">
            <i className="fas fa-flag"></i>
          </span>
        </div>
        <div className="question-info-bar flex items-center gap-4 bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-lg shadow-sm p-3 mb-6 overflow-x-auto">
          <span className="bg-indigo-100 text-indigo-900 font-semibold px-4 py-2 rounded-lg min-w-[120px] text-center">
            {allQuestions[currentQuestion].questionNumber}
          </span>
          <span className="bg-gray-100 text-gray-700 font-semibold px-4 py-2 rounded-lg min-w-[140px] text-center">
            {allQuestions[currentQuestion].subject}
          </span>
          <div className="flex gap-4">
            <span className="bg-green-100 text-green-800 font-semibold px-3 py-1 rounded-md">+4</span>
            <span className="bg-red-100 text-red-800 font-semibold px-3 py-1 rounded-md">-1</span>
          </div>
          <span className="bg-blue-100 text-blue-800 font-semibold px-4 py-2 rounded-lg min-w-[100px] text-center">MCQ</span>
        </div>
        {allQuestions[currentQuestion].image && (
          <img
            src={allQuestions[currentQuestion].image}
            alt="Question"
            className="w-full h-auto rounded-lg shadow-md mb-6 mx-auto"
            style={{ maxWidth: '100%', maxHeight: '300px', objectFit: 'contain' }}
          />
        )}
        <div className="options space-y-3">
          {['A', 'B', 'C', 'D'].map(option => (
            <div key={option} className="option-container">
              <label
                className={`block px-4 py-3 bg-gray-100 border border-gray-200 rounded-lg cursor-pointer text-base hover:bg-gray-200 transition ${
                  selectedOption === option ? 'bg-blue-100 border-blue-300' : ''
                }`}
                onClick={() => handleOptionSelect(option)}
              >
                {option}
              </label>
            </div>
          ))}
        </div>
        <div className="button-container flex flex-wrap justify-center gap-3 mt-6">
          <button
            onClick={handleSaveAndNext}
            className="px-6 py-3 bg-green-500 text-white rounded-lg shadow-md hover:bg-green-600 transition"
            disabled={currentQuestion === allQuestions.length - 1}
          >
            Save & Next
          </button>
          <button
            onClick={handleSkip}
            className="px-6 py-3 bg-yellow-500 text-white rounded-lg shadow-md hover:bg-yellow-600 transition"
          >
            Skip
          </button>
          {currentQuestion === allQuestions.length - 1 && (
            <button
              onClick={handleSubmit}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transition"
            >
              Submit Test
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default Play;
