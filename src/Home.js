import React, { useEffect, useState } from 'react';
import { getDatabase, ref, onValue } from 'firebase/database';
import { db } from './firebase';

function Home({ setQuizStarted }) {
  const [tests, setTests] = useState([]);

  useEffect(() => {
    try {
      const testsRef = ref(getDatabase(db), 'tests');
      onValue(testsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const testList = Object.keys(data).flatMap(year =>
            data[year].map(test => ({ ...test, year }))
          );
          setTests(testList);
        }
      }, (error) => {
        console.error('Error fetching tests:', error);
        alert('Failed to load tests. Please try again.');
      });
    } catch (error) {
      console.error('Error setting up tests listener:', error);
      alert('Failed to load tests. Please try again.');
    }
  }, []);

  const handleStart = (testid) => {
    setQuizStarted(true);
    window.open(`/play?testid=${testid}`, '_blank');
  };

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">Available Tests</h1>
      {tests.length === 0 ? (
        <p className="text-center text-gray-600">No tests available.</p>
      ) : (
        <div className="grid gap-4">
          {tests.map((test, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-md p-6 flex justify-between items-center"
            >
              <div>
                <h3 className="text-xl font-semibold text-gray-800">{test.name}</h3>
                <p className="text-gray-600">Year: {test.year}</p>
                <p className="text-gray-600">Date: {test.date}</p>
                <p className="text-gray-600">Test ID: {test.testid}</p>
              </div>
              <button
                onClick={() => handleStart(test.testid)}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition"
                id={`start-btn-${test.testid}`}
              >
                Start
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Home;
