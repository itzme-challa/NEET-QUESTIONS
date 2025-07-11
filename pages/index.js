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
  const [userName, setUserName] = useState('');
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const [tempName, setTempName] = useState('');
  const [showNamePopup, setShowNamePopup] = useState(false);
  const [selectedTestId, setSelectedTestId] = useState(null);

  useEffect(() => {
    // Get cached name
    setUserName(localStorage.getItem('quizUserName') || '');
    
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

  const handleProfileClick = () => {
    setTempName(userName);
    setShowProfilePopup(true);
  };

  const handleNameSubmit = (e) => {
    e.preventDefault();
    if (tempName.trim()) {
      setUserName(tempName.trim());
      localStorage.setItem('quizUserName', tempName.trim());
      setShowProfilePopup(false);
    } else {
      alert('Please enter a valid name.');
    }
  };

  const handleStartTest = (testId) => {
    if (!userName.trim()) {
      setSelectedTestId(testId);
      setShowNamePopup(true);
      return false;
    }
    return true;
  };

  const handleNamePopupSubmit = (e) => {
    e.preventDefault();
    if (tempName.trim()) {
      setUserName(tempName.trim());
      localStorage.setItem('quizUserName', tempName.trim());
      setShowNamePopup(false);
      router.push(`/play?testid=${selectedTestId}`);
    } else {
      alert('Please enter a valid name.');
    }
  };

  const router = useRouter();

  return (
    <div className="container">
      <Head>
        <title>PW ONLINE - Home</title>
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
          <button onClick={handleProfileClick} className="profile-btn">
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
                  <i className="fas fa-save"></i> Save & Start
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

      <div className="max-container">
        <h2 className="page-title">Available Tests</h2>
        
        {loading ? (
          <div className="loading">Loading tests...</div>
        ) : (
          <div className="test-grid">
            {tests.map((test) => (
              <div key={test.id} className="test-card">
                <h3 className="test-title">{test.name}</h3>
                <p className="test-info">Year: {test.year}</p>
                <p className="test-info">Date: {test.date}</p>
                <Link href={userName.trim() ? `/play?testid=${test.id}` : '#'} onClick={() => handleStartTest(test.id)}>
                  <button className="btn btn-secondary" disabled={!userName.trim()}>
                    <i className="fas fa-play"></i> Start Test
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
