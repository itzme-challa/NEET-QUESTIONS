import React, { useState, useEffect } from 'react';
import { Routes, Route, useParams, useNavigate, useLocation } from 'react-router-dom';
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
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const id = params.get('id');
    if (location.pathname === '/play' && id) {
      const subject = Object.keys(subjectUrls).find((s) =>
        fullData.some((q) => q.id === id && subjectUrls[s].includes(q.subject))
      );
      if (subject && !fullData.length) {
        fetch(subjectUrls[subject])
          .then((res) => {
            if (!res.ok) throw new Error('Failed to fetch data');
            return res.json();
          })
          .then((data) => {
            setFullData(data);
            const question = data.find((q) => q.id === id);
            if (question) {
              setCurrentQuestions([question]);
              setCurrentIndex(0);
            } else {
              setError('Question not found.');
            }
          })
          .catch(() => {
            setError('Error loading data. Please try again.');
          });
      }
    }
  }, [location, fullData]);

  const getChapterName = (q) =>
    q['Chapter Name'] ||
    q['chapter name'] ||
    q['Unique Chapter Name'] ||
    q.topic_name.split('>>')[0]?.trim() ||
    '';

  const getUnitName = (q) => q.topic_name.split('>>')[1]?.trim() || '';
  const getTopicName = (q) => q.topic_name.split('>>')[2]?.trim() || '';

  const getListItems = (type, params = {}) => {
    if (type === 'subjects') return Object.keys(subjectUrls);
    if (type === 'chapters' && params.subject) {
      if (!fullData.length) {
        fetch(subjectUrls[params.subject])
          .then((res) => {
            if (!res.ok) throw new Error('Failed to fetch data');
            return res.json();
          })
          .then((data) => {
            setFullData(data);
            setError('');
          })
          .catch(() => {
            setError(`Error loading ${params.subject} data. Please try again.`);
          });
      }
      const chapters = [...new Set(fullData.map(getChapterName))].filter(Boolean).sort();
      if (!chapters.length) setError(`No chapters found for ${params.subject}.`);
      return chapters;
    }
    if (type === 'units' && params.subject && params.chapter) {
      const units = [
        ...new Set(
          fullData
            .filter((q) => getChapterName(q) === params.chapter)
            .map(getUnitName)
        ),
      ].filter(Boolean).sort();
      if (!units.length) setError(`No units found for chapter ${params.chapter} in ${params.subject}.`);
      return units;
    }
    if (type === 'topics' && params.subject && params.chapter && params.unit) {
      const topics = [
        ...new Set(
          fullData
            .filter(
              (q) =>
                getChapterName(q) === params.chapter &&
                getUnitName(q) === params.unit
            )
            .map(getTopicName)
        ),
      ].filter(Boolean).sort();
      if (!topics.length) setError(`No topics found for unit ${params.unit} in chapter ${params.chapter}.`);
      return topics;
    }
    if (type === 'quizTypes' && params.subject && params.chapter && params.unit && params.topic) {
      const quizTypes = [
        ...new Set(
          fullData
            .filter(
              (q) =>
                getChapterName(q) === params.chapter &&
                getUnitName(q) === params.unit &&
                getTopicName(q) === params.topic
            )
            .map((q) => q.quiz_type)
        ),
      ].filter(Boolean).sort();
      if (!quizTypes.length) setError(`No quiz types found for topic ${params.topic}.`);
      return quizTypes;
    }
    return [];
  };

  const handleSelect = (type, value, currentParams) => {
    const newParams = { ...currentParams, [type]: value };
    if (type === 'subject') navigate(`/${value}/chapters`);
    if (type === 'chapter') navigate(`/${currentParams.subject}/${encodeURIComponent(value)}/units`);
    if (type === 'unit') navigate(`/${currentParams.subject}/${encodeURIComponent(currentParams.chapter)}/${encodeURIComponent(value)}/topics`);
    if (type === 'topic')
      navigate(`/${currentParams.subject}/${encodeURIComponent(currentParams.chapter)}/${encodeURIComponent(currentParams.unit)}/${encodeURIComponent(value)}/quizTypes`);
    if (type === 'quizType') {
      const questions = fullData.filter(
        (q) =>
          getChapterName(q) === currentParams.chapter &&
          getUnitName(q) === currentParams.unit &&
          getTopicName(q) === currentParams.topic &&
          (!value || q.quiz_type === value)
      );
      setCurrentQuestions(questions);
      setCurrentIndex(0);
      navigate(
        `/${currentParams.subject}/${encodeURIComponent(currentParams.chapter)}/${encodeURIComponent(currentParams.unit)}/${encodeURIComponent(currentParams.topic)}/${encodeURIComponent(value)}`
      );
    }
  };

  const handleBack = (currentParams, view) => {
    if (view === 'quiz') {
      navigate(`/${currentParams.subject}/${encodeURIComponent(currentParams.chapter)}/${encodeURIComponent(currentParams.unit)}/${encodeURIComponent(currentParams.topic)}/quizTypes`);
      setCurrentQuestions([]);
    } else if (view === 'quizTypes') {
      navigate(`/${currentParams.subject}/${encodeURIComponent(currentParams.chapter)}/${encodeURIComponent(currentParams.unit)}/topics`);
    } else if (view === 'topics') {
      navigate(`/${currentParams.subject}/${encodeURIComponent(currentParams.chapter)}/units`);
    } else if (view === 'units') {
      navigate(`/${currentParams.subject}/chapters`);
    } else if (view === 'chapters') {
      navigate('/');
      setFullData([]);
    }
  };

  const handleNext = () => {
    if (currentIndex < currentQuestions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      const params = new URLSearchParams(location.search);
      const id = params.get('id');
      if (id) {
        navigate('/');
      } else {
        const { subject, chapter, unit, topic } = location.pathname
          .split('/')
          .reduce(
            (acc, part, i) => {
              if (i === 1) acc.subject = decodeURIComponent(part);
              if (i === 3) acc.chapter = decodeURIComponent(part);
              if (i === 5) acc.unit = decodeURIComponent(part);
              if (i === 7) acc.topic = decodeURIComponent(part);
              return acc;
            },
            {}
          );
        navigate(`/${subject}/${encodeURIComponent(chapter)}/${encodeURIComponent(unit)}/${encodeURIComponent(topic)}/quizTypes`);
        setCurrentQuestions([]);
      }
    }
  };

  const SelectionPage = ({ type }) => {
    const params = useParams();
    const decodedParams = {
      subject: params.subject,
      chapter: params.chapter ? decodeURIComponent(params.chapter) : undefined,
      unit: params.unit ? decodeURIComponent(params.unit) : undefined,
      topic: params.topic ? decodeURIComponent(params.topic) : undefined,
    };
    const items =
      type === 'subjects'
        ? getListItems('subjects')
        : type === 'chapters'
        ? getListItems('chapters', { subject: decodedParams.subject })
        : type === 'units'
        ? getListItems('units', { subject: decodedParams.subject, chapter: decodedParams.chapter })
        : type === 'topics'
        ? getListItems('topics', {
            subject: decodedParams.subject,
            chapter: decodedParams.chapter,
            unit: decodedParams.unit,
          })
        : getListItems('quizTypes', {
            subject: decodedParams.subject,
            chapter: decodedParams.chapter,
            unit: decodedParams.unit,
            topic: decodedParams.topic,
          });
    return (
      <div className="container mx-auto p-6 bg-white rounded-2xl shadow-2xl min-h-screen">
        <h2 className="text-3xl font-bold text-center text-blue-900 mb-6">
          NEET Topic-Wise Quiz Explorer
        </h2>
        {type !== 'subjects' && (
          <button
            onClick={() => handleBack(decodedParams, type)}
            className="bg-gray-500 text-white px-4 py-2 rounded-lg mb-6 hover:bg-gray-600 transition duration-300"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="mr-2" /> Back
          </button>
        )}
        {error && <p className="text-red-600 text-center">{error}</p>}
        {items.length > 0 ? (
          <CardList
            items={items.map((s) => s.charAt(0).toUpperCase() + s.slice(1))}
            onSelect={(item) => handleSelect(type.slice(0, -1), item.toLowerCase(), decodedParams)}
            title={type.charAt(0).toUpperCase() + type.slice(1)}
          />
        ) : (
          <p className="text-red-600 text-center">No {type} available.</p>
        )}
      </div>
    );
  };

  const QuizPage = () => {
    const params = useParams();
    const decodedParams = {
      subject: params.subject,
      chapter: decodeURIComponent(params.chapter),
      unit: decodeURIComponent(params.unit),
      topic: decodeURIComponent(params.topic),
      quizType: decodeURIComponent(params.quizType),
    };
    useEffect(() => {
      if (!currentQuestions.length && decodedParams.quizType) {
        const questions = fullData.filter(
          (q) =>
            getChapterName(q) === decodedParams.chapter &&
            getUnitName(q) === decodedParams.unit &&
            getTopicName(q) === decodedParams.topic &&
            q.quiz_type === decodedParams.quizType
        );
        setCurrentQuestions(questions);
        setCurrentIndex(0);
        if (!questions.length) {
          setError(`No questions found for ${decodedParams.quizType} in ${decodedParams.topic}.`);
        }
      }
    }, [decodedParams]);
    return (
      <div className="container mx-auto p-6 bg-white rounded-2xl shadow-2xl min-h-screen">
        <h2 className="text-3xl font-bold text-center text-blue-900 mb-6">
          NEET Topic-Wise Quiz Explorer
        </h2>
        <button
          onClick={() => handleBack(decodedParams, 'quiz')}
          className="bg-gray-500 text-white px-4 py-2 rounded-lg mb-6 hover:bg-gray-600 transition duration-300"
        >
          <FontAwesomeIcon icon={faArrowLeft} className="mr-2" /> Back
        </button>
        {error && <p className="text-red-600 text-center">{error}</p>}
        {currentQuestions.length > 0 ? (
          <QuizBox
            question={currentQuestions[currentIndex]}
            questionNumber={currentIndex + 1}
            totalQuestions={currentQuestions.length}
            onNext={handleNext}
          />
        ) : (
          <p className="text-red-600 text-center">No questions found for selected filters.</p>
        )}
      </div>
    );
  };

  const PlayPage = () => {
    return (
      <div className="container mx-auto p-6 bg-white rounded-2xl shadow-2xl min-h-screen">
        <h2 className="text-3xl font-bold text-center text-blue-900 mb-6">
          NEET Topic-Wise Quiz Explorer
        </h2>
        <button
          onClick={() => navigate('/')}
          className="bg-gray-500 text-white px-4 py-2 rounded-lg mb-6 hover:bg-gray-600 transition duration-300"
        >
          <FontAwesomeIcon icon={faArrowLeft} className="mr-2" /> Back
        </button>
        {error && <p className="text-red-600 text-center">{error}</p>}
        {currentQuestions.length > 0 ? (
          <QuizBox
            question={currentQuestions[currentIndex]}
            questionNumber={currentIndex + 1}
            totalQuestions={currentQuestions.length}
            onNext={handleNext}
          />
        ) : (
          <p className="text-red-600 text-center">Loading question...</p>
        )}
      </div>
    );
  };

  return (
    <Routes>
      <Route path="/" element={<SelectionPage type="subjects" />} />
      <Route path="/:subject/chapters" element={<SelectionPage type="chapters" />} />
      <Route path="/:subject/:chapter/units" element={<SelectionPage type="units" />} />
      <Route path="/:subject/:chapter/:unit/topics" element={<SelectionPage type="topics" />} />
      <Route
        path="/:subject/:chapter/:unit/:topic/quizTypes"
        element={<SelectionPage type="quizTypes" />}
      />
      <Route
        path="/:subject/:chapter/:unit/:topic/:quizType"
        element={<QuizPage />}
      />
      <Route path="/play" element={<PlayPage />} />
    </Routes>
  );
};

export default App;
