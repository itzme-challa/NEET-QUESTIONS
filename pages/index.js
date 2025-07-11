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
    <div className="min-h-screen bg-gray-100 p-4">
      <Head>
        <title>Quiz App</title>
      </Head>
      
      <div className="max-w-4xl mx-auto">
        {!name && (
          <form onSubmit={handleNameSubmit} className="mb-8">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="p-2 border rounded mr-2"
              required
            />
            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
              Save Name
            </button>
          </form>
        )}

        <h1 className="text-3xl font-bold mb-6">Available Tests</h1>
        {loading ? (
          <p>Loading tests...</p>
        ) : (
          <div className="grid gap-4">
            {tests.map((test) => (
              <div key={test.id} className="bg-white p-4 rounded-lg shadow">
                <h2 className="text-xl font-semibold">{test.name}</h2>
                <p className="text-gray-600">Year: {test.year}</p>
                <p className="text-gray-600">Date: {test.date}</p>
                <Link href={`/play?testid=${test.id}`}>
                  <button className="mt-2 bg-green-500 text-white px-4 py-2 rounded">
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
