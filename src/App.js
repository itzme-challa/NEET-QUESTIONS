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
      // For /play?id=... route, find the question by ID
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
            setError('Error loading data. Please try again.');
          });
      }
      return [...new Set(fullData.map(getChapterName))].filter(Boolean).sort();
    }
    if (type === 'units' && params.chapter)
      return [
        ...new Set(
          fullData
            .filter((q) => getChapterName(q) === params.chapter)
            .map(getUnitName)
        ),
      ]
        .filter(Boolean)
        .sort();
    if (type === 'topics' && params.chapter && params.unit)
      return [
        ...new Set(
          fullData
            .filter(
              (q) =>
                getChapterName(q) === params.chapter &&
                getUnitName(q) === params.unit
            )
            .map(getTopicName)
        ),
      ]
        .filter(Boolean)
        .sort();
    if (type === 'quizTypes' && params.chapter && params.unit && params.topic)
      return [
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
      ]
        .filter(Boolean)
        .sort();
    return [];
  };

  const handleSelect = (type, value, currentParams) => {
    const newParams = { ...currentParams, [type]: value };
    if (type === 'subject') navigate(`/${value}/chapters`);
    if (type === 'chapter') navigate(`/${currentParams.subject}/${value}/units`);
    if (type === 'unit') navigate(`/${currentParams.subject}/${currentParams.chapter}/${value}/topics`);
    if (type === 'topic')
      navigate(`/${currentParams.subject}/${currentParams.chapter}/${currentParams.unit}/${value}/quizTypes`);
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
        `/${currentParams.subject}/${currentParams.chapter}/${currentParams.unit}/${currentParams.topic}/${value}`
      );
    }
  };

  const handleBack = (currentParams, view) => {
    if (view === 'quiz') {
      navigate(`/${currentParams.subject}/${currentParams.chapter}/${currentParams.unit}/${currentParams.topic}/quizTypes`);
      setCurrentQuestions([]);
    } else if (view === 'quizTypes') {
      navigate(`/${currentParams.subject}/${currentParams.chapter}/${currentParams.unit}/topics`);
    } else if (view === 'topics') {
      navigate(`/${currentParams.subject}/${currentParams.chapter}/units`);
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
              if (i === 1) acc.subject = part;
              if (i === 3) acc.chapter = part;
              if (i === 5) acc.unit = part;
              if (i === 7) acc.topic = part;
              return acc;
            },
            {}
          );
        navigate(`/${subject}/${chapter}/${unit}/${topic}/quizTypes`);
        setCurrentQuestions([]);
      }
    }
  };

  const SelectionPage = ({ type }) => {
    const params = useParams();
    const items =
      type === 'subjects'
        ? getListItems('subjects')
        : type === 'chapters'
        ? getListItems('chapters', { subject: params.subject })
        : type === 'units'
        ? getListItems('units', { subject: params.subject, chapter: params.chapter })
        : type === 'topics'
        ? getListItems('topics', {
            subject: params.subject,
            chapter: params.chapter,
            unit: params.unit,
          })
        : getListItems('quizTypes', {
            subject: params.subject,
            chapter: params.chapter,
            unit: params.unit,
            topic: params.topic,
          });
    return (
      <div className="container mx-auto p-6 bg-white rounded-2xl shadow-2xl min-h-screen">
        <h2 className="text-3xl font-bold text-center text-blue-900 mb-6">
          NEET Topic-Wise Quiz Explorer
        </h2>
        {type !== 'subjects' && (
          <button
            onClick={() => handleBack(params, type)}
            className="bg-gray-500 text-white px-4 py-2 rounded-lg mb-6 hover:bg-gray-600 transition duration-300"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="mr-2" /> Back
          </button>
        )}
        {error && <p className="text-red-600 text-center">{error}</p>}
        <CardList
          items={items.map((s) => s.charAt(0).toUpperCase() + s.slice(1))}
          onSelect={(item) => handleSelect(type.slice(0, -1), item.toLowerCase(), params)}
          title={type.charAt(0).toUpperCase() + type.slice(1)}
        />
      </div>
    );
  };

  const QuizPage = () => {
    const params = useParams();
    useEffect(() => {
      if (!currentQuestions.length && params.quizType) {
        const questions = fullData.filter(
          (q) =>
            getChapterName(q) === params.chapter &&
            getUnitName(q) === params.unit &&
            getTopicName(q) === params.topic &&
            q.quiz_type === params.quizType
        );
        setCurrentQuestions(questions);
        setCurrentIndex(0);
      }
    }, [params]);
    return (
      <div className="container mx-auto p-6 bg-white rounded-2xl shadow-2xl min-h-screen">
        <h2 className="text-3xl font-bold text-center text-blue-900 mb-6">
          NEET Topic-Wise Quiz Explorer
        </h2>
        <button
          onClick={() => handleBack(params, 'quiz')}
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
