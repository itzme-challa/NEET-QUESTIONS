import React, { useEffect, useState } from 'react';
import { getDatabase, ref, onValue } from 'firebase/database';
import { db } from './firebase';
import { useLocation } from 'react-router-dom';

function Results() {
  const [results, setResults] = useState([]);
  const [questionsData, setQuestionsData] = useState(null);
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const testid = queryParams.get('testid');

  useEffect(() => {
    if (testid) {
      // Load questions for results display
      import(`./data/${testid}.json`)
        .then(data => {
          setQuestionsData(data.default);
        })
        .catch(error => {
          console.error('Error loading questions for results:', error);
          alert('Failed to load results data. Please try again.');
        });

      // Fetch results from Firebase
      try {
        const dbRef = ref(getDatabase(db), `quiz_results/${testid}`);
        onValue(dbRef, (snapshot) => {
          const data = snapshot.val();
          if (data) {
            setResults(Object.entries(data).map(([id, { answers, timestamp }]) => ({
              id,
              answers,
              timestamp
            })));
          }
        }, (error) => {
          console.error('Error fetching results:', error);
          alert('Failed to load results. Please try again.');
        });
      } catch (error) {
        console.error('Error setting up results listener:', error);
      }
    }
  }, [testid]);

  if (!questionsData) {
    return <div className="text-center p-4">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">Quiz Results</h1>
      {Object.keys(questionsData).map(subject => (
        <div key={subject} className="mb-8">
          <div id="headings" className="text-center">
            <hr className="my-4 border-gray-300" />
            <h3 className="text-2xl font-semibold text-gray-800">Section: {subject}</h3>
          </div>
          <table className="w-full border-2 border-yellow-500 mt-4">
            <thead>
              <tr className="bg-yellow-100">
                <th className="border border-yellow-500 p-3 text-gray-700">Sr No.</th>
                <th className="border border-yellow-500 p-3 text-gray-700">Question Image</th>
                <th className="border border-yellow-500 p-3 text-gray-700">Answer</th>
                <th className="border border-yellow-500 p-3 text-gray-700">Marks</th>
              </tr>
            </thead>
            <tbody>
              {questionsData[subject].map((q, index) => {
                const latestAnswer = results.length > 0 ? results[results.length - 1].answers[q.questionNumber] || 'Skipped' : 'Skipped';
                return (
                  <tr key={index}>
                    <td className="border border-yellow-500 p-3 text-center">{index + 1}</td>
                    <td className="border border-yellow-500 p-3 text-center">
                      {q.image && (
                        <img
                          src={q.image}
                          alt="Question"
                          className="result-image mx-auto rounded-lg cursor-pointer"
                          style={{ maxHeight: '200px', maxWidth: '200px', objectFit: 'contain' }}
                        />
                      )}
                    </td>
                    <td className="border border-yellow-500 p-3 text-center">
                      <span className="text-orange-600 font-bold">{latestAnswer}</span>
                      <div className="text-green-600">Correct Answer: {q.correctOption}</div>
                    </td>
                    <td className="border border-yellow-500 p-3 text-center">
                      {latestAnswer === q.correctOption && latestAnswer !== 'Skipped' ? 4 : 0}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}

export default Results;
