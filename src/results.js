import React, { useEffect, useState } from 'react';
import { getDatabase, ref, onValue } from 'firebase/database';
import { db } from './firebase';

const questionsData = {
  "PHYSICS": [
    {
      "questionNumber": "Question 1",
      "image": "https://static.pw.live/5b09189f7285894d9130ccd0/02a847d7-b87c-4acb-b200-f0000337fde6.png",
      "correctOption": "C"
    },
    {
      "questionNumber": "Question 2",
      "image": "https://static.pw.live/5b09189f7285894d9130ccd0/997c16b0-9743-437b-8d94-f1731d3d03fe.png",
      "correctOption": "D"
    },
    {
      "questionNumber": "Question 3",
      "image": "https://static.pw.live/5b09189f7285894d9130ccd0/1303df44-4d76-43fd-bf65-85fa69cbbad5.png",
      "correctOption": "B"
    },
    {
      "questionNumber": "Question 4",
      "image": "https://static.pw.live/5b09189f7285894d9130ccd0/fa60933a-e038-43bf-996f-c767937675ae.png",
      "correctOption": "B"
    },
    {
      "questionNumber": "Question 5",
      "image": "https://static.pw.live/5b09189f7285894d9130ccd0/43032f03-6829-49d0-a07f-12e97847b21b.png",
      "correctOption": "B"
    },
    {
      "questionNumber": "Question 6",
      "image": "https://static.pw.live/5b09189f7285894d9130ccd0/352d6768-193e-4fa9-9fb0-2efb1a856330.png",
      "correctOption": "B"
    },
    {
      "questionNumber": "Question 7",
      "image": "https://static.pw.live/5b09189f7285894d9130ccd0/9af42518-e561-4aaa-beea-9dc55b7d1603.png",
      "correctOption": "A"
    },
    {
      "questionNumber": "Question 8",
      "image": "https://static.pw.live/5b09189f7285894d9130ccd0/f99e55ba-963d-42c2-985d-d3ee1a5067f0.png",
      "correctOption": "B"
    },
    {
      "questionNumber": "Question 9",
      "image": "https://static.pw.live/5b09189f7285894d9130ccd0/58a9e5af-b15a-437f-888e-63cf8a6d72f8.png",
      "correctOption": "C"
    }
  ],
  "CHEMISTRY": [
    {
      "questionNumber": "Question 1",
      "image": "https://static.pw.live/5b09189f7285894d9130ccd0/ee9f972c-2ebe-4b77-b591-95fda15e9030.png",
      "correctOption": "C"
    }
  ]
};

function Results() {
  const [results, setResults] = useState([]);

  useEffect(() => {
    const dbRef = ref(getDatabase(db), 'quiz_results');
    onValue(dbRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setResults(Object.entries(data).map(([id, { answers, timestamp }]) => ({
          id,
          answers,
          timestamp
        })));
      }
    });
  }, []);

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
