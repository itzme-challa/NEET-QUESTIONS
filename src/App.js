import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CardList from './components/CardList';
import QuizBox from './components/QuizBox';
import Breadcrumb from './components/Breadcrumb';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';

const subjectUrls = {
  biology: 'https://itzfew.github.io/NEET-Questions/data/biology.json',
  chemistry: 'https://itzfew.github.io/NEET-Questions/data/chemistry.json',
  physics: 'https://itzfew.github.io/NEET-Questions/data/physics.json',
};

const App = () => {
  const { subject, chapter, unit, topic, quizType } = useParams();
  const navigate = useNavigate();
  const questionId = window.location.hash ? parseInt(window.location.hash.slice(1)) - 1 : 0;

  const [fullData, setFullData] = useState([]);
  const [currentQuestions, setCurrentQuestions] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (subject && subjectUrls[subject.toLowerCase()]) {
      setLoading(true);
      fetch(subjectUrls[subject.toLowerCase()])
        .then((res) => {
          if (!res.ok) throw new Error('Failed to fetch data');
          return res.json();
        })
        .then((data) => {
          setFullData(data);
          setError('');
          setLoading(false);
        })
        .catch(() => {
          setError('Error loading data. Please try again.');
          setLoading(false);
        });
    } else {
      setFullData([]);
      setCurrentQuestions([]);
    }
  }, [subject]);

  useEffect(() => {
    if (subject && chapter && unit && topic && quizType && fullData.length > 0) {
      const questions = fullData.filter(
        (q) =>
          getChapterName(q) === chapter.replace(/_/g, ' ') &&
          getUnitName(q) === unit.replace(/_/g, ' ') &&
          getTopicName(q) === topic.replace(/_/g, ' ') &&
          q.quiz_type.toLowerCase() === quizType.toLowerCase()
      );
      setCurrentQuestions(questions);
      if (questionId >= questions.length || questionId < 0) {
        navigate(`/${subject}/${chapter}/${unit}/${topic}/${quizType}/#1`);
      }
    } else {
      setCurrentQuestions([]);
    }
  }, [fullData, subject, chapter, unit, topic, quizType, questionId, navigate]);

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
    if (type === 'chapters' && fullData.length > 0)
      return [...new Set(fullData.map(getChapterName))].filter(Boolean).sort();
    if (type === 'units' && fullData.length > 0)
      return [
        ...new Set(
          fullData
            .filter((q) => getChapterName(q) === chapter.replace(/_/g, ' '))
            .map(getUnitName)
        ),
      ]
        .filter(Boolean)
        .sort();
    if (type === 'topics' && fullData.length > 0)
      return [
        ...new Set(
          fullData
            .filter(
              (q) =>
                getChapterName(q) === chapter.replace(/_/g, ' ') &&
                getUnitName(q) === unit.replace(/_/g, ' ')
            )
            .map(getTopicName)
        ),
      ]
        .filter(Boolean)
        .sort();
    if (type === 'quizTypes' && fullData.length > 0)
      return [
        ...new Set(
          fullData
            .filter(
              (q) =>
                getChapterName(q) === chapter.replace(/_/g, ' ') &&
                getUnitName(q) === unit.replace(/_/g, ' ') &&
                getTopicName(q) === topic.replace(/_/g, ' ')
            )
            .map((q) => q.quiz_type)
        ),
      ]
        .filter(Boolean)
        .sort();
    return [];
  };

  const handleSelect = (type, value) => {
    const cleanValue = value.replace(/\s+/g, '_');
    if (type === 'subject') navigate(`/${cleanValue}`);
    else if (type === 'chapter') navigate(`/${subject}/${cleanValue}`);
    else if (type === 'unit') navigate(`/${subject}/${chapter}/${cleanValue}`);
    else if (type === 'topic')
      navigate(`/${subject}/${chapter}/${unit}/${cleanValue}`);
    else if (type === 'quizType')
      navigate(`/${subject}/${chapter}/${unit}/${topic}/${cleanValue}/#1`);
  };

  const handleBack = () => {
    if (quizType) navigate(`/${subject}/${chapter}/${unit}/${topic}`);
    else if (topic) navigate(`/${subject}/${chapter}/${unit}`);
    else if (unit) navigate(`/${subject}/${chapter}`);
    else if (chapter) navigate(`/${subject}`);
    else navigate('/');
  };

  const handleNext = () => {
    if (questionId < currentQuestions.length - 1) {
      navigate(
        `/${subject}/${chapter}/${unit}/${topic}/${quizType}/#${questionId + 2}`
      );
    } else {
      navigate(`/${subject}/${chapter}/${unit}/${topic}`);
    }
  };

  const currentView = quizType
    ? 'quiz'
    : topic
    ? 'quizTypes'
    : unit
    ? 'topics'
    : chapter
    ? 'units'
    : subject
    ? 'chapters'
    : 'subjects';

  return (
    <div className="container mx-auto p-6 bg-white rounded-2xl shadow-2xl min-h-screen">
      <h2 className="text-3xl font-bold text-center text-blue-900 mb-6">
        NEET Topic-Wise Quiz Explorer
      </h2>
      {currentView !== 'subjects' && (
        <button
          onClick={handleBack}
          className="bg-gray-500 text-white px-4 py-2 rounded-lg mb-6 hover:bg-gray-600 transition duration-300"
        >
          <FontAwesomeIcon icon={faArrowLeft} className="mr-2" /> Back
        </button>
      )}
      <Breadcrumb
        subject={subject}
        chapter={chapter}
        unit={unit}
        topic={topic}
        quizType={quizType}
        questionId={questionId + 1}
      />
      {error && <p className="text-red-600 text-center">{error}</p>}
      {loading && <p className="text-gray-600 text-center">Loading...</p>}
      {currentView === 'subjects' && (
        <CardList
          items={getListItems('subjects').map(
            (s) => s.charAt(0).toUpperCase() + s.slice(1)
          )}
          onSelect={(item) => handleSelect('subject', item.toLowerCase())}
          title="Subjects"
        />
      )}
      {currentView === 'chapters' && !loading && (
        <CardList
          items={getListItems('chapters')}
          onSelect={(item) => handleSelect('chapter', item)}
          title="Chapters"
        />
      )}
      {currentView === 'units' && !loading && (
        <CardList
          items={getListItems('units')}
          onSelect={(item) => handleSelect('unit', item)}
          title="Units"
        />
      )}
      {currentView === 'topics' && !loading && (
        <CardList
          items={getListItems('topics')}
          onSelect={(item) => handleSelect('topic', item)}
          title="Topics"
        />
      )}
      {currentView === 'quizTypes' && !loading && (
        <CardList
          items={getListItems('quizTypes').map(
            (t) => t.charAt(0).toUpperCase() + t.slice(1)
          )}
          onSelect={(item) => handleSelect('quizType', item.toLowerCase())}
          title="Quiz Types"
        />
      )}
      {currentView === 'quiz' && !loading && currentQuestions.length > 0 && (
        <QuizBox
          question={currentQuestions[questionId] || currentQuestions[0]}
          questionNumber={questionId + 1}
          totalQuestions={currentQuestions.length}
          onNext={handleNext}
        />
      )}
      {currentView === 'quiz' && !loading && currentQuestions.length === 0 && (
        <p className="text-red-600 text-center">No questions found for selected filters.</p>
      )}
    </div>
  );
};

export default App;
