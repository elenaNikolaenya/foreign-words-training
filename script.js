'use strict';
// элементы сайдбара в режиме тренировки
const studyModeSidebar = document.querySelector('#study-mode');
const currentWordCounter = document.querySelector('#current-word');
const totalWordCounter = document.querySelector('#total-word');
const shuffleBtn = document.querySelector('#shuffle-words');
const studyProgress = document.querySelector('#words-progress');
const addNewWordBtn = document.querySelector('#add-words');
const removeWordBtn = document.querySelector('#remove-words');

// элементы окошка для добавления слов
const addWordPage = document.querySelector('.add-word-page');
const engInput = document.querySelector('#eng');
const rusInput = document.querySelector('#rus');
const exampleInput = document.querySelector('#example');
const addBtn = document.querySelector('#add');
const modal = document.querySelector('.modal');
const okBtn = document.querySelector('#ok');

// элементы окошка для удаления слов
const removeWordPage = document.querySelector('#remove-word-page');
const removingTemplate = document.querySelector('#removing');
const removeContent = document.querySelector('.remove-content');
const okRemoveBtn = document.querySelector('#ok-remove');

// элементы режима тренировки
const studyCards = document.querySelector('.study-cards');
const cardFrontWord = document.querySelector('#card-front h1');
const cardBackWord = document.querySelector('#card-back h1');
const cardBackExample = document.querySelector('#card-back p span');
const cardToStudy = document.querySelector('.flip-card');
const backBtn = document.querySelector('#back');
const nextBtn = document.querySelector('#next');
const examBtn = document.querySelector('#exam');

// элементы сайдбара в режиме тестирования
const examModeSidebar = document.querySelector('#exam-mode');
const correctPercent = document.querySelector('#correct-percent');
const examProgress = document.querySelector('#exam-progress');
const timer = document.querySelector('#time');
let timerId = null;
const restartBtn = document.querySelector('#restart');
const goToLearnBtn = document.querySelector('#go-learn');

// элементы режима тестирования
const examCards = document.querySelector('#exam-cards');
const statTemplate = document.querySelector('#word-stats');
const resultsModal = document.querySelector('.results-modal');
const resultsContent = document.querySelector('.results-content');
const resultTimer = document.querySelector('#timer');

class Word {
  constructor (engWord, rusWord, example) {
    this.engWord = engWord;
    this.rusWord = rusWord;
    this.example = example;
    this.attempts = 0;
    this.mark = false;
  };  
};

//исходный массив, используется для подсчета статистики и добавления слов
let wordsToLearn = [];
try {
  wordsToLearn = JSON.parse(localStorage.getItem('wordsToLearn') || '[]');
} catch (error) {
  console.log(error);
};
// слова, которые добавляются по умолчанию
if (!wordsToLearn.length) {
  addWordToLearn('violin', 'скрипка', 'She plays the violin with great expression.');
  addWordToLearn('violence', 'насилие', 'She was concerned about the amount of violence on television.');
  addWordToLearn('violet', 'фиалка', "African violets are one of the world's most popular houseplants");
  addWordToLearn('violation', 'нарушение', 'The verdict was a gross violation of justice.');
  addWordToLearn('valence', 'валентность', 'Carbon always has a valence of 4.');
  addWordToLearn('valance', 'подзор', 'Valances are designed so that it can protect your bed base from getting dirty and dusty.');
  localStorage.setItem('wordsToLearn', JSON.stringify(wordsToLearn));
};

function addWordToLearn(eng, rus, ex) {
  const word = new Word(eng, rus, ex);
  wordsToLearn.push(word);
};
//массив, который будем перемешивать и использовать для режима тренировки
let studyWords = [];
try {
  studyWords = JSON.parse(localStorage.getItem('studyWords') || '[]');
} catch (error) {
  console.log(error);
};

if (!studyWords.length) {
  studyWords = [...wordsToLearn];
};
// индекс слова, которое отображается на карточке
let index = null;
try {
  index = JSON.parse(localStorage.getItem('indexToPrint') || '0');
} catch (error) {
  console.log(error);
};

printStudyCard(index);
changeCounter(); //слово № из n
changeProgress();
toggleBtn(); // мы можем быть не на первом слове, кнопка "назад" может быть активна

function printStudyCard(index) {
  const word = studyWords[index];
  
  cardFrontWord.textContent = word.engWord;
  cardBackWord.textContent = word.rusWord;
  cardBackExample.textContent = word.example;
};

function changeCounter() {
  currentWordCounter.textContent = index + 1;
  totalWordCounter.textContent = studyWords.length;
};

function changeProgress() {
  studyProgress.value = (index + 1) * 100 / studyWords.length;
};

function toggleBtn() {
  if (index === 0) {
    backBtn.disabled = true;
  };
  if (index !== 0) {
    backBtn.disabled = false;
  };
  if (index === studyWords.length - 1) {
    nextBtn.disabled = true;
  };
  if (index !== studyWords.length - 1) {
    nextBtn.disabled = false;
  };
};
// вращаем карточку
cardToStudy.addEventListener('click', () => {
  cardToStudy.classList.toggle('active');
});
// кнопки вперед-назад
nextBtn.addEventListener('click', moveCardsForvard);
backBtn.addEventListener('click', moveCardsBack);

function moveCardsForvard() {
  moveCards(1);
  changeCounter();
  changeProgress();
  toggleBtn();  
};

function moveCardsBack() {
  moveCards(-1);
  changeCounter();
  changeProgress();
  toggleBtn();  
};

function moveCards(step) {
  cardToStudy.classList.remove('active');  
  index += step;
  printStudyCard(index);
  localStorage.setItem('indexToPrint', JSON.stringify(index));  
};

// кнопка перемешивания карточек
shuffleBtn.addEventListener('click', () => {
  shuffle(studyWords);
  localStorage.setItem('studyWords', JSON.stringify(studyWords));
  printStudyCard(index);
});

function shuffle(arr) {  
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i +1));
    const storage = arr[j];
    arr[j] = arr[i];
    arr[i] = storage;
  };
  return arr;
};

// кнопка добавить новое слово
addNewWordBtn.addEventListener('click', addNewWord);

function addNewWord() {
  showForm();
  
  function showForm() {
    studyCards.classList.add('hidden');
    removeWordPage.classList.add('hidden');
    shuffleBtn.disabled = true; // чтобы случайно не перемешать слова, пока мы их не видим
    addWordPage.classList.remove('hidden');
  };
  // кнопка добавить в мод.окне
  addBtn.addEventListener('click', () => {
    const engW = engInput.value;
    const rusW = rusInput.value;
    const example = exampleInput.value;
    // проверяем, все ли заполнено, ругаемся
    if (!(engW && rusW && example)) {
      showModal();
      return;
    };

    addWordToLearn(engW, rusW, example);
    localStorage.setItem('wordsToLearn', JSON.stringify(wordsToLearn));

    studyWords = [...wordsToLearn];
    localStorage.setItem('studyWords', JSON.stringify(studyWords)); // если перемешали слова до добавления нового, то порядок вернется к исходному

    examWords = makeExamWords(); // добавляем новое слово в экзамен
    localStorage.setItem('examWords', JSON.stringify(examWords));

    document.location.reload();
  });

  function showModal() {
    modal.classList.remove('hidden');
    okBtn.addEventListener('click', () => {
      modal.classList.add('hidden');
    });
  };
};

//кнопка удалить слово
removeWordBtn.addEventListener(('click'), showRemoveModal);

function showRemoveModal() {
  printRemoveModal();
  studyCards.classList.add('hidden');
  addWordPage.classList.add('hidden');
  shuffleBtn.disabled = true; // чтобы случайно не перемешать слова, пока мы их не видим
  removeWordPage.classList.remove('hidden');    
  
  function printRemoveModal() {   
    const fragment = new DocumentFragment();
  
    wordsToLearn.forEach((item) => {   
      fragment.append(makeRowByTemplate(item));
    });
    
    removeContent.append(fragment);
  };

  function makeRowByTemplate(word) { 
    const removeRow = removingTemplate.content.cloneNode(true);
    removeRow.querySelector('.word span').textContent = word.engWord;    
    return removeRow;  
  };

  //слушаем клики на кнопки Удалить
  removeContent.addEventListener(('click'), (event) => {
    if (!event.target.id ==='remove') {
      return;
    };
    const deletedRow = event.target.closest('.word-row');
    const deletedWord = deletedRow.querySelector('.word span').textContent;

    //удаляем слово из всех 3 массивов
    const newArr = wordsToLearn.filter((item) => item.engWord !== deletedWord);
    wordsToLearn = newArr; 
    localStorage.setItem('wordsToLearn', JSON.stringify(wordsToLearn)); // если удалить все слова, то слова по умолчанию добавятся снова

    studyWords = [...wordsToLearn];
    localStorage.setItem('studyWords', JSON.stringify(studyWords)); // если перемешали слова до удаления, то порядок вернется к исходному
    
    examWords = makeExamWords();
    localStorage.setItem('examWords', JSON.stringify(examWords));
    // убираем индекс отображаемого элемента, на случай, если удаляем последнее слово
    localStorage.removeItem('indexToPrint');

    deletedRow.querySelector('.btn-wrapper').innerHTML = '';
  });

  // кнопка для закрывания окошка
  okRemoveBtn.addEventListener(('click'), closeRemoveModal);

  function closeRemoveModal() {
    removeWordPage.classList.add('hidden');
    studyCards.classList.remove('hidden');
    document.location.reload();
  };
};

//exam mode
// массив с отдельными словами для экзамена, чтобы можно было ВСЕ перемешать
let examWords = [];
try {
  examWords = JSON.parse(localStorage.getItem('examWords') || '[]');
} catch (error) {
  console.log(error);
};

if (!examWords.length) {
  examWords = makeExamWords(); // массив с рандомным порядком слов
  localStorage.setItem('examWords', JSON.stringify(examWords));
};

function makeExamWords() {
  const words = [];
  studyWords.forEach((item) => {
    const obj1 = {'examWord': item.engWord};
    const obj2 = {'examWord': item.rusWord};
    words.push(obj1, obj2);
  });
  shuffle(words);
  return words;
};
// восстанавливаем прогресс, если он был
let isExamModeOn = false;
try {
  isExamModeOn = JSON.parse(localStorage.getItem('examModeMark') || 'false');
} catch (error) {
  console.log(error);
};

let fadedCardCounter = 0; // сколько слов уже было отвечено
try {
  fadedCardCounter = JSON.parse(localStorage.getItem('fadedCardCounter') || '0');
} catch (error) {
  console.log(error);
};

if (isExamModeOn) {
  switchExamMode();
};
// кнопка перехода в режим тестирования (из режима тренировки)
examBtn.addEventListener('click', switchExamMode);

function switchExamMode() {
  studyCards.classList.add('hidden');
  studyModeSidebar.classList.add('hidden');
  examModeSidebar.classList.remove('hidden');
  printExamCards();
  printCorrectPercent();
  runTimer();
  localStorage.setItem('examModeMark', JSON.stringify(true));
};

function printExamCards() {
  const fragment = new DocumentFragment();

  examWords.forEach((item) => {
    const cardToExam = document.createElement('div');
    cardToExam.textContent = item.examWord;
    cardToExam.classList.add('card');
    if(item.isFadedOut) { // восстановление прогресса
      cardToExam.classList.add('faded');
    };
    fragment.append(cardToExam);
  });

  examCards.append(fragment);    
};

// таймер
let seconds = null;
try {
  seconds = JSON.parse(localStorage.getItem('time') || '0');
} catch (error) {
  console.log(error);
};

function runTimer() { 
  timerId = setInterval(() => {
    seconds += 1;
    localStorage.setItem('time', JSON.stringify(seconds));
    timer.textContent = getTimeStr(seconds);
  }, 1000);
};

function getTimeStr(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;

  const addZero = (unit) => {
    if (unit < 10) {
      return `0${unit}`;
    } else {
      return `${unit}`;
    };
  };

  return addZero(m) + ':' + addZero(s);
};

// кнопка начать сначала (начинает сначала экзамен)
restartBtn.addEventListener('click', restartExamMode);

function restartExamMode() {
  reset();
  switchExamMode();
};

function reset() {
  // останавливаем текущий сеанс
  clearInterval(timerId);
  seconds = 0;
  examCards.innerHTML = "";
  clearStorage();
  // обнуляем статистику
  removeStatMarks();
  //перемешиваем карточки и снимаем метки с отвеченных слов
  examWords = makeExamWords();  
  // сбрасываем флаги и иже с ним
  fadedCardCounter = 0;
  // если уже показана статистика, убираем окно
  resultsModal.classList.add('hidden');
  resultsContent.innerHTML = '';
};

// кнопка вернуться к тренировке
goToLearnBtn.addEventListener('click', restartLearnMode);

function restartLearnMode() {
  reset();
  switchLearnMode();
};

function switchLearnMode() {
  studyCards.classList.remove('hidden');
  examCards.innerHTML = '';
  studyModeSidebar.classList.remove('hidden');
  examModeSidebar.classList.add('hidden');  
};

// клики по карточкам в режиме тестирования
let isCardSelected = false;
let isCardWrong = false;
let firstCard = null;
let secondCard = null;

examCards.addEventListener('click', (event) => {
  // если кликнули между карточками
  if (event.target.className !== 'card') {
    return;
  };
  // если неправильный ответ еще не обработан
  if (isCardWrong) {
    return;
  };
  // если кликнули по карточке
  if (!isCardSelected) {
    firstCard = event.target;    
    firstCard.classList.add('correct');
    isCardSelected = true;
    markFirstWord(firstCard.textContent); //для подсчета попыток
  } else {
    secondCard = event.target;
    countAttempts();
    if (checkAnswer(firstCard.textContent, secondCard.textContent)) {
      fadeOutWord(firstCard.textContent); // меточки для восстановления прогресса
      fadeOutWord(secondCard.textContent);
      secondCard.classList.add('correct', 'fade-out');
      firstCard.classList.add('fade-out');      
      fadedCardCounter += 2; // для подсчета % прогресса
      localStorage.setItem('fadedCardCounter', JSON.stringify(fadedCardCounter));
      printCorrectPercent();
      unmarkFirstWord();
      isCardSelected = false;
      if (fadedCardCounter === examWords.length) { // дошли до конца
        finishExam();
      };
    } else {
      secondCard.classList.add('wrong');
      isCardWrong = true;
      setTimeout(() => {
        secondCard.classList.remove('wrong');
        isCardWrong = false;
      }, 500);            
    };
  };
});

function fadeOutWord(text) {
  examWords.forEach((item) => {
    if(text === item.examWord) {
      item.isFadedOut = true;
      localStorage.setItem('examWords', JSON.stringify(examWords));
    };
  });  
};

function checkAnswer(word1, word2) {
  for (let word of wordsToLearn) {
    if (word1 === word.engWord && word2 === word.rusWord) {          
      return true;
    } else if (word1 === word.rusWord && word2 === word.engWord) {
      return true;
    };      
  };
  return false;
};

function markFirstWord(word) {
  wordsToLearn.forEach((item) => {
    if (word === item.engWord || word === item.rusWord) {
      item.mark = true;      
    };
  });  
};

function unmarkFirstWord() {
  wordsToLearn.forEach((item) => {
    if (item.mark) {
      item.mark = false;
    };
  });  
};

function countAttempts() {
  wordsToLearn.forEach((item) => {
    if (item.mark) {
      item.attempts += 1;
      localStorage.setItem('wordsToLearn', JSON.stringify(wordsToLearn));
    };
  });  
};

function printCorrectPercent() {
  const percent = Math.round(fadedCardCounter / examWords.length * 100);
  correctPercent.textContent = `${percent}%`;
  examProgress.value = percent;
};

function finishExam() {
  clearInterval(timerId);
  clearStorage();
  printStat();
  removeStatMarks();  
};

function clearStorage() {
  localStorage.removeItem('time');
  localStorage.removeItem('studyWords');
  localStorage.removeItem('fadedCardCounter');
  localStorage.removeItem('examModeMark');
  localStorage.removeItem('indexToPrint');
  localStorage.removeItem('examWords');
};

function removeStatMarks() {
  unmarkFirstWord();

  wordsToLearn.forEach((item) => item.attempts = 0);  
  localStorage.setItem('wordsToLearn', JSON.stringify(wordsToLearn));
};

// рисуем статистику
function makeStatByTemplate(word) { 
  const wordStat = statTemplate.content.cloneNode(true);
  wordStat.querySelector('.word span').textContent = word.engWord;
  wordStat.querySelector('.attempts span').textContent = word.attempts;
  return wordStat;  
};

function printStat() {   
  const fragment = new DocumentFragment();

  wordsToLearn.forEach((item) => {   
    fragment.append(makeStatByTemplate(item));
  });
  
  resultsContent.append(fragment);

  resultTimer.textContent = getTimeStr(seconds);
  resultsModal.classList.remove('hidden');
};