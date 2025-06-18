import React, { useState } from 'react';

const QuizBox = ({ question, questionNumber, totalQuestions, onNext }) => {
  const [selected, setSelected] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const handleAnswer = (option) => {
    setSelected(option);
    setShowExplanation(true);
  };

  const renderOptions = () => {
    const options = [
      question.option_a,
      question.option_b,
      question.option_c,
      question.option_d,
    ].filter(Boolean);
    return options.map((option, index) => (
      <button
        key={index}
        onClick={() => handleAnswer(option)}
        disabled={selected}
        className={`w-full p-3 mb-2 rounded-lg border text-left transition duration-300 ${
          selected
            ? option === question.answer
              ? 'bg-green-100 border-green-500 text-green-800'
              : selected === option
              ? 'bg-red-100 border-red-500 text-red-800'
              : 'bg-white border-gray-200'
            : 'bg-white border-gray-200 hover:bg-gray-50'
        }`}
      >
        {option}
      </button>
    ));
  };

  if (!question) return <p className="text-red-600 text-center">Question not found.</p>;

  return (
    <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Question {questionNumber} of {totalQuestions}
      </h3>
      <div className="text-gray-900 text-xl mb-4">{question.question}</div>
      {question.quiz_type === 'mcq' && <div className="options">{renderOptions()}</div>}
      {question.quiz_type === 'flashcard' && (
        <p className="text-gray-800">
          <strong>Answer:</strong> {question.answer}
        </p>
      )}
      {question.quiz_type === 'fillup' && (
        <p className="text-gray-800">
          <strong>Answer:</strong> {question.answer}
        </p>
      )}
      {question.quiz_type === 'video' && (
        <iframe
          width="100%"
          height="300"
          src={`https://www.youtube.com/embed/${question.question}`}
          allowFullScreen
          className="rounded-lg"
        ></iframe>
      )}
      {question.quiz_type === 'match' && (
        <div>
          <p className="text-gray-800">
            <strong>Answer:</strong> {question.answer}
          </p>
          {question.option_a && <p>Option A: {question.option_a}</p>}
          {question.option_b && <p>Option B: {question.option_b}</p>}
        </div>
      )}
      {question.explanation && (showExplanation || question.quiz_type !== 'mcq') && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg text-gray-700">
          {question.explanation}
        </div>
      )}
      <button
        onClick={onNext}
        className="mt-6 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-300"
      >
        {questionNumber < totalQuestions ? 'Next' : 'Finish'}
      </button>
    </div>
  );
};

export default QuizBox;
