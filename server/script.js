// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  where,
} from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";
const firebaseConfig = {
  apiKey: "AIzaSyAbZ9Aty-PQbRwBqNnADdoDcGrhIWZo2BE",
  authDomain: "globetrotter-482e6.firebaseapp.com",
  projectId: "globetrotter-482e6",
  storageBucket: "globetrotter-482e6.firebasestorage.app",
  messagingSenderId: "539129412895",
  appId: "1:539129412895:web:811564e45f7c0f8410442a",
  measurementId: "G-QNSQ0G9V0C",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

var currentQuestionId;
async function getRandomQuestion() {
  const questionCol = collection(db, "questions");
  const querySnapshot = await getDocs(questionCol);

  const randomQuestion =
    querySnapshot.docs[Math.floor(Math.random() * querySnapshot.docs.length)];

  return {
    id: randomQuestion.id,
    ...randomQuestion.data(),
  };
}

function generateRandom(till) {
  return Math.floor(Math.random() * till);
}
async function displayRandomQuestion() {
  var question = await getRandomQuestion();
  while (question.options.length < 4) {
    question = await getRandomQuestion();
  }
  if (question) {
    currentQuestionId = question.id;
    const correctAnswerData = await checkAnswer(question.id);

    document.getElementById("question").innerText = question.clue;
    const options = question.options;
    const optionsContainer = document.getElementById("options");

    optionsContainer.innerHTML = "";
    for (var i = 0; i < 4; i++) {
      let option = options[i];
      const button = document.createElement("button");
      button.className = "optionBtn";
      button.value = option;
      button.innerText = `${i + 1}. ${option}`;
      optionsContainer.appendChild(button);
    }
    let randomNumber = generateRandom(4);
    document.querySelectorAll(".optionBtn")[randomNumber].innerText = ` ${
      randomNumber + 1
    } ${correctAnswerData.answer}`;
    document.querySelectorAll(".optionBtn")[randomNumber].value =
      correctAnswerData.answer;
  }
}

async function checkAnswer(questionId) {
  const querySnapshot = await getDocs(
    query(collection(db, "answers"), where("docId", "==", questionId))
  );

  let answer = null;
  querySnapshot.forEach((doc) => {
    answer = doc.data().answer;
  });

  return { answer };
}

function getTrivia() {}
document.addEventListener("DOMContentLoaded", displayRandomQuestion);
