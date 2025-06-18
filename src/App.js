import React, { useState, useEffect } from 'react';
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
  const [fullData, setFullData] = useState([]);
  const [currentQuestions, setCurrentQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentSelection, setCurrentSelection] = useState({
    subject: '',
    chapter: '',
    unit: '',
    topic: '',
    quizType: '',
  });
  const [error, setError] = useState('');
  const [view, setView] = useState('subjects');

  useEffect(() => {
    if (currentSelection.subject) {
      fetch(subjectUrls[currentSelection.subject])
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
  }, [currentSelection.subject]);

  const getChapterName = (q) =>
    (q['Chapter Name'] ||
     q['chapter name'] ||
     q['Unique Chapter Name'] ||
     q.topic_name.split('>>')[0]?.trim() ||
     '').toLowerCase();

  const getUnitName = (q) => {
    const parts = q.topic_name.split('>>');
    return parts[1]?.trim() || q.unit_name || '';
  };

  const getTopicName = (q) => {
    const parts = q.topic_name.split('>>');
    return parts[2]?.trim() || q.topic || '';
  };

  const getListItems = (type) => {
    if (type === 'subjects') return Object.keys(subjectUrls);
    if (type === 'chapters') {
      const chapters = [...new Set(fullData.map(getChapterName))].filter(Boolean).sort();
      if (!chapters.length) setError(`No chapters found for ${currentSelection.subject}.`);
      return chapters;
    }
    if (type === 'units') {
      const units = [
        ...new Set(
          fullData
            .filter((q) => getChapterName(q) === currentSelection.chapter.toLowerCase())
            .map(getUnitName)
        ),
      ].filter(Boolean).sort();
      if (!units.length) {
        setError(`No units found for chapter ${currentSelection.chapter} in ${currentSelection.subject}.`);
      }
      return units;
    }
    if (type === 'topics') {
      const topics = [
        ...new Set(
          fullData
            .filter(
              (q) =>
                getChapterName(q) === currentSelection.chapter.toLowerCase() &&
                getUnitName(q).toLowerCase() === currentSelection.unit.toLowerCase()
            )
            .map(getTopicName)
        ),
      ].filter(Boolean).sort();
      if (!topics.length) {
        setError(`No topics found for unit ${currentSelection.unit} in chapter ${currentSelection.chapter}.`);
      }
      return topics;
    }
    if (type === 'quizTypes') {
      const quizTypes = [
        ...new Set(
          fullData
            .filter(
              (q) =>
                getChapterName(q) === currentSelection.chapter.toLowerCase() &&
                getUnitName(q).toLowerCase() === currentSelection.unit.toLowerCase() &&
                getTopicName(q).toLowerCase() === currentSelection.topic.toLowerCase()
            )
            .map((q) => q.quiz_type)
        ),
      ].filter(Boolean).sort();
      if (!quizTypes.length) {
        setError(`No quiz types found for topic ${currentSelection.topic}.`);
      }
      return quizTypes;
    }
    return [];
  };

  const handleSelect = (type, value) => {
    setCurrentSelection((prev) => ({
      ...prev,
      [type]: value,
    }));
    setError('');
    setView(
      type === 'subject'
        ? 'chapters'
        : type === 'chapter'
        ? 'units'
        : type === 'unit'
        ? 'topics'
        : type === 'topic'
        ? 'quizTypes'
        : 'quiz'
    );
    if (type === 'quizType') {
      const questions = fullData.filter(
        (q) =>
          getChapterName(q) === currentSelection.chapter.toLowerCase() &&
          getUnitName(q).toLowerCase() === currentSelection.unit.toLowerCase() &&
          getTopicName(q).toLowerCase() === currentSelection.topic.toLowerCase() &&
          (!value || q.quiz_type.toLowerCase() === value.toLowerCase())
      );
      setCurrentQuestions(questions);
      setCurrentIndex(0);
      if (!questions.length) {
        setError(`No questions found for ${value} in ${currentSelection.topic}.`);
      }
    }
  };

  const handleBack = () => {
    setError('');
    if (view === 'quiz') {
      setView('quizTypes');
      setCurrentQuestions([]);
    } else if (view === 'quizTypes') {
      setView('topics');
      setCurrentSelection((prev) => ({ ...prev, quizType: '' }));
    } else if (view === 'topics') {
      setView('units');
      setCurrentSelection((prev) => ({ ...prev, topic: '' }));
    } else if (view === 'units') {
      setView('chapters');
      setCurrentSelection((prev) => ({ ...prev, unit: '' }));
    } else if (view === 'chapters') {
      setView('subjects');
      setCurrentSelection((prev) => ({ ...prev, subject: '', chapter: '' }));
      setFullData([]);
    }
  };

  const handleNext = () => {
    if (currentIndex < currentQuestions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setView('quizTypes');
      setCurrentQuestions([]);
      setCurrentIndex(0);
    }
  };

  return (
    <div className="container mx-auto p-6 bg-white rounded-2xl shadow-2xl min-h-screen">
      <h2 className="text-3xl font-bold text-center text-blue-900 mb-6">
        NEET Topic-Wise Quiz Explorer
      </h2>
      {view !== 'subjects' && (
        <button
          onClick={handleBack}
          className="bg-gray-500 text-white px-4 py-2 rounded-lg mb-6 hover:bg-gray-600 transition duration-300"
        >
          <FontAwesomeIcon icon={faArrowLeft} className="mr-2" /> Back
        </button>
      )}
      {error && <p className="text-red-600 text-center">{error}</p>}
      {view === 'subjects' && (
        <CardList
          items={getListItems('subjects').map((s) => s.charAt(0).toUpperCase() + s.slice(1))}
          onSelect={(item) => handleSelect('subject', item.toLowerCase())}
          title="Subjects"
        />
      )}
      {view === 'chapters' && (
        <CardList
          items={getListItems('chapters')}
          onSelect={(item) => handleSelect('chapter', item)}
          title="Chapters"
        />
      )}
      {view === 'units' && (
        <CardList
          items={getListItems('units')}
          onSelect={(item) => handleSelect('unit', item)}
          title="Units"
        />
      )}
      {view === 'topics' && (
        <CardList
          items={getListItems('topics')}
          onSelect={(item) => handleSelect('topic', item)}
          title="Topics"
        />
      )}
      {view === 'quizTypes' && (
        <CardList
          items={getListItems('quizTypes').map((t) => t.charAt(0).toUpperCase() + t.slice(1))}
          onSelect={(item) => handleSelect('quizType', item.toLowerCase())}
          title="Quiz Types"
        />
      )}
      {view === 'quiz' && currentQuestions.length > 0 && (
        <QuizBox
          question={currentQuestions[currentIndex]}
          questionNumber={currentIndex + 1}
          totalQuestions={currentQuestions.length}
          onNext={handleNext}
        />
      )}
      {view === 'quiz' && currentQuestions.length === 0 && (
        <p className="text-red-600 text-center">No questions found for selected filters.</ supplies
      )}
    </div>
  );
};

export default App;
