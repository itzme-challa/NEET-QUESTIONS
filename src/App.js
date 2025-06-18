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

  // Normalize strings for case-insensitive comparison
  const normalizeString = (str) => (str || '').toLowerCase().trim();

  // Fetch data when subject changes
  useEffect(() => {
    if (subject && subjectUrls[normalizeString(subject)]) {
      setLoading(true);
      setError('');
      fetch(subjectUrls[normalizeString(subject)])
        .then((res) => {
          if (!res.ok) throw new Error(`Failed to fetch ${subject} data`);
          return res.json();
        })
        .then((data) => {
          setFullData(data);
          setLoading(false);
          console.log(`Fetched ${subject} data:`, data.slice(0, 5)); // Debug: Log first 5 entries
        })
        .catch((err) => {
          setError(err.message);
          setLoading(false);
          setFullData([]);
        });
    } else if (subject && !subjectUrls[normalizeString(subject)]) {
      setError('Invalid subject');
      setFullData([]);
      setCurrentQuestions([]);
    } else {
      setFullData([]);
      setCurrentQuestions([]);
      setLoading(false);
      setError('');
    }
  }, [subject]);

  // Filter questions when all parameters are present
  useEffect(() => {
    if (subject && chapter && unit && topic && quizType && fullData.length > 0) {
      const decodedChapter = chapter.replace(/_/g, ' ');
      const decodedUnit = unit.replace(/_/g, ' ');
      const decodedTopic = topic.replace(/_/g, ' ');
      const questions = fullData.filter((q) => {
        const match =
          normalizeString(getChapterName(q)) === normalizeString(decodedChapter) &&
          normalizeString(getUnitName(q)) === normalizeString(decodedUnit) &&
          normalizeString(getTopicName(q)) === normalizeString(decodedTopic) &&
          normalizeString(q.quiz_type) === normalizeString(quizType);
        return match;
      });
      setCurrentQuestions(questions);
      console.log(`Filtered questions for ${subject}/${chapter}/${unit}/${topic}/${quizType}:`, questions.length); // Debug
      if (questions.length === 0) {
        setError('No questions found for the selected filters.');
      }
      if (questions.length > 0 && (questionId >= questions.length || questionId < 0)) {
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
    q['chapter'] || // Fallback to other possible fields
    q.topic_name?.split('>>')[0]?.trim() ||
    '';

  const getUnitName = (q) =>
    q.topic_name?.split('>>')[1]?.trim() ||
    q.unit_name || // Fallback to other possible fields
    q.unit ||
    '';

  const getTopicName = (q) =>
    q.topic_name?.split('>>')[2]?.trim() ||
    q.topic || // Fallback to other possible fields
    q.topic_name?.split('>>')[1]?.trim() || // Fallback to unit if no topic
    '';

  const getListItems = (type) => {
    if (type === 'subjects') {
      return Object.keys(subjectUrls);
    }
    if (!fullData.length) return [];

    if (type === 'chapters') {
      const chapters = [...new Set(fullData.map(getChapterName))].filter(Boolean).sort();
      console.log(`Chapters for ${subject}:`, chapters); // Debug
      if (!chapters.length) setError(`No chapters found for ${subject}.`);
      return chapters;
    }
    if (type === 'units' && chapter) {
      const decodedChapter = chapter.replace(/_/g, ' ');
      const units = [
        ...new Set(
          fullData
            .filter((q) => normalizeString(getChapterName(q)) === normalizeString(decodedChapter))
            .map(getUnitName)
        ),
      ].filter(Boolean).sort();
      console.log(`Units for ${subject}/${chapter}:`, units); // Debug
      if (!units.length) setError(`No units found for chapter ${decodedChapter} in ${subject}.`);
      return units;
    }
    if (type === 'topics' && chapter && unit) {
      const decodedChapter = chapter.replace(/_/g, ' ');
      const decodedUnit = unit.replace(/_/g, ' ');
      const topics = [
        ...new Set(
          fullData
            .filter(
              (q) =>
                normalizeString(getChapterName(q)) === normalizeString(decodedChapter) &&
                normalizeString(getUnitName(q)) === normalizeString(decodedUnit)
            )
            .map(getTopicName)
        ),
      ].filter(Boolean).sort();
      console.log(`Topics for ${subject}/${chapter}/${unit}:`, topics); // Debug
      if (!topics.length) setError(`No topics found for unit ${decodedUnit} in ${subject}/${decodedChapter}.`);
      return topics;
    }
    if (type === 'quizTypes' && chapter && unit && topic) {
      const decodedChapter = chapter.replace(/_/g, ' ');
      const decodedUnit = unit.replace(/_/g, ' ');
      const decodedTopic = topic.replace(/_/g, ' ');
      const quizTypes = [
        ...new Set(
          fullData
            .filter(
              (q) =>
                normalizeString(getChapterName(q)) === normalizeString(decodedChapter) &&
                normalizeString(getUnitName(q)) === normalizeString(decodedUnit) &&
                normalizeString(getTopicName(q)) === normalizeString(decodedTopic)
            )
            .map((q) => q.quiz_type)
        ),
      ].filter(Boolean).sort();
      console.log(`Quiz types for ${subject}/${chapter}/${unit}/${topic}:`, quizTypes); // Debug
      if (!quizTypes.length) setError(`No quiz types found for topic ${decodedTopic}.`);
      return quizTypes;
    }
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
        chapter={chapter?.replace(/_/g, ' ')}
        unit={unit?.replace(/_/g, ' ')}
        topic={topic?.replace(/_/g, ' ')}
        quizType={quizType}
        questionId={questionId + 1}
      />
      {error && <p className="text-red-600 text-center">{error}</p>}
      {loading && <p className="text-gray-600 text-center">Loading...</p>}
      {!loading && currentView === 'subjects' && (
        <CardList
          items={getListItems('subjects').map(
            (s) => s.charAt(0).toUpperCase() + s.slice(1)
          )}
          onSelect={(item) => handleSelect('subject', item.toLowerCase())}
          title="Subjects"
        />
      )}
      {!loading && currentView === 'chapters' && (
        <CardList
          items={getListItems('chapters')}
          onSelect={(item) => handleSelect('chapter', item)}
          title="Chapters"
        />
      )}
      {!loading && currentView === 'units' && (
        <CardList
          items={getListItems('units')}
          onSelect={(item) => handleSelect('unit', item)}
          title="Units"
        />
      )}
      {!loading && currentView === 'topics' && (
        <CardList
          items={getListItems('topics')}
          onSelect={(item) => handleSelect('topic', item)}
          title="Topics"
        />
      )}
      {!loading && currentView === 'quizTypes' && (
        <CardList
          items={getListItems('quizTypes').map(
            (t) => t.charAt(0).toUpperCase() + t.slice(1)
          )}
          onSelect={(item) => handleSelect('quizType', item.toLowerCase())}
          title="Quiz Types"
        />
      )}
      {!loading && currentView === 'quiz' && currentQuestions.length > 0 && (
        <QuizBox
          question={currentQuestions[questionId] || currentQuestions[0]}
          questionNumber={questionId + 1}
          totalQuestions={currentQuestions.length}
          onNext={handleNext}
        />
      )}
      {!loading && currentView === 'quiz' && currentQuestions.length === 0 && (
        <p className="text-red-600 text-center">No questions found for selected filters.</p>
      )}
    </div>
  );
};

export default App;
