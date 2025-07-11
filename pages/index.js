import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { getDatabase, ref, get } from 'firebase/database';
import { initializeApp } from 'firebase/app';
import Head from 'next/head';
import Link from 'next/link';

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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export default function Home() {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');

  useEffect(() => {
    // Get cached name
    setName(localStorage.getItem('quizUserName') || '');
    
    // Fetch tests from Firebase
    const fetchTests = async () => {
      try {
        const testsRef = ref(database, 'tests');
        const snapshot = await get(testsRef);
        const testData = snapshot.val();
        const testList = [];
        
        for (const year in testData) {
          for (const testId in testData[year]) {
            testList.push({
              id: testId,
              year: year,
              name: testData[year][testId].name,
              date: testData[year][testId].date
            });
          }
        }
        setTests(testList);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching tests:', error);
        setLoading(false);
      }
    };
    
    fetchTests();
  }, []);

  const handleNameSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) {
      localStorage.setItem('quizUserName', name.trim());
    } else {
      alert('Please enter a valid name.');
    }
  };

  const handleStartTest = (testId) => {
    if (!name.trim()) {
      alert('Please enter your name before starting the test.');
      return false;
    }
    return true;
  };

  return (
    <div className="container">
      <Head>
        <title>Quiz App - Home</title>
      </Head>
      
      <div className="max-container">
        <form onSubmit={handleNameSubmit} className="name-form">
          <div className="form-group">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="name-input"
            />
            <button type="submit" className="btn btn-primary">
              Save Name
            </button>
          </div>
        </form>

        <h1 className="page-title">Available Tests</h1>
        
        {loading ? (
          <div className="loading">Loading tests...</div>
        ) : (
          <div className="test-grid">
            {tests.map((test) => (
              <div key={test.id} className="test-card">
                <h2 className="test-title">{test.name}</h2>
                <p className="test-info">Year: {test.year}</p>
                <p className="test-info">Date: {test.date}</p>
                <Link href={name.trim() ? `/play?testid=${test.id}` : '#'} onClick={() => handleStartTest(test.id)}>
                  <button className="btn btn-secondary" disabled={!name.trim()}>
                    Start Test
                  </button>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
