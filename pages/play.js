import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { getDatabase, ref, get, set } from 'firebase/database';
import { initializeApp } from 'firebase/app';
import Head from 'next/head';

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export default function Play() {
  const router = useRouter();
  const { testid } = router.query;
  const [quizData, setQuizData] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [flagged, setFlagged] = useState({});
  const [flagReason, setFlagReason] = useState('');
  const [timeLeft, setTimeLeft] = useState(3 * 60 * 60); // 3 hours
  const [showIndex, setShowIndex] = useState(false);
  const [score, setScore] = useState(null);
  const [userName, setUserName] = useState('');
  const [showNamePopup, setShowNamePopup] = useState(false);
  const [tempName, setTempName] = useState('');
  const [skippedQuestions, setSkippedQuestions] = useState(new Set());
  const [missedQuestions, setMissedQuestions] = useState(new Set());
  const [showSubmitPopup, setShowSubmitPopup] = useState(false);

  useEffect(() => {
    // Get cached name
    const name = localStorage.getItem('quizUserName') || '';
    setUserName(name);

    if (testid) {
      // Fetch quiz data
      const fetchQuiz = async () => {
        try {
          const response = await fetch(`/data/${testid}.json`);
          if (!response.ok) throw new Error('Quiz data not found');
          const data = await response.json();
          setQuizData(data);
        } catch (error) {
          console.error('Error fetching quiz:', error);
        }
      };
      fetchQuiz();
    }

    // Timer
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          setShowSubmitPopup(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [testid]);

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleAnswer = (questionId, option) => {
    setAnswers({ ...answers, [questionId]: option });
    setSkippedQuestions((prev) => {
      const newSet = new Set(prev);
      newSet.delete(questionId);
      return newSet;
    });
    setMissedQuestions((prev) => {
      const newSet = new Set(prev);
      newSet.delete(questionId);
      return newSet;
    });
  };

  const handleSkip = () => {
    setSkippedQuestions((prev) => new Set(prev).add(currentQuestion));
    setMissedQuestions((prev) => {
      const newSet = new Set(prev);
      newSet.delete(currentQuestion);
      return newSet;
    });
    if (currentQuestion < allQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handleNext = () => {
    if (!answers[currentQuestion]) {
      setMissedQuestions((prev) => new Set(prev).add(currentQuestion));
      setSkippedQuestions((prev) => {
        const newSet = new Set(prev);
        newSet.delete(currentQuestion);
        return newSet;
      });
    }
    if (currentQuestion < allQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const getDeviceInfo = () => {
    return {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      screen: `${window.screen.width}x${window.screen.height}`,
      language: navigator.language
    };
  };

  const handleFlag = async () => {
    if (flagReason.length > 50) {
      alert('Flag reason must be under 50 characters');
      return;
    }
    try {
      const question = allQuestions[currentQuestion];
      const timestamp = new Date().toISOString();
      await set(ref(database, `flags/${testid}/${currentQuestion}/${timestamp}`), {
        reason: flagReason,
        user: userName || 'Anonymous',
        questionDetails: {
          questionNumber: question.questionNumber,
          image: question.image || '',
          correctOption: question.correctOption
        },
        deviceDetails: getDeviceInfo()
      });
      setFlagged({ ...flagged, [currentQuestion]: true });
      setFlagReason('');
    } catch (error) {
      console.error('Error flagging question:', error);
    }
  };

  const handleSubmit = async () => {
    if (!userName.trim()) {
      setShowNamePopup(true);
      return;
    }

    let score = 0;
    const allQuestions = [
      ...(quizData.PHYSICS || []),
      ...(quizData.CHEMISTRY || []),
      ...(quizData.MATHS || [])
    ];

    allQuestions.forEach((q, index) => {
      if (answers[index] === q.correctOption) score += 4;
      else if (answers[index]) score -= 1;
    });

    setScore(score);

    try {
      await set(ref(database, `results/${testid}/${userName}`), {
        score,
        answers,
        name: userName,
        date: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error saving results:', error);
    }
  };

  const handleNamePopupSubmit = (e) => {
    e.preventDefault();
    if (tempName.trim()) {
      setUserName(tempName.trim());
      localStorage.setItem('quizUserName', tempName.trim());
      setShowNamePopup(false);
      setShowSubmitPopup(true);
    } else {
      alert('Please enter a valid name.');
    }
  };

  const handleConfirmSubmit = () => {
    setShowSubmitPopup(false);
    handleSubmit();
  };

  const allQuestions = quizData ? [
    ...(quizData.PHYSICS || []),
    ...(quizData.CHEMISTRY || []),
    ...(quizData.MATHS || [])
  ] : [];

  if (!quizData) return <div className="loading">Loading quiz...</div>;

  const skippedIndices = Array.from(skippedQuestions).map(idx => idx + 1);
  const missedIndices = Array.from(missedQuestions).map(idx => idx + 1);

  return (
    <div className="container">
      <Head>
        <title>PW ONLINE - Quiz {testid}</title>
      </Head>

      <div className="header">
        <div className="branding">
          <img src="/logo.png" alt="PW ONLINE Logo" className="logo" />
          <div className="branding-text">
            <h1 className="website-name">PW ONLINE</h1>
            <p className="website-subname">EDUHUB-KMR</p>
          </div>
        </div>
        <div className="profile">
          <button onClick={() => setShowProfilePopup(true)} className="profile-btn">
            {userName ? userName[0].toUpperCase() : 'P'}
          </button>
        </div>
      </div>

      {showProfilePopup && (
        <div className="profile-popup">
          <div className="profile-popup-content">
            <h3 className="profile-popup-title">User Profile</h3>
            <p className="profile-name">Name: {userName || 'Not set'}</p>
            <form onSubmit={handleNameSubmit}>
              <input
                type="text"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                placeholder="Enter your name"
                className="name-input"
              />
              <div className="profile-popup-buttons">
                <button type="submit" className="btn btn-primary">
                  <i className="fas fa-save"></i> Save
                </button>
                <button 
                  type="button"
                  onClick={() => setShowProfilePopup(false)}
                  className="btn btn-gray"
                >
                  <i className="fas fa-times"></i> Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showNamePopup && (
        <div className="name-popup">
          <div className="name-popup-content">
            <h3 className="name-popup-title">Enter Your Name</h3>
            <form onSubmit={handleNamePopupSubmit}>
              <input
                type="text"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                placeholder="Enter your name"
                className="name-input"
                required
              />
              <div className="name-popup-buttons">
                <button type="submit" className="btn btn-primary">
                  <i className="fas fa-save"></i> Save & Submit
                </button>
                <button 
                  type="button"
                  onClick={() => setShowNamePopup(false)}
                  className="btn btn-gray"
                >
                  <i className="fas fa-times"></i> Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showSubmitPopup && (
        <div className="submit-popup">
          <div className="submit-popup-content">
            <h3 className="submit-popup-title">Confirm Submission</h3>
            {skippedIndices.length > 0 && (
              <p className="submit-popup-text">
                Skipped Questions: {skippedIndices.map(idx => (
                  <button
                    key={idx}
                    onClick={() => {
                      setCurrentQuestion(idx - 1);
                      setShowSubmitPopup(false);
                    }}
                    className="submit-popup-link"
                  >
                    {idx}
                  </button>
                ))}
              </p>
            )}
            {missedIndices.length > 0 && (
              <p className="submit-popup-text">
                Missed Questions: {missedIndices.map(idx => (
                  <button
                    key={idx}
                    onClick={() => {
                      setCurrentQuestion(idx - 1);
                      setShowSubmitPopup(false);
                    }}
                    className="submit-popup-link"
                  >
                    {idx}
                  </button>
                ))}
              </p>
            )}
            <p className="submit-popup-text">Are you sure you want to submit?</p>
            <div className="submit-popup-buttons">
              <button onClick={handleConfirmSubmit} className="btn btn-primary">
                <i className="fas fa-check"></i> Submit
              </button>
              <button 
                onClick={() => setShowSubmitPopup(false)}
                className="btn btn-gray"
              >
                <i className="fas fa-times"></i> Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-container">
        <div id="timer" className="timer">{formatTime(timeLeft)}</div>
        
        <div className="question-container">
          <div className="header-controls">
            <button 
              onClick={() => setShowIndex(!showIndex)}
              className="btn btn-index"
            >
              <i className="fas fa-th"></i> Show Index
            </button>
            <button 
              onClick={() => setFlagged({ ...flagged, [currentQuestion]: true })}
              className="btn btn-flag"
            >
              <i className="fas fa-flag"></i>
            </button>
          </div>

          {showIndex && (
            <div className="index-popup">
              <div className="index-popup-content">
                <h3 className="index-popup-title">Question Index</h3>
                <div className="question-index">
                  {allQuestions.map((q, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setCurrentQuestion(index);
                        setShowIndex(false);
                      }}
                      className={`index-btn ${
                        index === currentQuestion ? 'index-btn-active' :
                        answers[index] ? 'index-btn-answered' :
                        missedQuestions.has(index) ? 'index-btn-missed' :
                        skippedQuestions.has(index) ? 'index-btn-skipped' :
                        'index-btn-not-visited'
                      }`}
                      title={q.questionNumber}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>
                <button 
                  onClick={() => setShowIndex(false)}
                  className="btn btn-gray index-popup-close"
                >
                  <i className="fas fa-times"></i> Close
                </button>
              </div>
            </div>
          )}

          {flagged[currentQuestion] && (
            <div className="flag-section">
              <input
                type="text"
                value={flagReason}
                onChange={(e) => setFlagReason(e.target.value)}
                placeholder="Reason for flagging (max 50 chars)"
                maxLength={50}
                className="flag-input"
              />
              <button 
                onClick={handleFlag}
                className="btn btn-error"
              >
                <i className="fas fa-flag"></i> Submit Flag
              </button>
            </div>
          )}

          <div className="question-info-bar">
            <span className="question-number">Question {currentQuestion + 1}</span>
            <span className="section-info">
              {allQuestions[currentQuestion]?.questionNumber.includes('PHYSICS') ? 'Physics' : 
               allQuestions[currentQuestion]?.questionNumber.includes('CHEMISTRY') ? 'Chemistry' : 'Maths'}
            </span>
            <div className="marks-box">
              <span className="correct-marks">+4</span>
              <span className="wrong-marks">-1</span>
            </div>
            <span className="question-type">MCQ</span>
          </div>

          {allQuestions[currentQuestion]?.image && (
            <img 
              src={allQuestions[currentQuestion].image} 
              className="question-image" 
              alt="Question"
            />
          )}

          <div className="options">
            {['A', 'B', 'C', 'D'].map((option) => (
              <div key={option} className="option-container">
                <label 
                  className={`option-label ${answers[currentQuestion] === option ? 'option-selected' : ''}`}
                >
                  <input
                    type="radio"
                    name={`question-${currentQuestion}`}
                    value={option}
                    checked={answers[currentQuestion] === option}
                    onChange={() => handleAnswer(currentQuestion, option)}
                    className="option-input"
                  />
                  {option}
                </label>
              </div>
            ))}
          </div>

          <div className="button-container">
            {currentQuestion > 0 && (
              <button 
                onClick={() => setCurrentQuestion(currentQuestion - 1)}
                className="btn btn-gray"
              >
                <i className="fas fa-arrow-left"></i> Previous
              </button>
            )}
            <button 
              onClick={handleSkip}
              className="btn btn-warning"
              disabled={currentQuestion === allQuestions.length - 1}
            >
              <i className="fas fa-forward"></i> Skip
            </button>
            <button 
              onClick={handleNext}
              className={`btn ${answers[currentQuestion] ? 'btn-secondary' : 'btn-error'}`}
              disabled={currentQuestion === allQuestions.length - 1}
            >
              <i className="fas fa-save"></i> Save & Next
            </button>
            {currentQuestion === allQuestions.length - 1 && (
              <button 
                onClick={() => setShowSubmitPopup(true)}
                className="btn btn-primary"
              >
                <i className="fas fa-check"></i> Submit Test
              </button>
            )}
          </div>
        </div>

        {score !== null && (
          <div className="result-container">
            <h2 className="result-title">Quiz Completed!</h2>
            <p className="result-score">Your Score: {score}</p>
            <button 
              onClick={() => router.push('/')}
              className="btn btn-primary"
            >
              <i className="fas fa-home"></i> Back to Home
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
