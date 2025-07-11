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

  useEffect(() => {
    if (testid) {
      // Fetch quiz data
      const fetchQuiz = async () => {
        try {
          const response = await fetch(`/data/${testid}.json`);
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
          handleSubmit();
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
  };

  const handleFlag = async () => {
    if (flagReason.length > 50) {
      alert('Flag reason must be under 50 characters');
      return;
    }
    setFlagged({ ...flagged, [currentQuestion]: flagReason });
    try {
      await set(ref(database, `flags/${testid}/${currentQuestion}`), {
        reason: flagReason,
        timestamp: new Date().toISOString(),
        user: localStorage.getItem('quizUserName')
      });
      setFlagReason('');
    } catch (error) {
      console.error('Error flagging question:', error);
    }
  };

  const handleSubmit = async () => {
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
      await set(ref(database, `results/${testid}/${localStorage.getItem('quizUserName')}`), {
        score,
        answers,
        date: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error saving results:', error);
    }
  };

  const allQuestions = quizData ? [
    ...(quizData.PHYSICS || []),
    ...(quizData.CHEMISTRY || []),
    ...(quizData.MATHS || [])
  ] : [];

  if (!quizData) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-4" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
      <Head>
        <title>Quiz - {testid}</title>
      </Head>

      <div className="max-w-3xl mx-auto">
        <div id="timer" className="text-2xl font-bold mb-4">{formatTime(timeLeft)}</div>
        
        <div className="question bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-end gap-3 mb-4">
            <button 
              onClick={() => setShowIndex(!showIndex)}
              className="flex items-center gap-2 bg-gray-100 border rounded-lg px-4 py-2 text-blue-600"
            >
              <i className="fas fa-th"></i> Show Index
            </button>
            <button 
              onClick={() => setFlagged({ ...flagged, [currentQuestion]: true })}
              className="flex items-center justify-center w-10 h-10 bg-gray-100 border rounded-lg"
            >
              <i className="fas fa-flag text-gray-600"></i>
            </button>
          </div>

          {flagged[currentQuestion] && (
            <div className="mb-4">
              <input
                type="text"
                value={flagReason}
                onChange={(e) => setFlagReason(e.target.value)}
                placeholder="Reason for flagging (max 50 chars)"
                maxLength={50}
                className="w-full p-2 border rounded"
              />
              <button 
                onClick={handleFlag}
                className="mt-2 bg-red-500 text-white px-4 py-2 rounded"
              >
                Submit Flag
              </button>
            </div>
          )}

          {showIndex && (
            <div className="grid grid-cols-5 gap-2 mb-4">
              {allQuestions.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentQuestion(index)}
                  className={`p-2 rounded ${index === currentQuestion ? 'bg-blue-500 text-white' : answers[index] ? 'bg-green-200' : 'bg-gray-200'}`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          )}

          <div className="flex items-center gap-6 bg-gray-50 border rounded-lg p-3 mb-6">
            <span className="bg-indigo-100 text-indigo-800 px-4 py-2 rounded font-semibold">
              Question {currentQuestion + 1}
            </span>
            <span className="bg-gray-200 px-4 py-2 rounded">
              {allQuestions[currentQuestion]?.questionNumber.includes('PHYSICS') ? 'Physics' : 
               allQuestions[currentQuestion]?.questionNumber.includes('CHEMISTRY') ? 'Chemistry' : 'Maths'}
            </span>
            <div className="flex gap-4">
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded">+4</span>
              <span className="bg-red-100 text-red-800 px-3 py-1 rounded">-1</span>
            </div>
            <span className="bg-blue-100 text-blue-800 px-4 py-2 rounded">MCQ</span>
          </div>

          {allQuestions[currentQuestion]?.image && (
            <img 
              src={allQuestions[currentQuestion].image} 
              className="max-w-full h-auto rounded-lg shadow mb-4" 
              alt="Question"
            />
          )}

          <div className="grid gap-3">
            {['A', 'B', 'C', 'D'].map((option) => (
              <label 
                key={option} 
                className={`p-3 border rounded-lg cursor-pointer ${
                  answers[currentQuestion] === option ? 'bg-blue-100 border-blue-500' : 'bg-gray-100'
                }`}
              >
                <input
                  type="radio"
                  name={`question-${currentQuestion}`}
                  value={option}
                  checked={answers[currentQuestion] === option}
                  onChange={() => handleAnswer(currentQuestion, option)}
                  className="mr-2"
                />
                {option}
              </label>
            ))}
          </div>

          <div className="flex justify-center gap-3 mt-6">
            {currentQuestion > 0 && (
              <button 
                onClick={() => setCurrentQuestion(currentQuestion - 1)}
                className="bg-gray-500 text-white px-4 py-2 rounded"
              >
                Previous
              </button>
            )}
            <button 
              onClick={() => setCurrentQuestion(currentQuestion + 1)}
              className="bg-orange-500 text-white px-4 py-2 rounded"
              disabled={currentQuestion === allQuestions.length - 1}
            >
              Skip
            </button>
            <button 
              onClick={() => setCurrentQuestion(currentQuestion + 1)}
              className="bg-green-500 text-white px-4 py-2 rounded"
              disabled={currentQuestion === allQuestions.length - 1}
            >
              Save & Next
            </button>
            {currentQuestion === allQuestions.length - 1 && (
              <button 
                onClick={handleSubmit}
                className="bg-blue-500 text-white px-4 py-2 rounded"
              >
                Submit Test
              </button>
            )}
          </div>
        </div>

        {score !== null && (
          <div className="bg-white p-6 rounded-lg shadow text-center">
            <h2 className="text-2xl font-bold mb-4">Quiz Completed!</h2>
            <p className="text-xl">Your Score: {score}</p>
            <button 
              onClick={() => router.push('/')}
              className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
            >
              Back to Home
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
