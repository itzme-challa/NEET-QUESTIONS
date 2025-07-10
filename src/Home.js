import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDatabase, ref, onValue } from 'firebase/database';
import { db } from './firebase';

function Home() {
  const [tests, setTests] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const dbRef = ref(getDatabase(db), 'tests');
    onValue(dbRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const testList = [];
        Object.entries(data).forEach(([type, testGroup]) => {
          Object.entries(testGroup).forEach(([testId, test]) => {
            testList.push({ ...test, type, testId });
          });
        });
        setTests(testList);
      }
    }, (error) => {
      console.error('Error fetching tests:', error);
      alert('Failed to load tests. Please try again.');
    });
  }, []);

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">Available Tests</h1>
      {tests.length === 0 ? (
        <p className="text-center text-gray-600">No tests available.</p>
      ) : (
        tests.map((test) => (
          <div
            key={test.testId}
            className="bg-white rounded-xl shadow-md p-4 mb-4 flex justify-between items-center"
          >
            <div>
              <h2 className="text-xl font-semibold text-gray-800">{test.name}</h2>
              <p className="text-gray-600">Type: {test.type}</p>
              <p className="text-gray-600">Date: {test.date}</p>
            </div>
            <button
              onClick={() => navigate(`/play?testId=${test.testId}`)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition"
            >
              Start Test
            </button>
          </div>
        ))
      )}
    </div>
  );
}

export default Home;
