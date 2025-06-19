import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useParams, useLocation } from 'react-router-dom';
import CardList from './components/CardList';
import QuizBox from './components/QuizBox';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';

const subjectUrls = {
  biology: 'https://itzfew.github.io/NEET-Questions/data/biology.json',
  chemistry: 'https://itzfew.github.io/NEET-Questions/data/chemistry.json',
  physics: 'https://itzfew.github.io/NEET-Questions/data/physics.json',
};

const App = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [fullData, setFullData] = useState([]);
  const [currentQuestions, setCurrentQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [error, setError] = useState('');

  // Extract URL parameters
  const { subject, chapter, unit, topic } = useParams();
  // Extract quiz type from query parameter
  const queryParams = new URLSearchParams(location.search);
  const quizType = queryParams.get('type')?.toLowerCase() || '';

  useEffect(() => {
    if (subject) {
      fetch(subjectUrls[subject.toLowerCase()])
        .then((res) => {
          if (!res.ok) throw new Error('Failed to fetch data');
          return res.json();
        })
        .then((data) => {
          setFullData(data);
          setError('');
        })
        .catch(() => {
          setError('Error loading data. Please try again.');
        });
    }
  }, [subject]);

  const getChapterName = (q) =>
    q['Chapter Name'] ||
    q['chapter name'] ||
    q['Unique Chapter Name'] ||
    q.topic_name.split('>>')[0]?.trim() ||
    '';

  const getUnitName = (q) => q.topic_name.split('>>')[1]?.trim() || '';
  const getTopicName = (q) => q.topic_name.split('>>')[2]?.trim() || '';

  const getListItems = (type) => {
    if (type === 'subjects') return Object.keys(subjectUrls);
    if (type === 'chapters')
      return [...new Set(fullData.map(getChapterName))].filter(Boolean).sort();
    if (type === 'units')
      return [
        ...new Set(
          fullData
            .filter((q) => getChapterName(q) === chapter)
            .map(getUnitName)
        ),
      ]
        .filter(Boolean)
        .sort();
    if (type === 'topics')
      return [
        ...new Set(
          fullData
            .filter(
              (q) =>
                getChapterName(q) === chapter && getUnitName(q) === unit
            )
            .map(getTopicName)
        ),
      ]
        .filter(Boolean)
        .sort();
    if (type === 'quizTypes')
      return [
        ...new Set(
          fullData
            .filter(
              (q) =>
                getChapterName(q) === chapter &&
                getUnitName(q) === unit &&
                getTopicName(q) === topic
            )
            .map((q) => q.quiz_type)
        ),
      ]
        .filter(Boolean)
        .sort();
    return [];
  };

  const handleSelect = (type, value) => {
    if (type === 'subject') navigate(`/${value}`);
    else if (type === 'chapter') navigate(`/${subject}/${value}`);
    else if (type === 'unit') navigate(`/${subject}/${chapter}/${value}`);
    else if (type === 'topic') navigate(`/${subject}/${chapter}/${unit}/${value}`);
    else if (type === 'quizType')
      navigate(`/${subject}/${chapter}/${unit}/${topic}?type=${value.toLowerCase()}`);
  };

  const handleBack = () => {
    if (quizType) navigate(`/${subject}/${chapter}/${unit}/${topic}`);
    else if (topic) navigate(`/${subject}/${chapter}/${unit}`);
    else if (unit) navigate(`/${subject}/${chapter}`);
    else if (chapter) navigate(`/${subject}`);
    else if (subject) navigate('/');
  };

  const handleNext = () => {
    if (currentIndex < currentQuestions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      navigate(`/${subject}/${chapter}/${unit}/${topic}`);
      setCurrentQuestions([]);
      setCurrentIndex(0);
    }
  };

  // Load questions when quizType is selected
  useEffect(() => {
    if (subject && chapter && unit && topic && quizType) {
      const questions = fullData.filter(
        (q) =>
          getChapterName(q) === chapter &&
          getUnitName(q) === unit &&
          getTopicName(q) === topic &&
          q.quiz_type.toLowerCase() === quizType
      );
      setCurrentQuestions(questions);
      setCurrentIndex(0);
    }
  }, [subject, chapter, unit, topic, quizType, fullData]);

  const renderView = () => {
    if (error) return <p className="text-red-600 text-center">{error}</p>;

    if (!subject)
      return (
        <CardList
          items={getListItems('subjects').map(
            (s) => s.charAt(0).toUpperCase() + s.slice(1)
          )}
          onSelect={(item) => handleSelect('subject', item.toLowerCase())}
          title="Subjects"
        />
      );
    if (!chapter)
      return (
        <CardList
          items={getListItems('chapters')}
          onSelect={(item) => handleSelect('chapter', item)}
          title="Chapters"
        />
      );
    if (!unit)
      return (
        <CardList
          items={getListItems('units')}
          onSelect={(item) => handleSelect('unit', item)}
          title="Units"
        />
      );
    if (!topic)
      return (
        <CardList
          items={getListItems('topics')}
          onSelect={(item) => handleSelect('topic', item)}
          title="Topics"
        />
      );
    if (!quizType)
      return (
        <CardList
          items={getListItems('quizTypes').map(
            (t) => t.charAt(0).toUpperCase() + t.slice(1)
          )}
          onSelect={(item) => handleSelect('quizType', item.toLowerCase())}
          title="Quiz Types"
        />
      );
    if (currentQuestions.length > 0)
      return (
        <QuizBox
          question={currentQuestions[currentIndex]}
          questionNumber={currentIndex + 1}
          totalQuestions={currentQuestions.length}
          onNext={handleNext}
        />
      );
    return <p className="text-red-600 text-center">No questions found for selected filters.</p>;
  };

  return (
    <div className="container mx-auto p-6 bg-white rounded-2xl shadow-2xl min-h-screen">
      <h2 className="text-3xl font-bold text-center text-blue-900 mb-6">
        NEET Topic-Wise Quiz Explorer
      </h2>
      {subject && (
        <button
          onClick={handleBack}
          className="bg-gray-500 text-white px-4 py-2 rounded-lg mb-6 hover:bg-gray-600 transition duration-300"
        >
          <FontAwesomeIcon icon={faArrowLeft} className="mr-2" /> Back
        </button>
      )}
      {renderView()}
    </div>
  );
};

export default App;
