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

export default function Leaderboard() {
  const router = useRouter();
  const { testid } = router.query;
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    setUserName(localStorage.getItem('quizUserName') || '');

    if (testid) {
      const fetchLeaderboard = async () => {
        try {
          const resultsRef = ref(database, `results/${testid}`);
          const snapshot = await get(resultsRef);
          if (!snapshot.exists()) {
            setLeaderboardData([]);
            setLoading(false);
            return;
          }

          const results = snapshot.val();
          const leaderboard = Object.entries(results)
            .map(([user, data]) => ({
              name: data.name,
              score: data.score,
              percentage: ((data.score / 720) * 100).toFixed(2),
              date: data.date
            }))
            .sort((a, b) => b.score - a.score)
            .slice(0, 10);

          setLeaderboardData(leaderboard);
          setLoading(false);
        } catch (error) {
          console.error('Error fetching leaderboard:', error);
          setLoading(false);
        }
      };
      fetchLeaderboard();
    }
  }, [testid]);

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

  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const [tempName, setTempName] = useState('');

  return (
    <div className="container">
      <Head>
        <title>PW ONLINE - Leaderboard {testid}</title>
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

      <div className="max-container">
        <h2 className="page-title">Leaderboard - Test {testid}</h2>
        {loading ? (
          <div className="loading">Loading leaderboard...</div>
        ) : leaderboardData.length === 0 ? (
          <div className="loading">No results found for this test.</div>
        ) : (
          <div className="leaderboard-table">
            <table>
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Name</th>
                  <th>Score</th>
                  <th>Percentage</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {leaderboardData.map((entry, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{entry.name}</td>
                    <td>{entry.score}</td>
                    <td>{entry.percentage}%</td>
                    <td>{new Date(entry.date).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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
