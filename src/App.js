import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { getDatabase, ref, onValue } from 'firebase/database';
import { db } from './firebase';
import Play from './play';
import Results from './results';

function App() {
  const [tests, setTests] = useState({});

  useEffect(() => {
    const dbRef = ref(getDatabase(db), 'tests');
    onValue(dbRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setTests(data);
      }
    }, (error) => {
      console.error('Error fetching tests:', error);
      alert('Failed to load tests. Please try again.');
    });
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-gray-100 font-inter">
        <Routes>
          <Route
            path="/"
            element={
              <div className="container mx-auto p-4 max-w-4xl">
                <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">Available Tests</h1>
                {Object.keys(tests).length === 0 ? (
                  <p className="text-center text-gray-600">No tests available.</p>
                ) : (
                  Object.keys(tests).map((type) => (
                    <div key={type} className="mb-8">
                      <h2 className="text-2xl font-semibold text-gray-800 mb-4">{type}</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {tests[type].map((test, index) => (
                          <div
                            key={test.testid}
                            className="bg-white p-4 rounded-lg shadow-md flex justify-between items-center"
                          >
                            <div>
                              <h3 className="text-lg font-medium text-gray-700">{test.name}</h3>
                              <p className="text-sm text-gray-500">Date: {test.date}</p>
                            </div>
                            <Link
                              to={`/play?testid=${test.testid}`}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition"
                              id={`start-btn-${test.testid}`}
                            >
                              Start
                            </Link>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            }
          />
          <Route
            path="/play"
            element={<Play />}
          />
          <Route
            path="/results"
            element={<Results />}
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
