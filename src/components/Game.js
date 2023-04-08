import { UserContext } from '../lib/context';
import { useContext, useState } from 'react';
import { firestore, serverTimestamp, firestoreIncrement } from '../lib/firebase';
import Word from './Word';
const TIMES_TO_MASTER = 2

export default function Game({ newWords }){
  const { user } = useContext(UserContext);
  const [gamePage, setGamePage] = useState('quiz'); // quiz, showWord, wordMastered
  const [currentWord, setCurrentWord] = useState(newWords[Math.floor(Math.random() * newWords.length)]);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showMeme, setShowMeme] = useState(false);

  const handleAnswer = async (isAnswerCorrect) => {
    console.log(`***** enter function handleAnswer`);

    setIsCorrect(isAnswerCorrect);

    const userRef = firestore.collection('ducks_users').doc(user.uid);
    const wordRef = userRef.collection('wordsLearning').doc(currentWord.word);
    const wordDoc = await wordRef.get();

    if (wordDoc.exists) {
      console.log(`in collection \n gotRight ${wordDoc.data().gotRight}, gotWrong ${wordDoc.data().gotWrong}, isCorrect ${isAnswerCorrect}`);

      if (isAnswerCorrect){
        await wordRef.update({gotRight: firestoreIncrement(1)});
        if (wordDoc.data().gotRight + 1 >= TIMES_TO_MASTER) {
          console.log(`Mastered word!!!`);
          setShowMeme(true);
          await wordRef.update({mastered: true, masteredAt: serverTimestamp()});
          await userRef.update({wordsLearningCount: firestoreIncrement(-1), wordsMasteredCount: firestoreIncrement(1)});
        }
      }
      else {
        await wordRef.update({gotWrong: firestoreIncrement(1)});              
      }

    } else {
      console.log(`not in collection ${currentWord.word}`);
      await wordRef.set({
        word: currentWord.word, 
        gotRight: Number(isAnswerCorrect), 
        gotWrong: Number(!isAnswerCorrect), 
        startedAt: serverTimestamp(),
        mastered: false, 
        masteredAt: ''});

        userRef.update( {wordsLearningCount: firestoreIncrement(1)} ); 
    }

    setGamePage('showWord');
  }

  const quizNewWord = () => {
    setCurrentWord(newWords[Math.floor(Math.random() * newWords.length)]);
    setShowMeme(false);
    setGamePage('quiz');
  }

  return(
    <div className="game">
      {gamePage === 'quiz' && currentWord &&
        <Word currentWord={currentWord} quizFlag={true} isCorrect={isCorrect} quizNewWord={quizNewWord} handleAnswer={handleAnswer} showMeme={showMeme}/>
      }
      {gamePage === 'showWord' && currentWord &&
        <Word currentWord={currentWord} quizFlag={false} isCorrect={isCorrect} quizNewWord={quizNewWord} handleAnswer={handleAnswer} showMeme={showMeme}/>
      }
    </div>
  )
}