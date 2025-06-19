  document.addEventListener('DOMContentLoaded', () => {
    // Initialize Firebase
    const firebaseConfig = {
      apiKey: "AIzaSyD54FxWUlPn03bxD0UnD0oxVcMkI9ovCeQ",
      authDomain: "community-604af.firebaseapp.com",
      databaseURL: "https://community-604af-default-rtdb.asia-southeast1.firebasedatabase.app",
      projectId: "community-604af",
      storageBucket: "community-604af.appspot.com",
      messagingSenderId: "735063146170",
      appId: "1:735063146170:web:725bce2c3c64afc0f30c83",
      measurementId: "G-7YD8RLH33Q"
    };

    firebase.initializeApp(firebaseConfig);
    const auth = firebase.auth();
    const database = firebase.database();
    const firestore = firebase.firestore();

    const state = {
      currentSubject: null,
      currentChapter: null,
      currentUnit: null,
      currentTopic: null,
      currentQuizType: null,
      questions: [],
      currentQuestionIndex: 0,
      score: 0,
      totalAnswered: 0,
      quizHistory: [],
      subjectData: { biology: [], chemistry: [], physics: [] },
      matchSelections: {},
      isDPP: false,
      isTest: false,
      dppId: null,
      testId: null,
      timeLimit: 60,
      startTime: null,
      userAnswers: {}
    };

    const elements = {
      subjectScreen: document.getElementById('subjectScreen'),
      chapterScreen: document.getElementById('chapterScreen'),
      unitScreen: document.getElementById('unitScreen'),
      topicScreen: document.getElementById('topicScreen'),
      quizTypeScreen: document.getElementById('quizTypeScreen'),
      quizScreen: document.getElementById('quizScreen'),
      resetBtn: document.getElementById('resetBtn'),
      backToSubjects: document.getElementById('backToSubjects'),
      backToChapters: document.getElementById('backToChapters'),
      backToUnits: document.getElementById('backToUnits'),
      backToTopics: document.getElementById('backToTopics'),
      subjectCard: document.getElementById('subjectCard'),
      chapterCard: document.getElementById('chapterCard'),
      unitCard: document.getElementById('unitCard'),
      topicCard: document.getElementById('topicCard'),
      quizTypeCard: document.getElementById('quizTypeCard'),
      subjectItems: document.querySelectorAll('.list-item[data-subject]'),
      chapterList: document.getElementById('chapterList'),
      unitList: document.getElementById('unitList'),
      topicList: document.getElementById('topicList'),
      quizTypeList: document.getElementById('quizTypeList'),
      startQuizBtn: document.getElementById('startQuizBtn'),
      currentQuestion: document.getElementById('currentQuestion'),
      totalQuestions: document.getElementById('totalQuestions'),
      questionText: document.getElementById('questionText'),
      optionsContainer: document.getElementById('optionsContainer'),
      fillupInput: document.getElementById('fillupInput'),
      submitFillupBtn: document.getElementById('submitFillupBtn'),
      revealAnswerBtn: document.getElementById('revealAnswerBtn'),
      flashcardAnswer: document.getElementById('flashcardAnswer'),
      matchContainer: document.getElementById('matchContainer'),
      submitMatchBtn: document.getElementById('submitMatchBtn'),
      videoFrame: document.getElementById('videoFrame'),
      explanationContainer: document.getElementById('explanationContainer'),
      explanationText: document.getElementById('explanationText'),
      prevBtn: document.getElementById('prevBtn'),
      nextQuestionBtn: document.getElementById('nextQuestionBtn'),
      mcqContent: document.getElementById('mcqContent'),
      fillupContent: document.getElementById('fillupContent'),
      flashcardContent: document.getElementById('flashcardContent'),
      matchContent: document.getElementById('matchContent'),
      videoContent: document.getElementById('videoContent'),
      quizResults: document.getElementById('quizResults'),
      scoreValue: document.getElementById('scoreValue'),
      totalScore: document.getElementById('totalScore'),
      restartQuizBtn: document.getElementById('restartQuizBtn'),
      newQuizBtn: document.getElementById('newQuizBtn'),
      viewResultsBtn: document.getElementById('viewResultsBtn'),
      loadingModal: document.getElementById('loadingModal'),
      reportModal: document.getElementById('reportModal'),
      reportReason: document.getElementById('reportReason'),
      submitReportBtn: document.getElementById('submitReportBtn'),
      cancelReportBtn: document.getElementById('cancelReportBtn'),
      scoreDisplay: document.getElementById('scoreDisplay'),
      timerDisplay: document.getElementById('timerDisplay'),
      progressFill: document.getElementById('progressFill'),
      quizInfo: document.getElementById('quizInfo'),
      quizInfoTitle: document.getElementById('quizInfoTitle'),
      quizInfoDetails: document.getElementById('quizInfoDetails'),
      userMenu: document.getElementById('userMenu'),
      userAvatar: document.getElementById('userAvatar'),
      dropdownMenu: document.getElementById('dropdownMenu'),
      logoutBtn: document.getElementById('logoutBtn'),
      reportBtn: document.getElementById('reportBtn')
    };

    // Validate all required elements
    const requiredElements = [
      'subjectScreen', 'chapterScreen', 'unitScreen', 'topicScreen', 'quizTypeScreen', 'quizScreen',
      'resetBtn', 'backToSubjects', 'backToChapters', 'backToUnits', 'backToTopics',
      'subjectCard', 'chapterCard', 'unitCard', 'topicCard', 'quizTypeCard',
      'chapterList', 'unitList', 'topicList', 'quizTypeList', 'startQuizBtn',
      'currentQuestion', 'totalQuestions', 'questionText', 'optionsContainer',
      'fillupInput', 'submitFillupBtn', 'revealAnswerBtn', 'flashcardAnswer',
      'matchContainer', 'submitMatchBtn', 'videoFrame', 'explanationContainer',
      'explanationText', 'prevBtn', 'nextQuestionBtn', 'mcqContent', 'fillupContent',
      'flashcardContent', 'matchContent', 'videoContent', 'quizResults', 'scoreValue',
      'totalScore', 'restartQuizBtn', 'newQuizBtn', 'viewResultsBtn', 'loadingModal',
      'reportModal', 'reportReason', 'submitReportBtn', 'cancelReportBtn', 'scoreDisplay',
      'timerDisplay', 'progressFill', 'quizInfo', 'quizInfoTitle', 'quizInfoDetails',
      'userMenu', 'userAvatar', 'dropdownMenu', 'logoutBtn', 'reportBtn'
    ];

    for (const key of requiredElements) {
      if (!elements[key]) {
        console.error(`Element with ID ${key} not found in the DOM`);
        return;
      }
    }

    let timerInterval;
    let timeLeft = 60;

    // Check URL parameters for DPP, test, or result ID
    function checkUrlParams() {
      const urlParams = new URLSearchParams(window.location.search);
      const dppId = urlParams.get('dppId');
      const testId = urlParams.get('testId');
      const resultId = urlParams.get('result');
      
      if (resultId) {
        loadResult(resultId);
      } else if (dppId) {
        loadDPP(dppId);
      } else if (testId) {
        loadTest(testId);
      } else {
        showScreen('subject');
      }
    }

    // Load specific result from history
    async function loadResult(resultId) {
      showLoading(true);
      try {
        const snapshot = await database.ref(`quizHistory/${auth.currentUser.uid}/${resultId}`).once('value');
        const result = snapshot.val();
        
        if (!result) {
          throw new Error('Result not found');
        }

        // Set quiz info
        if (elements.quizInfoTitle && elements.quizInfoDetails) {
          elements.quizInfoTitle.textContent = result.dppId ? `DPP: ${result.subject}` : result.testId ? `Test: ${result.subject}` : `Quiz: ${result.subject}`;
          elements.quizInfoDetails.innerHTML = `
            ${result.chapter || ''} | 
            ${result.unit || ''} | 
            ${result.topic || ''} | 
            ${result.quizType || ''}
          `;
          elements.quizInfo.style.display = 'block';
        }

        // Load questions
        if (result.subject === 'all') {
          const allQuestions = [];
          for (const subject of ['biology', 'chemistry', 'physics']) {
            const data = await loadSubjectData(subject);
            allQuestions.push(...data);
          }
          state.questions = allQuestions.filter(q => 
            q.chapter_name === result.chapter &&
            q.unit_name === result.unit &&
            q.topic_name === result.topic &&
            q.quiz_type === result.quizType
          );
        } else {
          const data = await loadSubjectData(result.subject);
          state.questions = data.filter(q => 
            q.chapter_name === result.chapter &&
            q.unit_name === result.unit &&
            q.topic_name === result.topic &&
            q.quiz_type === result.quizType
          );
        }

        state.currentSubject = result.subject;
        state.currentChapter = result.chapter;
        state.currentUnit = result.unit;
        state.currentTopic = result.topic;
        state.currentQuizType = result.quizType;
        state.score = result.score;
        state.totalAnswered = result.total;
        state.userAnswers = result.userAnswers || {};

        if (elements.quizContent && elements.quizResults && elements.scoreValue && elements.totalScore) {
          elements.quizContent.style.display = 'none';
          elements.quizResults.style.display = 'block';
          elements.scoreValue.textContent = state.score;
          elements.totalScore.textContent = state.totalAnswered;
          elements.viewResultsBtn.style.display = 'none';
        }
      } catch (error) {
        console.error('Error loading result:', error);
        showError('Failed to load result: ' + error.message);
        resetSelections('subject');
      } finally {
        showLoading(false);
      }
    }

    // Load DPP from database
    async function loadDPP(dppId) {
      showLoading(true);
      state.isDPP = true;
      state.dppId = dppId;
      
      try {
        const snapshot = await database.ref(`dpps/${auth.currentUser.uid}/${dppId}`).once('value');
        const dpp = snapshot.val();
        
        if (!dpp) {
          throw new Error('DPP not found');
        }
        
        // Set quiz info
        if (elements.quizInfoTitle && elements.quizInfoDetails) {
          elements.quizInfoTitle.textContent = dpp.name;
          elements.quizInfoDetails.innerHTML = `
            ${dpp.subject.charAt(0).toUpperCase() + dpp.subject.slice(1)} | 
            ${dpp.chapter} | 
            ${dpp.unit} | 
            ${dpp.topic}
          `;
          elements.quizInfo.style.display = 'block';
        }
        
        // Load questions for this DPP
        const data = await loadSubjectData(dpp.subject);
        state.questions = data.filter(q => 
          q.chapter_name === dpp.chapter && 
          q.unit_name === dpp.unit && 
          q.topic_name === dpp.topic
        ).slice(0, dpp.questions);
        
        if (state.questions.length === 0) {
          throw new Error('No questions found for this DPP');
        }
        
        state.currentSubject = dpp.subject;
        state.currentChapter = dpp.chapter;
        state.currentUnit = dpp.unit;
        state.currentTopic = dpp.topic;
        startQuiz();
      } catch (error) {
        console.error('Error loading DPP:', error);
        showError('Failed to load DPP: ' + error.message);
        resetSelections('subject');
      } finally {
        showLoading(false);
      }
    }

    // Load Test from database
    async function loadTest(testId) {
      showLoading(true);
      state.isTest = true;
      state.testId = testId;
      
      try {
        const snapshot = await database.ref(`tests/${auth.currentUser.uid}/${testId}`).once('value');
        const test = snapshot.val();
        
        if (!test) {
          throw new Error('Test not found');
        }
        
        // Set quiz info
        if (elements.quizInfoTitle && elements.quizInfoDetails) {
          elements.quizInfoTitle.textContent = test.name;
          elements.quizInfoDetails.innerHTML = `
            ${test.subject === 'all' ? 'All Subjects' : test.subject.charAt(0).toUpperCase() + test.subject.slice(1)} | 
            ${test.questions} questions | 
            ${test.time} minutes
          `;
          elements.quizInfo.style.display = 'block';
        }
        state.timeLimit = test.time * 60;
        
        // Load questions for this test
        if (test.subject === 'all') {
          const allQuestions = [];
          for (const subject of ['biology', 'chemistry', 'physics']) {
            const data = await loadSubjectData(subject);
            const subjectQuestions = data.filter(q => 
              test.chapters.some(chapter => {
                if (chapter.includes(':')) {
                  const [chapSubject, chapName] = chapter.split(':');
                  return chapSubject === subject && q.chapter_name === chapName;
                }
                return q.chapter_name === chapter;
              })
            );
            allQuestions.push(...subjectQuestions);
          }
          state.questions = allQuestions.sort(() => Math.random() - 0.5).slice(0, test.questions);
        } else {
          const data = await loadSubjectData(test.subject);
          state.questions = data
            .filter(q => test.chapters.some(chapter => q.chapter_name === chapter))
            .sort(() => Math.random() - 0.5)
            .slice(0, test.questions);
        }
        
        if (state.questions.length === 0) {
          throw new Error('No questions found for this test');
        }
        
        state.currentSubject = test.subject;
        startQuiz();
      } catch (error) {
        console.error('Error loading test:', error);
        showError('Failed to load test: ' + error.message);
        resetSelections('subject');
      } finally {
        showLoading(false);
      }
    }

    function showLoading(show) {
      if (elements.loadingModal) {
        elements.loadingModal.style.display = show ? 'flex' : 'none';
      }
    }

    function showScreen(screenName) {
      const screens = ['subject', 'chapter', 'unit', 'topic', 'quizType', 'quiz'];
      screens.forEach(screen => {
        if (elements[`${screen}Screen`]) {
          elements[`${screen}Screen`].style.display = screen === screenName ? 'block' : 'none';
        }
      });
      if (elements.resetBtn) {
        elements.resetBtn.style.display = screenName === 'quiz' ? 'block' : 'none';
      }
    }

    function createListItem(text, value, count, isSelected = false) {
      const li = document.createElement('li');
      li.className = `list-item${isSelected ? ' active' : ''}`;
      li.dataset.value = value;
      li.innerHTML = `
        <div>
          <div>${text} <span class="badge badge-primary">${count} Qs</span></div>
        </div>
        <i class="fas fa-chevron-right list-item-icon"></i>
      `;
      return li;
    }

    async function loadSubjectData(subject) {
      if (state.subjectData[subject].length > 0) return state.subjectData[subject];
      showLoading(true);
      try {
        const questions = [];
        const chaptersSnapshot = await firestore.collection('subjects').doc(subject)
          .collection('chapters').get();
        for (const chapterDoc of chaptersSnapshot.docs) {
          const unitsSnapshot = await chapterDoc.ref.collection('units').get();
          for (const unitDoc of unitsSnapshot.docs) {
            const topicsSnapshot = await unitDoc.ref.collection('topics').get();
            for (const topicDoc of topicsSnapshot.docs) {
              const questionsSnapshot = await topicDoc.ref.collection('questions').get();
              questionsSnapshot.forEach(questionDoc => {
                questions.push({
                  ...questionDoc.data(),
                  chapter_name: chapterDoc.id,
                  unit_name: unitDoc.id,
                  topic_name: topicDoc.id,
                  question_id: questionDoc.id
                });
              });
            }
          }
        }
        state.subjectData[subject] = questions;
        return questions;
      } catch (error) {
        console.error('Error loading subject data:', error);
        showError('Failed to load data. Please try again.');
        resetSelections('subject');
        return [];
      } finally {
        showLoading(false);
      }
    }

    async function handleSubjectSelect(subject) {
      state.currentSubject = subject;
      if (elements.subjectCard) {
        elements.subjectCard.classList.add('hidden');
      }
      const data = await loadSubjectData(subject);
      if (!data.length) return;
      const chaptersSnapshot = await firestore.collection('subjects').doc(subject).collection('chapters').get();
      const chapters = chaptersSnapshot.docs.map(doc => doc.id).sort();
      if (elements.chapterList) {
        elements.chapterList.innerHTML = '';
        if (chapters.length === 0) {
          elements.chapterList.innerHTML = '<div class="empty-state"><i class="fas fa-info-circle empty-state-icon"></i><div>No chapters found</div></div>';
        } else {
          for (const chapter of chapters) {
            const count = data.filter(q => q.chapter_name === chapter).length;
            const isSelected = state.currentChapter === chapter;
            const li = createListItem(chapter, chapter, count, isSelected);
            li.addEventListener('click', () => handleChapterSelect(chapter));
            elements.chapterList.appendChild(li);
          }
        }
      }
      showScreen('chapter');
      if (elements.chapterCard) {
        elements.chapterCard.classList.remove('hidden');
      }
    }

    async function handleChapterSelect(chapter) {
      state.currentChapter = chapter;
      if (elements.chapterCard) {
        elements.chapterCard.classList.add('hidden');
      }
      const data = state.subjectData[state.currentSubject];
      const unitsSnapshot = await firestore.collection('subjects').doc(state.currentSubject)
        .collection('chapters').doc(chapter).collection('units').get();
      const units = unitsSnapshot.docs.map(doc => doc.id).sort();
      if (elements.unitList) {
        elements.unitList.innerHTML = '';
        if (units.length === 0) {
          elements.unitList.innerHTML = '<div class="empty-state"><i class="fas fa-info-circle empty-state-icon"></i><div>No units found</div></div>';
        } else {
          for (const unit of units) {
            const count = data.filter(q => q.chapter_name === state.currentChapter && q.unit_name === unit).length;
            const isSelected = state.currentUnit === unit;
            const li = createListItem(unit, unit, count, isSelected);
            li.addEventListener('click', () => handleUnitSelect(unit));
            elements.unitList.appendChild(li);
          }
        }
      }
      showScreen('unit');
      if (elements.unitCard) {
        elements.unitCard.classList.remove('hidden');
      }
    }

    async function handleUnitSelect(unit) {
      state.currentUnit = unit;
      if (elements.unitCard) {
        elements.unitCard.classList.add('hidden');
      }
      const data = state.subjectData[state.currentSubject];
      const topicsSnapshot = await firestore.collection('subjects').doc(state.currentSubject)
        .collection('chapters').doc(state.currentChapter)
        .collection('units').doc(unit).collection('topics').get();
      const topics = topicsSnapshot.docs.map(doc => doc.id).sort();
      if (elements.topicList) {
        elements.topicList.innerHTML = '';
        if (topics.length === 0) {
          elements.topicList.innerHTML = '<div class="empty-state"><i class="fas fa-info-circle empty-state-icon"></i><div>No topics found</div></div>';
        } else {
          for (const topic of topics) {
            const count = data.filter(q => q.chapter_name === state.currentChapter && q.unit_name === state.currentUnit && q.topic_name === topic).length;
            const isSelected = state.currentTopic === topic;
            const li = createListItem(topic, topic, count, isSelected);
            li.addEventListener('click', () => handleTopicSelect(topic));
            elements.topicList.appendChild(li);
          }
        }
      }
      showScreen('topic');
      if (elements.topicCard) {
        elements.topicCard.classList.remove('hidden');
      }
    }

    async function handleTopicSelect(topic) {
      state.currentTopic = topic;
      if (elements.topicCard) {
        elements.topicCard.classList.add('hidden');
      }
      const data = state.subjectData[state.currentSubject];
      const quizTypes = [...new Set(data.filter(q => 
        q.chapter_name === state.currentChapter && 
        q.unit_name === state.currentUnit && 
        q.topic_name === topic
      ).map(q => q.quiz_type))].filter(Boolean).sort();
      if (elements.quizTypeList) {
        elements.quizTypeList.innerHTML = '';
        if (quizTypes.length === 0) {
          elements.quizTypeList.innerHTML = '<div class="empty-state"><i class="fas fa-info-circle empty-state-icon"></i><div>No quiz types found</div></div>';
        } else {
          quizTypes.forEach(type => {
            const count = data.filter(q => 
              q.chapter_name === state.currentChapter && 
              q.unit_name === state.currentUnit && 
              q.topic_name === state.currentTopic && 
              q.quiz_type === type
            ).length;
            const isSelected = state.currentQuizType === type;
            const li = createListItem(type, type, count, isSelected);
            li.addEventListener('click', () => handleQuizTypeSelect(type));
            elements.quizTypeList.appendChild(li);
          });
        }
      }
      if (elements.startQuizBtn) {
        elements.startQuizBtn.style.display = 'block';
      }
      showScreen('quizType');
      if (elements.quizTypeCard) {
        elements.quizTypeCard.classList.remove('hidden');
      }
    }

    function handleQuizTypeSelect(quizType) {
      state.currentQuizType = quizType;
      if (elements.quizTypeList) {
        elements.quizTypeList.querySelectorAll('.list-item').forEach(item => {
          item.classList.toggle('active', item.dataset.value === quizType);
        });
      }
      if (elements.startQuizBtn) {
        elements.startQuizBtn.disabled = false;
      }
    }

    async function startQuiz() {
      if (!state.isDPP && !state.isTest) {
        const data = state.subjectData[state.currentSubject];
        if (!data || data.length === 0) {
          showError('No data available. Please select a subject again.');
          resetSelections('subject');
          return;
        }
        state.questions = data.filter(q => 
          q.chapter_name === state.currentChapter &&
          q.unit_name === state.currentUnit &&
          q.topic_name === state.currentTopic &&
          (!state.currentQuizType || q.quiz_type === state.currentQuizType)
        );
        if (state.questions.length === 0) {
          showError('No questions found for the selected filters.');
          resetSelections('topic');
          return;
        }
        if (state.questions.length > 1) {
          state.questions = state.questions.sort(() => Math.random() - 0.5);
        }
      }
      
      state.currentQuestionIndex = 0;
      state.score = 0;
      state.totalAnswered = 0;
      state.matchSelections = {};
      state.startTime = Date.now();
      updateScore();
      if (elements.totalQuestions) {
        elements.totalQuestions.textContent = state.questions.length;
      }
      if (elements.startQuizBtn) {
        elements.startQuizBtn.style.display = 'none';
      }
      showScreen('quiz');
      showQuestion(state.questions[0]);
      startTimer();
    }

    function showQuestion(question) {
      if (!question || !elements.questionText || !elements.explanationContainer || !elements.explanationText) {
        showError('Error displaying question. Please try again.');
        return;
      }
      updateProgress();
      ['mcqContent', 'fillupContent', 'flashcardContent', 'matchContent', 'videoContent'].forEach(id => {
        if (elements[id]) {
          elements[id].style.display = 'none';
        }
      });
      elements.explanationContainer.style.display = 'none';
      if (elements.prevBtn) {
        elements.prevBtn.disabled = state.currentQuestionIndex === 0;
      }
      if (elements.nextQuestionBtn) {
        elements.nextQuestionBtn.disabled = false;
        elements.nextQuestionBtn.textContent = state.currentQuestionIndex === state.questions.length - 1 ? 'See Results' : 'Next';
      }
      if (elements.currentQuestion) {
        elements.currentQuestion.textContent = state.currentQuestionIndex + 1;
      }
      elements.questionText.innerHTML = question.question || 'No question text available';
      elements.explanationText.innerHTML = question.explanation || 'No explanation provided';
      const questionKey = `${question.question_id}_${state.currentQuestionIndex}`;
      const userAnswer = state.userAnswers[questionKey];
      switch (question.quiz_type?.toLowerCase()) {
        case 'mcq':
          showMCQQuestion(question, userAnswer);
          break;
        case 'fillup':
          showFillupQuestion(question, userAnswer);
          break;
        case 'flashcard':
          showFlashcardQuestion(question, userAnswer);
          break;
        case 'match':
          showMatchQuestion(question, userAnswer);
          break;
        case 'video':
          showVideoQuestion(question, userAnswer);
          break;
        default:
          showSimpleQuestion(question, userAnswer);
      }
    }

    function showMCQQuestion(question, userAnswer) {
      if (!elements.mcqContent || !elements.optionsContainer) return;
      elements.mcqContent.style.display = 'block';
      elements.optionsContainer.innerHTML = '';
      const options = [
        { letter: 'A', text: question.option_a },
        { letter: 'B', text: question.option_b },
        { letter: 'C', text: question.option_c },
        { letter: 'D', text: question.option_d }
      ].filter(opt => opt.text);
      options.forEach(opt => {
        const button = document.createElement('button');
        button.className = 'option-btn';
        button.innerHTML = `<strong>${opt.letter}.</strong> ${opt.text}`;
        button.dataset.option = opt.text;
        if (userAnswer) {
          if (userAnswer.answer === opt.text) {
            button.classList.add(userAnswer.correct ? 'correct' : 'incorrect');
            button.disabled = true;
          }
          if (opt.text === question.answer) {
            button.classList.add('correct');
          }
          elements.explanationContainer.style.display = 'block';
        } else {
          button.addEventListener('click', () => checkMCQAnswer(button, question.answer, question));
        }
        elements.optionsContainer.appendChild(button);
      });
    }

    function showFillupQuestion(question, userAnswer) {
      if (!elements.fillupContent || !elements.fillupInput || !elements.submitFillupBtn) return;
      elements.fillupContent.style.display = 'block';
      elements.fillupInput.value = userAnswer ? userAnswer.answer : '';
      elements.fillupInput.classList.remove('correct', 'incorrect');
      if (userAnswer) {
        elements.fillupInput.classList.add(userAnswer.correct ? 'correct' : 'incorrect');
        elements.fillupInput.disabled = true;
        elements.submitFillupBtn.disabled = true;
        elements.explanationContainer.style.display = 'block';
      } else {
        elements.fillupInput.disabled = false;
        elements.submitFillupBtn.disabled = false;
        elements.submitFillupBtn.onclick = () => checkFillupAnswer(question.answer, question);
      }
    }

    function showFlashcardQuestion(question, userAnswer) {
      if (!elements.flashcardContent || !elements.flashcardAnswer || !elements.revealAnswerBtn) return;
      elements.flashcardContent.style.display = 'block';
      elements.flashcardAnswer.innerHTML = question.answer ? `<strong>Answer:</strong> ${question.answer}` : 'No answer provided';
      elements.flashcardAnswer.style.display = userAnswer ? 'block' : 'none';
      elements.revealAnswerBtn.disabled = !!userAnswer;
      elements.explanationContainer.style.display = userAnswer ? 'block' : 'none';
      if (!userAnswer) {
        elements.revealAnswerBtn.onclick = () => {
          elements.flashcardAnswer.style.display = 'block';
          elements.revealAnswerBtn.disabled = true;
          state.totalAnswered++;
          state.score++;
          const questionKey = `${question.question_id}_${state.currentQuestionIndex}`;
          state.userAnswers[questionKey] = { answer: question.answer, correct: true };
          updateScore();
          elements.explanationContainer.style.display = 'block';
          clearInterval(timerInterval);
        };
      }
    }

    function showMatchQuestion(question, userAnswer) {
      if (!elements.matchContent || !elements.matchContainer || !elements.submitMatchBtn) return;
      elements.matchContent.style.display = 'block';
      elements.matchContainer.innerHTML = '';
      state.matchSelections = {};
      const options = [
        question.option_a,
        question.option_b,
        question.option_c,
        question.option_d
      ].filter(opt => opt).map(opt => opt.split(','));
      const leftItems = options.map(opt => opt[0]);
      const rightItems = options.map(opt => opt[1]).sort(() => Math.random() - 0.5);
      const leftColumn = document.createElement('div');
      leftColumn.className = 'match-column';
      const rightColumn = document.createElement('div');
      rightColumn.className = 'match-column';
      leftItems.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'match-item';
        div.textContent = item;
        div.dataset.id = index;
        if (userAnswer) {
          div.classList.add(userAnswer.correct ? 'correct' : 'incorrect');
          div.style.pointerEvents = 'none';
        } else {
          div.addEventListener('click', () => selectMatchItem(div, 'left'));
        }
        leftColumn.appendChild(div);
      });
      rightItems.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'match-item';
        div.textContent = item;
        div.dataset.id = index;
        if (userAnswer) {
          div.classList.add(userAnswer.correct ? 'correct' : 'incorrect');
          div.style.pointerEvents = 'none';
        } else {
          div.addEventListener('click', () => selectMatchItem(div, 'right'));
        }
        rightColumn.appendChild(div);
      });
      elements.matchContainer.appendChild(leftColumn);
      elements.matchContainer.appendChild(rightColumn);
      elements.submitMatchBtn.disabled = !!userAnswer;
      if (!userAnswer) {
        elements.submitMatchBtn.onclick = () => checkMatchAnswer(question, userAnswer);
      }
      if (userAnswer) {
        elements.explanationContainer.style.display = 'block';
      }
    }

    function showVideoQuestion(question, userAnswer) {
      if (!elements.videoContent || !elements.videoFrame) return;
      elements.videoContent.style.display = 'block';
      const videoId = question.question?.trim();
      elements.videoFrame.src = videoId ? `https://www.youtube.com/embed/${videoId}` : '';
      elements.explanationContainer.style.display = 'block';
      if (!userAnswer) {
        state.totalAnswered++;
        state.score++;
        const questionKey = `${question.question_id}_${state.currentQuestionIndex}`;
        state.userAnswers[questionKey] = { content: videoId, correct: true };
        updateScore();
      }
    }

    function showSimpleQuestion(question, userAnswer) {
      if (!elements.flashcardContent || !elements.flashcardAnswer) return;
      elements.flashcardContent.style.display = 'block';
      let answerHTML = question.answer ? `<strong>Answer:</strong> ${question.answer}` : 'No answer provided';
      if (question.option_a) answerHTML += `<br><strong>Option A:</strong> ${question.option_a}`;
      if (question.option_b) answerHTML += `<br><strong>Option B:</strong> ${question.option_b}`;
      elements.flashcardAnswer.innerHTML = answerHTML;
      elements.flashcardAnswer.style.display = 'block';
      elements.explanationContainer.style.display = 'block';
      if (!userAnswer) {
        state.totalAnswered++;
        state.score++;
        const questionKey = `${question.question_id}_${state.currentQuestionIndex}`;
        state.userAnswers[questionKey] = { answer: question.answer, correct: true };
        updateScore();
      }
      clearInterval(timerInterval);
    }

    function checkMCQAnswer(button, correctAnswer, question) {
      if (!elements.optionsContainer || !elements.explanationContainer) return;
      const buttons = elements.optionsContainer.querySelectorAll('.option-btn');
      state.totalAnswered++;
      const questionKey = `${question.question_id}_${state.currentQuestionIndex}`;
      const isCorrect = button.dataset.option === correctAnswer;
      state.userAnswers[questionKey] = {
        answer: button.dataset.option,
        correct: isCorrect
      };
      if (isCorrect) {
        state.score++;
        button.classList.add('correct');
      } else {
        button.classList.add('incorrect');
        buttons.forEach(btn => {
          if (btn.dataset.option === correctAnswer) {
            btn.classList.add('correct');
          }
        });
      }
      updateScore();
      buttons.forEach(btn => btn.disabled = true);
      elements.explanationContainer.style.display = 'block';
      clearInterval(timerInterval);
    }

    function checkFillupAnswer(correctAnswer, question) {
      if (!elements.fillupInput || !elements.submitFillupBtn || !elements.explanationContainer) return;
      const input = elements.fillupInput;
      state.totalAnswered++;
      const userAnswer = input.value.trim().toLowerCase();
      const questionKey = `${question.question_id}_${state.currentQuestionIndex}`;
      const isCorrect = userAnswer === correctAnswer?.toLowerCase();
      state.userAnswers[questionKey] = {
        answer: userAnswer,
        correct: isCorrect
      };
      if (isCorrect) {
        state.score++;
        input.classList.add('correct');
      } else {
        input.classList.add('incorrect');
      }
      updateScore();
      input.disabled = true;
      elements.submitFillupBtn.disabled = true;
      elements.explanationContainer.style.display = 'block';
      clearInterval(timerInterval);
    }

    function selectMatchItem(item, side) {
      if (!elements.matchContainer || !elements.submitMatchBtn) return;
      const id = item.dataset.id;
      const items = item.parentElement.querySelectorAll('.match-item');
      items.forEach(i => i.classList.remove('selected'));
      item.classList.add('selected');
      state.matchSelections[side] = id;
      elements.submitMatchBtn.disabled = !state.matchSelections.left || !state.matchSelections.right;
    }

    function checkMatchAnswer(question, userAnswer) {
      if (!elements.matchContainer || !elements.submitMatchBtn || !elements.explanationContainer) return;
      const options = [
        question.option_a,
        question.option_b,
        question.option_c,
        question.option_d
      ].filter(opt => opt).map(opt => opt.split(','));
      const correctPairs = options.reduce((acc, [left, right], index) => ({ ...acc, [index]: index }), {});
      const leftItems = elements.matchContainer.querySelectorAll('.match-column:first-child .match-item');
      const rightItems = elements.matchContainer.querySelectorAll('.match-column:last-child .match-item');
      state.totalAnswered++;
      const questionKey = `${question.question_id}_${state.currentQuestionIndex}`;
      const isCorrect = state.matchSelections.left === state.matchSelections.right;
      state.userAnswers[questionKey] = {
        answer: `${leftItems[state.matchSelections.left].textContent} -> ${rightItems[state.matchSelections.right].textContent}`,
        correct: isCorrect
      };
      if (isCorrect) {
        state.score++;
        leftItems[state.matchSelections.left].classList.add('correct');
        rightItems[state.matchSelections.right].classList.add('correct');
      } else {
        leftItems[state.matchSelections.left].classList.add('incorrect');
        rightItems[state.matchSelections.right].classList.add('incorrect');
        Object.keys(correctPairs).forEach(i => {
          leftItems[i].classList.add('correct');
          rightItems[correctPairs[i]].classList.add('correct');
        });
      }
      updateScore();
      leftItems.forEach(item => item.style.pointerEvents = 'none');
      rightItems.forEach(item => item.style.pointerEvents = 'none');
      elements.submitMatchBtn.disabled = true;
      elements.explanationContainer.style.display = 'block';
      clearInterval(timerInterval);
    }

    async function submitReport() {
      if (!elements.reportReason || !elements.reportModal) return;
      const reason = elements.reportReason.value.trim();
      if (!reason) {
        alert('Please provide a reason for reporting this question.');
        return;
      }

      const question = state.questions[state.currentQuestionIndex];
      const user = auth.currentUser;
      // Get device information
      const deviceInfo = {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        screenWidth: screen.width,
        screenHeight: screen.height
      };

      // Attempt to get location (requires user consent)
      let location = null;
      try {
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
        });
        location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        };
      } catch (error) {
        console.warn('Location access denied or error:', error);
      }

      const reportData = {
        questionId: question.question_id,
        subject: state.currentSubject,
        chapter: state.currentChapter,
        unit: state.currentUnit,
        topic: state.currentTopic,
        quizType: state.currentQuizType,
        questionText: question.question,
        reason: reason,
        userId: user.uid,
        userEmail: user.email || 'N/A',
        userName: user.displayName || 'N/A',
        deviceInfo: deviceInfo,
        location: location,
        timestamp: Date.now(),
        dppId: state.dppId || null,
        testId: state.testId || null
      };

      try {
        await database.ref('questionReports').push(reportData);
        elements.reportModal.style.display = 'none';
        elements.reportReason.value = '';
        alert('Report submitted successfully!');
      } catch (error) {
        console.error('Error submitting report:', error);
        showError('Failed to submit report. Please try again.');
      }
    }

    function showResults() {
      const quizResult = {
        date: Date.now(),
        subject: state.currentSubject || (state.isDPP ? 'dpp' : 'test'),
        chapter: state.currentChapter,
        unit: state.currentUnit,
        topic: state.currentTopic,
        quizType: state.currentQuizType,
        score: state.score,
        total: state.questions.length,
        timeTaken: Math.floor((Date.now() - state.startTime) / 1000),
        dppId: state.dppId,
        testId: state.testId,
        userAnswers: state.userAnswers
      };
      
      // Save quiz result to database
      let resultKey = null;
      if (auth.currentUser) {
        const newResultRef = database.ref('quizHistory/' + auth.currentUser.uid).push();
        resultKey = newResultRef.key;
        newResultRef.set(quizResult);
      }
      
      if (elements.quizContent) elements.quizContent.style.display = 'none';
      if (elements.quizResults) elements.quizResults.style.display = 'block';
      if (elements.scoreValue) elements.scoreValue.textContent = state.score;
      if (elements.totalScore) elements.totalScore.textContent = state.questions.length;
      if (resultKey && elements.viewResultsBtn) {
        elements.viewResultsBtn.dataset.resultKey = resultKey;
      }
      clearInterval(timerInterval);
    }

    function startTimer() {
      timeLeft = state.timeLimit;
      if (elements.timerDisplay) {
        elements.timerDisplay.textContent = `Time: ${formatTime(timeLeft)}`;
      }
      timerInterval = setInterval(() => {
        timeLeft--;
        if (elements.timerDisplay) {
          elements.timerDisplay.textContent = `Time: ${formatTime(timeLeft)}`;
        }
        if (timeLeft <= 0) {
          clearInterval(timerInterval);
          state.totalAnswered++;
          updateScore();
          disableInputs();
          if (elements.explanationContainer) {
            elements.explanationContainer.style.display = 'block';
          }
        }
      }, 1000);
    }

    function formatTime(seconds) {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }

    function disableInputs() {
      if (elements.optionsContainer) {
        elements.optionsContainer.querySelectorAll('.option-btn').forEach(btn => btn.disabled = true);
      }
      if (elements.fillupInput) {
        elements.fillupInput.disabled = true;
      }
      if (elements.submitFillupBtn) {
        elements.submitFillupBtn.disabled = true;
      }
      if (elements.revealAnswerBtn) {
        elements.revealAnswerBtn.disabled = true;
      }
      if (elements.matchContainer) {
        elements.matchContainer.querySelectorAll('.match-item').forEach(item => item.style.pointerEvents = 'none');
      }
      if (elements.submitMatchBtn) {
        elements.submitMatchBtn.disabled = true;
      }
    }

    function updateScore() {
      if (elements.scoreDisplay) {
        elements.scoreDisplay.textContent = `Score: ${state.score}/${state.totalAnswered}`;
      }
    }

    function updateProgress() {
      if (elements.progressFill && state.questions.length > 0) {
        const progress = ((state.currentQuestionIndex + 1) / state.questions.length) * 100;
        elements.progressFill.style.width = `${progress}%`;
      }
    }

    function showError(message) {
      console.error('Error:', message);
      if (elements.quizContent && elements.quizScreen && elements.nextQuestionBtn) {
        elements.quizContent.innerHTML = `
          <div class="empty-state">
            <i class="fas fa-exclamation-circle empty-state-icon"></i>
            <div>${message}</div>
          </div>
        `;
        showScreen('quiz');
        elements.nextQuestionBtn.style.display = 'none';
      } else {
        alert(message);
      }
    }

    function resetSelections(level) {
      const levels = ['subject', 'chapter', 'unit', 'topic', 'quizType'];
      const index = levels.indexOf(level);
      for (let i = index; i < levels.length; i++) {
        if (i > index) {
          state[`current${levels[i].charAt(0).toUpperCase() + levels[i].slice(1)}`] = null;
        }
        const card = elements[`${levels[i]}Card`];
        const list = elements[`${levels[i]}List`];
        if (card) card.classList.remove('hidden');
        if (list) list.innerHTML = '';
      }
      if (elements.startQuizBtn) {
        elements.startQuizBtn.style.display = 'none';
        elements.startQuizBtn.disabled = true;
      }
      if (elements.quizScreen && elements.quizContent && elements.nextQuestionBtn) {
        elements.quizScreen.style.display = 'none';
        elements.quizContent.innerHTML = '';
        elements.nextQuestionBtn.style.display = 'block';
      }
      clearInterval(timerInterval);
      timeLeft = state.timeLimit;
      if (elements.timerDisplay) {
        elements.timerDisplay.textContent = `Time: ${formatTime(timeLeft)}`;
      }
      if (elements.progressFill) {
        elements.progressFill.style.width = '0%';
      }
      state.isDPP = false;
      state.isTest = false;
      state.dppId = null;
      state.testId = null;
      state.userAnswers = {};
      showScreen(level);
      if (level === 'subject' && state.currentSubject) {
        handleSubjectSelect(state.currentSubject);
      } else if (level === 'chapter' && state.currentChapter) {
        handleSubjectSelect(state.currentSubject);
      } else if (level === 'unit' && state.currentUnit) {
        handleChapterSelect(state.currentChapter);
      } else if (level === 'topic' && state.currentTopic) {
        handleUnitSelect(state.currentUnit);
      } else if (level === 'quizType' && state.currentQuizType) {
        handleTopicSelect(state.currentTopic);
      } else {
        if (elements.subjectCard) {
          elements.subjectCard.classList.remove('hidden');
        }
      }
    }

    // Initialize event listeners
    function initEventListeners() {
      elements.subjectItems.forEach(item => {
        item.addEventListener('click', () => handleSubjectSelect(item.dataset.subject));
      });

      if (elements.backToSubjects) {
        elements.backToSubjects.addEventListener('click', () => resetSelections('subject'));
      }
      if (elements.backToChapters) {
        elements.backToChapters.addEventListener('click', () => resetSelections('chapter'));
      }
      if (elements.backToUnits) {
        elements.backToUnits.addEventListener('click', () => resetSelections('unit'));
      }
      if (elements.backToTopics) {
        elements.backToTopics.addEventListener('click', () => resetSelections('topic'));
      }

      if (elements.startQuizBtn) {
        elements.startQuizBtn.addEventListener('click', startQuiz);
      }

      if (elements.nextQuestionBtn) {
        elements.nextQuestionBtn.addEventListener('click', () => {
          clearInterval(timerInterval);
          timeLeft = state.timeLimit;
          if (state.currentQuestionIndex < state.questions.length - 1) {
            state.currentQuestionIndex++;
            showQuestion(state.questions[state.currentQuestionIndex]);
            startTimer();
          } else {
            showResults();
          }
        });
      }

      if (elements.prevBtn) {
        elements.prevBtn.addEventListener('click', () => {
          if (state.currentQuestionIndex > 0) {
            clearInterval(timerInterval);
            timeLeft = state.timeLimit;
            state.currentQuestionIndex--;
            showQuestion(state.questions[state.currentQuestionIndex]);
            startTimer();
          }
        });
      }

      if (elements.restartQuizBtn) {
        elements.restartQuizBtn.addEventListener('click', () => {
          state.currentQuestionIndex = 0;
          state.score = 0;
          state.totalAnswered = 0;
          state.userAnswers = {};
          if (elements.quizContent && elements.quizResults) {
            elements.quizContent.style.display = 'block';
            elements.quizResults.style.display = 'none';
          }
          showQuestion(state.questions[0]);
          startTimer();
        });
      }

      if (elements.newQuizBtn) {
        elements.newQuizBtn.addEventListener('click', () => resetSelections('subject'));
      }

      if (elements.viewResultsBtn) {
  elements.viewResultsBtn.addEventListener('click', () => {
    const resultKey = elements.viewResultsBtn.dataset.resultKey;
    if (resultKey) {
      window.location.href = `results.html?result=${resultKey}`;
    }
  });
}


      if (elements.resetBtn) {
        elements.resetBtn.addEventListener('click', () => resetSelections('subject'));
      }

      if (elements.userAvatar) {
        elements.userAvatar.addEventListener('click', () => {
          if (elements.dropdownMenu) {
            elements.dropdownMenu.classList.toggle('show');
          }
        });
      }

      if (elements.logoutBtn) {
        elements.logoutBtn.addEventListener('click', async (e) => {
          e.preventDefault();
          try {
            await auth.signOut();
            window.location.href = 'login.html';
          } catch (error) {
            console.error('Error logging out:', error);
            showError('Failed to log out. Please try again.');
          }
        });
      }

      if (elements.reportBtn) {
        elements.reportBtn.addEventListener('click', () => {
          if (elements.reportModal) {
            elements.reportModal.style.display = 'flex';
          }
        });
      }

      if (elements.submitReportBtn) {
        elements.submitReportBtn.addEventListener('click', submitReport);
      }

      if (elements.cancelReportBtn) {
        elements.cancelReportBtn.addEventListener('click', () => {
          if (elements.reportModal && elements.reportReason) {
            elements.reportModal.style.display = 'none';
            elements.reportReason.value = '';
          }
        });
      }

      // Close dropdown when clicking outside
      document.addEventListener('click', (e) => {
        if (elements.userMenu && elements.dropdownMenu && !elements.userMenu.contains(e.target)) {
          elements.dropdownMenu.classList.remove('show');
        }
      });
    }

    // Initialize Firebase Authentication
    auth.onAuthStateChanged(user => {
      if (user) {
        if (elements.userAvatar) {
          elements.userAvatar.textContent = user.displayName ? user.displayName[0].toUpperCase() : 'U';
        }
        checkUrlParams();
        initEventListeners();
      } else {
        window.location.href = 'login.html';
      }
    });
  });
