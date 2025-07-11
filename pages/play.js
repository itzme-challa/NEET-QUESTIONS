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
  const [timeLeft, setTimeLeft] = useState(0);
  const [showIndex, setShowIndex] = useState(false);
  const [score, setScore] = useState(null);
  const [userName, setUserName] = useState('');
  const [showNamePopup, setShowNamePopup] = useState(false);
  const [tempName, setTempName] = useState('');
  const [skippedQuestions, setSkippedQuestions] = useState(new Set());
  const [missedQuestions, setMissedQuestions] = useState(new Set());
  const [showSubmitPopup, setShowSubmitPopup] = useState(false);
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const [showInstructionsPopup, setShowInstructionsPopup] = useState(false);

  useEffect(() => {
    const name = localStorage.getItem('quizUserName') || '';
    setUserName(name);

    if (testid) {
      const fetchQuiz = async () => {
        try {
          const response = await fetch(`/data/${testid}.json`);
          if (!response.ok) throw new Error('Quiz data not found');
          const data = await response.json();
          setQuizData(data);
          const allQuestions = [
            ...(data.PHYSICS || []),
            ...(data.CHEMISTRY || []),
            ...(data.MATHS || []),
            ...(data.BIOLOGY || []),
            ...(data.BOTANY || []),
            ...(data.ZOOLOGY || [])
          ];
          setTimeLeft((allQuestions.length * 1 + 15) * 60);
        } catch (error) {
          console.error('Error fetching quiz:', error);
        }
      };
      fetchQuiz();
    }

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

    const handleKeyDown = (e) => {
      if (showIndex || showNamePopup || showSubmitPopup || showProfilePopup || showInstructionsPopup) return;
      if (e.key === 'ArrowLeft' && currentQuestion > 0) {
        setCurrentQuestion(currentQuestion - 1);
      } else if (e.key === 'ArrowRight' && currentQuestion < allQuestions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
      } else if (['1', '2', '3', '4'].includes(e.key)) {
        const options = ['A', 'B', 'C', 'D'];
        handleAnswer(currentQuestion, options[parseInt(e.key) - 1]);
      } else if (e.key === 'c') {
        handleClearSelection();
      } else if (e.key === 's') {
        handleSkip();
      } else if (e.key === 'n') {
        handleNext();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearInterval(timer);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [testid, currentQuestion, showIndex, showNamePopup, showSubmitPopup, showProfilePopup, showInstructionsPopup]);

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

  const handleClearSelection = () => {
    setAnswers((prev) => {
      const newAnswers = { ...prev };
      delete newAnswers[currentQuestion];
      return newAnswers;
    });
    setMissedQuestions((prev) => {
      const newSet = new Set(prev);
      newSet.delete(currentQuestion);
      return newSet;
    });
    setSkippedQuestions((prev) => {
      const newSet = new Set(prev);
      newSet.delete(currentQuestion);
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
    if (!flagReason.trim()) {
      alert('Please enter a reason for flagging.');
      return;
    }
    if (flagReason.length > 50) {
      alert('Flag reason must be under 50 characters.');
      return;
    }
    try {
      const question = allQuestions[currentQuestion];
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
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
      alert('Flag submitted successfully.');
    } catch (error) {
      console.error('Error flagging question:', error);
      alert('Failed to submit flag. Please try again.');
    }
  };

  const handleSubmit = async () => {
    if (!userName.trim()) {
      setShowNamePopup(true);
      return;
    }

    let score = 0;
    const allQuestions = [
      ...(quizData?.PHYSICS || []),
      ...(quizData?.CHEMISTRY || []),
      ...(quizData?.MATHS || []),
      ...(quizData?.BIOLOGY || []),
      ...(quizData?.BOTANY || []),
      ...(quizData?.ZOOLOGY || [])
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
      router.push(`/results?testid=${testid}&userName=${userName}`);
    } catch (error) {
      console.error('Error saving results:', error);
      alert('Failed to save results. Please try again.');
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

  const handleProfileClick = () => {
    setTempName(userName);
    setShowProfilePopup(true);
  };

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    if (tempName.trim()) {
      setUserName(tempName.trim());
      localStorage.setItem('quizUserName', tempName.trim());
      setShowProfilePopup(false);
    } else {
      alert('Please enter a valid name.');
    }
  };

  const handleConfirmSubmit = () => {
    setShowSubmitPopup(false);
    handleSubmit();
  };

  const handleInstructions = () => {
    setShowInstructionsPopup(true);
  };

  const allQuestions = quizData ? [
    ...(quizData.PHYSICS || []),
    ...(quizData.CHEMISTRY || []),
    ...(quizData.MATHS || []),
    ...(quizData.BIOLOGY || []),
    ...(quizData.BOTANY || []),
    ...(quizData.ZOOLOGY || [])
  ] : [];

  const subjectQuestions = quizData
    ? Object.keys(quizData).reduce((acc, subject) => {
        acc[subject] = quizData[subject].map((q, index) => ({
          ...q,
          globalIndex: allQuestions.findIndex(
            (question) => question === q
          ),
          questionNumber: `Question ${index + 1}`
        }));
        return acc;
      }, {})
    : {};

  if (!quizData) return <div className="loading">Loading quiz...</div>;

  const skippedIndices = Array.from(skippedQuestions).map(idx => idx + 1);
  const missedIndices = Array.from(missedQuestions).map(idx => idx + 1);
  const answeredCount = Object.keys(answers).length;
  const flaggedCount = Object.keys(flagged).length;
  const progress = allQuestions.length > 0 ? ((answeredCount / allQuestions.length) * 100).toFixed(1) : 0;

  return (
    <div className="container">
      <Head>
        <title>PW ONLINE - Quiz {testid}</title>
      </Head>

      <header className="header">
        <div className="branding">
          <img src="/logo.png" alt="PW ONLINE Logo" className="logo" />
          <div className="branding-text">
            <h1 className="website-name">PW ONLINE</h1>
            <p className="website-subname">EDUHUB-KMR</p>
          </div>
        </div>
        <div className="profile">
          <button onClick={handleProfileClick} className="profile-btn" title="User Profile">
            {userName ? userName[0].toUpperCase() : 'P'}
          </button>
        </div>
      </header>

      {showProfilePopup && (
        <div className="popup">
          <div className="popup-content">
            <h3 className="popup-title">User Profile</h3>
            <p className="profile-name">Name: {userName || 'Not set'}</p>
            <form onSubmit={handleProfileSubmit}>
              <div className="input-container">
                <input
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  placeholder="Enter your name"
                  className="input-field"
                />
              </div>
              <div className="popup-buttons">
                <button type="submit" className="btn btn-primary">
                  <i className="fas fa-save"></i>
                  <span className="btn-text">Save</span>
                </button>
                <button 
                  type="button"
                  onClick={() => setShowProfilePopup(false)}
                  className="btn btn-gray"
                >
                  <i className="fas fa-times"></i>
                  <span className="btn-text">Cancel</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showNamePopup && (
        <div className="popup">
          <div className="popup-content">
            <h3 className="popup-title">Enter Your Name</h3>
            <form onSubmit={handleNamePopupSubmit}>
              <div className="input-container">
                <input
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  placeholder="Enter your name"
                  className="input-field"
                  required
                />
              </div>
              <div className="popup-buttons">
                <button type="submit" className="btn btn-primary">
                  <i className="fas fa-save"></i>
                  <span className="btn-text">Save & Submit</span>
                </button>
                <button 
                  type="button"
                  onClick={() => setShowNamePopup(false)}
                  className="btn btn-gray"
                >
                  <i className="fas fa-times"></i>
                  <span className="btn-text">Cancel</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showIndex && (
        <div className="popup">
          <div className="popup-content">
            <h3 className="popup-title">Question Index</h3>
            <div className="question-status">
              <p>Answered: {answeredCount} / {allQuestions.length} ({progress}%)</p>
              <p>Skipped: {skippedQuestions.size}</p>
              <p>Missed: {missedQuestions.size}</p>
              <p>Flagged: {flaggedCount}</p>
            </div>
            <div className="question-index">
              {Object.keys(subjectQuestions).length > 0 ? (
                Object.keys(subjectQuestions).map((subject) => (
                  <div key={subject} className="subject-section">
                    <h4 className="subject-title">{subject}</h4>
                    <div className="subject-questions">
                      {subjectQuestions[subject].map((q, index) => (
                        <button
                          key={q.globalIndex}
                          onClick={() => {
                            setCurrentQuestion(q.globalIndex);
                            setShowIndex(false);
                          }}
                          className={`index-btn ${
                            q.globalIndex === currentQuestion ? 'index-btn-active' :
                            answers[q.globalIndex] ? 'index-btn-answered' :
                            missedQuestions.has(q.globalIndex) ? 'index-btn-missed' :
                            skippedQuestions.has(q.globalIndex) ? 'index-btn-skipped' :
                            flagged[q.globalIndex] ? 'index-btn-flagged' :
                            'index-btn-not-visited'
                          }`}
                          title={`${subject} ${q.questionNumber}`}
                        >
                          {index + 1}
                        </button>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <p>No questions available</p>
              )}
            </div>
            <button 
              onClick={() => setShowIndex(false)}
              className="btn btn-gray index-popup-close"
            >
              <i className="fas fa-times"></i>
              <span className="btn-text">Close</span>
            </button>
          </div>
        </div>
      )}

      {showSubmitPopup && (
        <div className="popup">
          <div className="popup-content">
            <h3 className="popup-title">Confirm Submission</h3>
            {skippedIndices.length > 0 && (
              <p className="popup-text">
                Skipped Questions: {skippedIndices.map(idx => (
                  <button
                    key={idx}
                    onClick={() => {
                      setCurrentQuestion(idx - 1);
                      setShowSubmitPopup(false);
                    }}
                    className="popup-link popup-link-skipped"
                    title={`Go to Question ${idx}`}
                  >
                    {idx}
                  </button>
                ))}
              </p>
            )}
            {missedIndices.length > 0 && (
              <p className="popup-text">
                Missed Questions: {missedIndices.map(idx => (
                  <button
                    key={idx}
                    onClick={() => {
                      setCurrentQuestion(idx - 1);
                      setShowSubmitPopup(false);
                    }}
                    className="popup-link popup-link-missed"
                    title={`Go to Question ${idx}`}
                  >
                    {idx}
                  </button>
                ))}
              </p>
            )}
            <p className="popup-text">Are you sure you want to submit?</p>
            <div className="popup-buttons">
              <button onClick={handleConfirmSubmit} className="btn btn-primary">
                <i className="fas fa-check"></i>
                <span className="btn-text">Submit</span>
              </button>
              <button 
                onClick={() => setShowSubmitPopup(false)}
                className="btn btn-gray"
              >
                <i className="fas fa-times"></i>
                <span className="btn-text">Cancel</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {showInstructionsPopup && (
        <div className="popup">
          <div className="popup-content">
            <h3 className="popup-title">Test Instructions</h3>
            <p className="popup-text">
              Read each question carefully. Select one option per question or clear your selection. Use the flag option to report issues. 
              Time allotted: {(allQuestions.length * 1 + 15)} minutes. Keyboard shortcuts: Arrow Left/Right (navigate), 1-4 (select option), C (clear), S (skip), N (next).
            </p>
            <div className="popup-buttons">
              <button 
                type="button"
                onClick={() => setShowInstructionsPopup(false)}
                className="btn btn-gray"
              >
                <i className="fas fa-times"></i>
                <span className="btn-text">Close</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-container">
        <div className="timer-container">
          <button onClick={handleInstructions} className="btn btn-info" title="Test Instructions">
            <i className="fas fa-info-circle"></i>
            <span className="btn-text">Instructions</span>
          </button>
          <div className="timer">
            <i className="fas fa-clock"></i>
            <span>{formatTime(timeLeft)}</span>
          </div>
          <div className="progress-container">
            <span>Progress: {answeredCount}/{allQuestions.length} ({progress}%)</span>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progress}%` }}></div>
            </div>
          </div>
        </div>
        
        <div className="question-container">
          <div className="header-controls">
            <button 
              onClick={() => setShowIndex(true)}
              className="btn btn-index"
              title="Show Index"
            >
              <i className="fas fa-th"></i>
              <span className="btn-text">Index</span>
            </button>
            <button 
              onClick={() => setFlagged({ ...flagged, [currentQuestion]: true })}
              className="btn btn-flag"
              title="Flag Question"
            >
              <i className="fas fa-flag"></i>
            </button>
          </div>

          {flagged[currentQuestion] && (
            <div className="flag-section">
              <div className="input-container">
                <input
                  type="text"
                  value={flagReason}
                  onChange={(e) => setFlagReason(e.target.value)}
                  placeholder="Reason for flagging (max 50 chars)"
                  maxLength={50}
                  className="input-field"
                />
              </div>
              <button 
                onClick={handleFlag}
                className="btn btn-error"
              >
                <i className="fas fa-flag"></i>
                <span className="btn-text">Submit Flag</span>
              </button>
            </div>
          )}

          <div className="question-info-bar">
            <span className="question-number">Question {currentQuestion + 1}</span>
            <span className="section-info">
              {Object.keys(subjectQuestions).find(subject => 
                subjectQuestions[subject].some(q => q.globalIndex === currentQuestion)
              ) || 'Unknown'}
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
                title="Previous (←)"
              >
                <i className="fas fa-arrow-left"></i>
                <span className="btn-text">Previous</span>
              </button>
            )}
            <button 
              onClick={handleClearSelection}
              className="btn btn-gray"
              title="Clear Selection (C)"
              disabled={!answers[currentQuestion]}
            >
              <i className="fas fa-eraser"></i>
              <span className="btn-text">Clear</span>
            </button>
            <button 
              onClick={handleSkip}
              className="btn btn-warning"
              disabled={currentQuestion === allQuestions.length - 1}
              title="Skip (S)"
            >
              <i className="fas fa-forward"></i>
              <span className="btn-text">Skip</span>
            </button>
            <button 
              onClick={handleNext}
              className={`btn ${answers[currentQuestion] ? 'btn-secondary' : 'btn-error'}`}
              disabled={currentQuestion === allQuestions.length - 1}
              title="Save & Next (N)"
            >
              <i className="fas fa-save"></i>
              <span className="btn-text">Save & Next</span>
            </button>
            {currentQuestion === allQuestions.length - 1 && (
              <button 
                onClick={() => setShowSubmitPopup(true)}
                className="btn btn-primary"
                title="Submit Test"
              >
                <i className="fas fa-check"></i>
                <span className="btn-text">Submit Test</span>
              </button>
            )}
          </div>
        </div>

        {score !== null && (
          <div className="result-container">
            <h2 className="result-title">Quiz Completed!</h2>
            <p className="result-score">Your Score: {score}</p>
            <button 
              onClick={() => router.push(`/results?testid=${testid}&userName=${userName}`)}
              className="btn btn-primary"
              title="View Results"
            >
              <i className="fas fa-list"></i>
              <span className="btn-text">View Results</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
