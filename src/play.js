import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ref, set, getDatabase } from 'firebase/database';
import { db } from './firebase';
import html2canvas from 'html2canvas';

function Play({ setQuizStarted, quizStarted }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [answers, setAnswers] = useState({});
  const [questionsData, setQuestionsData] = useState(null);
  const [questionStatuses, setQuestionStatuses] = useState([]);
  const [timeLeft, setTimeLeft] = useState(3 * 3600); // 3 hours
  const [showIndex, setShowIndex] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [reportText, setReportText] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  // Get testid from URL
  const queryParams = new URLSearchParams(location.search);
  const testid = queryParams.get('testid');

  // Load questions from local JSON
  useEffect(() => {
    if (testid && quizStarted) {
      import(`./data/${testid}.json`)
        .then(data => {
          setQuestionsData(data.default);
          setQuestionStatuses(
            Object.keys(data.default).flatMap(subject =>
              data.default[subject].map(q => ({
                questionNumber: q.questionNumber,
                status: 'not-visited'
              }))
            )
          );
        })
        .catch(error => {
          console.error('Error loading questions:', error);
          alert('Failed to load questions. Please try again.');
        });
    }
  }, [testid, quizStarted]);

  // Prevent page refresh
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = 'Are you sure you want to leave? Your progress will be lost.';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Update question status to visited (blue) when viewing
  useEffect(() => {
    if (questionStatuses.length > 0) {
      setQuestionStatuses(prev =>
        prev.map((q, index) =>
          index === currentQuestion && q.status === 'not-visited'
            ? { ...q, status: 'visited' }
            : q
        )
      );
    }
  }, [currentQuestion]);

  if (!questionsData || !quizStarted) {
    return <div className="text-center p-4">Loading...</div>;
  }

  const allQuestions = Object.keys(questionsData).flatMap(subject =>
    questionsData[subject].map(q => ({ ...q, subject }))
  );

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleOptionSelect = (option) => {
    setSelectedOption(option);
    setAnswers({ ...answers, [allQuestions[currentQuestion].questionNumber]: option });
    setQuestionStatuses(prev =>
      prev.map((q, index) =>
        index === currentQuestion ? { ...q, status: 'answered' } : q
      )
    );
  };

  const handleSaveAndNext = () => {
    if (!selectedOption) {
      setQuestionStatuses(prev =>
        prev.map((q, index) =>
          index === currentQuestion ? { ...q, status: 'unanswered' } : q
        )
      );
    }
    if (currentQuestion < allQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedOption(null);
    }
  };

  const handleSkip = () => {
    setAnswers({ ...answers, [allQuestions[currentQuestion].questionNumber]: 'Skipped' });
    setQuestionStatuses(prev =>
      prev.map((q, index) =>
        index === currentQuestion ? { ...q, status: 'skipped' } : q
      )
    );
    if (currentQuestion < allQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedOption(null);
    }
  };

  const handleSubmit = async () => {
    try {
      const dbRef = ref(getDatabase(db), `quiz_results/${testid}/${Date.now()}`);
      await set(dbRef, { answers, timestamp: new Date().toISOString() });
      setQuizStarted(false);
      navigate('/results');
    } catch (error) {
      console.error('Error submitting quiz:', error);
      alert('Failed to submit quiz. Please try again.');
    }
  };

  const handleReportSubmit = async () => {
    if (!reportText.trim()) {
      alert('Please enter a problem description.');
      return;
    }
    const question = allQuestions[currentQuestion];
    let screenshot = null;
    try {
      const canvas = await html2canvas(document.querySelector('.question-container'));
      screenshot = canvas.toDataURL('image/png');
    } catch (error) {
      console.error('Failed to capture screenshot:', error);
    }
    try {
      const reportRef = ref(getDatabase(db), `reports/${testid}/${Date.now()}`);
      await set(reportRef, {
        questionNumber: question.questionNumber,
        subject: question.subject,
        image: question.image,
        correctOption: question.correctOption,
        reportText,
        screenshot,
        timestamp: new Date().toISOString()
      });
      setReportText('');
      setShowReport(false);
      alert('Report submitted successfully.');
    } catch (error) {
      console.error('Error submitting report:', error);
      alert('Failed to submit report. Please try again.');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'not-visited': return 'bg-white';
      case 'visited': return 'bg-blue-500';
      case 'answered': return 'bg-green-500';
      case 'skipped': return 'bg-yellow-500';
      case 'unanswered': return 'bg-red-500';
      default: return 'bg-white';
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-3xl relative">
      <div id="timer" className="text-xl font-bold text-center mb-4 text-gray-800">
        {formatTime(timeLeft)}
      </div>
      <div className="header-controls flex justify-end gap-3 mb-4">
        <button
          onClick={() => setShowIndex(!showIndex)}
          className="flex items-center px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg shadow-sm text-blue-600 font-medium hover:bg-gray-200 transition"
          id="question-palette-button"
        >
          <i className="fas fa-th mr-2"></i>Show Index
        </button>
        <button
          onClick={() => setShowReport(true)}
          className="flex items-center justify-center w-10 h-10 bg-gray-100 border border-gray-300 rounded-lg shadow-sm text-gray-500 hover:bg-gray-200 transition"
        >
          <i className="fas fa-flag"></i>
        </button>
      </div>
      {showIndex && (
        <div className="absolute top-16 right-4 bg-white border border-gray-300 rounded-lg shadow-lg p-4 z-10">
          <div className="grid grid-cols-5 gap-2">
            {questionStatuses.map((q, index) => (
              <button
                key={q.questionNumber}
                onClick={() => {
                  setCurrentQuestion(index);
                  setShowIndex(false);
                }}
                className={`w-8 h-8 rounded-full ${getStatusColor(q.status)} text-white font-semibold flex items-center justify-center`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>
      )}
      {showReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Report Question</h3>
            <textarea
              value={reportText}
              onChange={(e) => setReportText(e.target.value)}
              placeholder="Describe the issue with this question"
              className="w-full p-2 border border-gray-300 rounded-lg mb-4"
              rows="4"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowReport(false)}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleReportSubmit}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Submit Report
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="question-container bg-white rounded-xl shadow-md p-6 mb-6" id="question-container">
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
                  selectedOption === option ? 'bg-green-100 border-green-300' : ''
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
            id="save-next-btn"
          >
            Save & Next
          </button>
          <button
            onClick={handleSkip}
            className="px-6 py-3 bg-yellow-500 text-white rounded-lg shadow-md hover:bg-yellow-600 transition"
            id="skip-btn"
          >
            Skip
          </button>
          {currentQuestion === allQuestions.length - 1 && (
            <button
              onClick={handleSubmit}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transition"
              id="submit-btn"
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
