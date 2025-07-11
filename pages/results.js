import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { getDatabase, ref, get } from 'firebase/database';
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

export default function Results() {
  const router = useRouter();
  const { testid, userName } = router.query;
  const [results, setResults] = useState(null);
  const [quizData, setQuizData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileName, setProfileName] = useState('');
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const [tempName, setTempName] = useState('');
  const [testDetails, setTestDetails] = useState({ name: '', date: '' });
  const [showImagePopup, setShowImagePopup] = useState(null);

  useEffect(() => {
    setProfileName(localStorage.getItem('quizUserName') || '');

    if (testid && userName) {
      const fetchResults = async () => {
        try {
          const resultsRef = ref(database, `results/${testid}/${userName}`);
          const snapshot = await get(resultsRef);
          if (snapshot.exists()) {
            setResults(snapshot.val());
          } else {
            setResults(null);
          }
        } catch (error) {
          console.error('Error fetching results:', error);
        }
      };

      const fetchQuizData = async () => {
        try {
          const response = await fetch(`/data/${testid}.json`);
          if (!response.ok) throw new Error('Quiz data not found');
          const data = await response.json();
          setQuizData(data);
        } catch (error) {
          console.error('Error fetching quiz data:', error);
        }
      };

      const fetchTestDetails = async () => {
        try {
          const testsRef = ref(database, `tests`);
          const snapshot = await get(testsRef);
          const testData = snapshot.val();
          let testName = '';
          let testDate = '';
          for (const year in testData) {
            if (testData[year][testid]) {
              testName = testData[year][testid].name;
              testDate = testData[year][testid].date;
              break;
            }
          }
          setTestDetails({ name: testName, date: testDate });
        } catch (error) {
          console.error('Error fetching test details:', error);
        }
      };

      Promise.all([fetchResults(), fetchQuizData(), fetchTestDetails()]).then(() => {
        setLoading(false);
      });
    }
  }, [testid, userName]);

  const handleProfileClick = () => {
    setTempName(profileName);
    setShowProfilePopup(true);
  };

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    if (tempName.trim()) {
      setProfileName(tempName.trim());
      localStorage.setItem('quizUserName', tempName.trim());
      setShowProfilePopup(false);
    } else {
      alert('Please enter a valid name.');
    }
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

  if (loading) return <div className="loading">Loading results...</div>;

  if (!results || !quizData) return <div className="loading">No results found.</div>;

  return (
    <div className="container">
      <Head>
        <title>PW ONLINE - Results {testid}</title>
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
            {profileName ? profileName[0].toUpperCase() : 'P'}
          </button>
        </div>
      </header>

      {showProfilePopup && (
        <div className="popup">
          <div className="popup-content">
            <h3 className="popup-title">User Profile</h3>
            <p className="profile-name">Name: {profileName || 'Not set'}</p>
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

      {showImagePopup && (
        <div className="image-popup">
          <div className="image-popup-content">
            <img src={showImagePopup} alt="Question Enlarged" />
            <button 
              className="image-popup-close"
              onClick={() => setShowImagePopup(null)}
              title="Close Image"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
        </div>
      )}

      <div className="max-container">
        <h2 className="page-title">Results - {testDetails.name}</h2>
        <div className="result-summary">
          <p>Name: {results.name}</p>
          <p>Score: {results.score}</p>
          <p>Percentage: {((results.score / 720) * 100).toFixed(2)}%</p>
          <p>Date: {new Date(results.date).toLocaleString()}</p>
          <p>Test: {testDetails.name}</p>
          <p>Test Date: {testDetails.date}</p>
        </div>

        <div className="subject-results">
          {Object.keys(subjectQuestions).map((subject) => (
            <div key={subject} className="subject-section">
              <h4 className="subject-title">{subject}</h4>
              {subjectQuestions[subject].map((q, index) => {
                const userAnswer = results.answers[q.globalIndex];
                const isCorrect = userAnswer === q.correctOption;
                const isUnanswered = !userAnswer;
                return (
                  <div key={q.globalIndex} className="result-card">
                    <div className="result-question">
                      <p className="question-text">{q.questionNumber}: {q.question}</p>
                      {q.image && (
                        <img 
                          src={q.image} 
                          alt="Question Image" 
                          className="question-image"
                          onClick={() => setShowImagePopup(q.image)}
                        />
                      )}
                      <div className="result-details">
                        <p>Your Answer: {userAnswer || 'Unanswered'}</p>
                        <p>Correct Answer: {q.correctOption}</p>
                        <p className={`result-status-${isCorrect ? 'correct' : isUnanswered ? 'unanswered' : 'incorrect'}`}>
                          Status: {isCorrect ? 'Correct' : isUnanswered ? 'Unanswered' : 'Incorrect'}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        <div className="result-actions">
          <button 
            onClick={() => router.push('/')}
            className="btn btn-primary"
            title="Back to Home"
          >
            <i className="fas fa-home"></i>
            <span className="btn-text">Back to Home</span>
          </button>
        </div>
      </div>
    </div>
  );
}
