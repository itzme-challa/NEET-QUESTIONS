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
    localStorage.setItem('quizUserName', name);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 font-sans">
      <Head>
        <title>Quiz App - Home</title>
      </Head>
      
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Available Tests</h1>
        
        {!name && (
          <form onSubmit={handleNameSubmit} className="mb-8 bg-white p-6 rounded-lg shadow-custom">
            <div className="flex items-center gap-4">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
              <button
                type="submit"
                className="bg-primary text-white px-6 py-3 rounded-lg shadow-custom hover:bg-blue-700 transition"
              >
                Save Name
              </button>
            </div>
          </form>
        )}

        {loading ? (
          <div className="text-center text-gray-600">Loading tests...</div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {tests.map((test) => (
              <div
                key={test.id}
                className="bg-white p-6 rounded-lg shadow-custom hover:shadow-custom-hover transition"
              >
                <h2 className="text-xl font-semibold text-gray-800">{test.name}</h2>
                <p className="text-gray-600 mt-1">Year: {test.year}</p>
                <p className="text-gray-600">Date: {test.date}</p>
                <Link href={`/play?testid=${test.id}`}>
                  <button className="mt-4 bg-secondary text-white px-6 py-3 rounded-lg shadow-custom hover:bg-green-600 transition">
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
