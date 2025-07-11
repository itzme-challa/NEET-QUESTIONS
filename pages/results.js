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
  const [quizData, setQuizData] = useState(null);
  const [userResults, setUserResults] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (testid && userName) {
      const fetchData = async () => {
        try {
          // Fetch quiz data
          const quizResponse = await fetch(`/data/${testid}.json`);
          if (!quizResponse.ok) throw new Error('Quiz data not found');
          const quizData = await quizResponse.json();
          setQuizData(quizData);

          // Fetch user results
          const resultsRef = ref(database, `results/${testid}/${userName}`);
          const resultsSnapshot = await get(resultsRef);
          if (!resultsSnapshot.exists()) throw new Error('Results not found');
          setUserResults(resultsSnapshot.val());
          setLoading(false);
        } catch (error) {
          console.error('Error fetching data:', error);
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [testid, userName]);

  if (loading) return <div className="loading">Loading results...</div>;

  if (!quizData || !userResults) return <div className="loading">Error loading results</div>;

  const allQuestions = [
    ...(quizData.PHYSICS || []),
    ...(quizData.CHEMISTRY || []),
    ...(quizData.MATHS || []),
    ...(quizData.BIOLOGY || []),
    ...(quizData.BOTANY || []),
    ...(quizData.ZOOLOGY || [])
  ];

  const subjectQuestions = Object.keys(quizData).reduce((acc, subject) => {
    acc[subject] = quizData[subject].map((q, index) => ({
      ...q,
      globalIndex: allQuestions.findIndex((question) => question === q),
      questionNumber: `Question ${index + 1}`
    }));
    return acc;
  }, {});

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
          <button className="profile-btn" title="User Profile" disabled>
            {userName ? userName[0].toUpperCase() : 'P'}
          </button>
        </div>
      </header>

      <div className="max-container">
        <h2 className="page-title">Quiz Results</h2>
        <div className="result-summary">
          <p>Name: {userResults.name}</p>
          <p>Score: {userResults.score}</p>
          <p>Date: {new Date(userResults.date).toLocaleString()}</p>
        </div>

        {Object.keys(subjectQuestions).map((subject) => (
          <div key={subject} className="subject-results">
            <h3 className="subject-title">{subject}</h3>
            {subjectQuestions[subject].map((q) => {
              const userAnswer = userResults.answers[q.globalIndex];
              const isCorrect = userAnswer === q.correctOption;
              const status = userAnswer
                ? isCorrect
                  ? 'Correct'
                  : 'Incorrect'
                : 'Unanswered';
              return (
                <div key={q.globalIndex} className="result-card">
                  <div className="result-question">
                    <span className="question-number">{q.questionNumber}</span>
                    {q.image ? (
                      <img src={q.image} className="question-image" alt="Question" />
                    ) : (
                      <p className="question-text">{q.text || 'Question content not available'}</p>
                    )}
                  </div>
                  <div className="result-details">
                    <p className={`result-status result-status-${status.toLowerCase()}`}>
                      Status: {status}
                    </p>
                    <p>Your Answer: {userAnswer || 'None'}</p>
                    <p>Correct Answer: {q.correctOption}</p>
                  </div>
                </div>
              );
            })}
          </div>
        ))}

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
