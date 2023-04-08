import logo from './logo.svg';
import './App.css';
import Navbar from './components/Navbar.js';
import Game from './components/Game';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useState, useEffect } from 'react';
import { UserContext } from './lib/context';
import { auth, firestore } from './lib/firebase';


function App() {
  const [user] = useAuthState(auth);
  const [newWords, setNewWords] = useState(null);
  const [userProgress, setUserProgress] = useState({learning: 0, mastered: 0});

  useEffect(() => {
    let unsubscribe;

    if (user) {
      const userRef = firestore.collection('ducks_users').doc(user.uid);

      const fetchUserData = async () => {
        const { exists } = await userRef.get();
        if (!exists) {
          console.log(`user does not exist. Creating a document`);
          // create new document for user
          await userRef.set({
            name: user.displayName,
            wordsLearningCount: 0,
            wordsMasteredCount: 0
          });
          await userRef.collection('wordsLearning').doc('test_word').set({test_word: "foo"});
          await userRef.collection('wordsLearning').doc('test_word').delete();
          console.log(`Created.`);
        }

        unsubscribe = userRef.onSnapshot((doc) => {
          console.log(`%c onSnapshot ${doc.data().name} 
            learning ${doc.data().wordsLearningCount} 
            mastered ${doc.data().wordsMasteredCount}`, 'color: #bada55');

          setUserProgress({
            learning: doc.data().wordsLearningCount,
            mastered: doc.data().wordsMasteredCount});

          const wordsRef = firestore.collection('words').limit(5);
          const tempNewWords = [];
          const masteredList = [];
          const fetchNewWords = async () => {
            const newWordsQS = await wordsRef.get();
            newWordsQS.forEach((doc) => tempNewWords.push(doc.data()));

            if (doc.data().wordsMasteredCount === 0) {

              setNewWords(tempNewWords);

            } else {
              const allUserWordsQS = await userRef.collection('wordsLearning').get()
              allUserWordsQS.forEach((doc) => {
                if (doc.data().mastered === true)
                  masteredList.push(doc.data());
              });
              
              const filteredArray = tempNewWords.filter(({word}) => !masteredList.some((mas, i) =>  mas.word === word));
              console.log(`filteredArray.length ${filteredArray.length} masteredList.length ${masteredList.length}`);
              setNewWords(filteredArray);  
            }
          }

          fetchNewWords();
        });
      }
    
      fetchUserData()
        .catch(console.error);

    } else console.log(`User not signed in`);

    return unsubscribe;
  },[user]);



  return (
    <UserContext.Provider value={{ user }}>
      <div className="App">
        <Navbar userProgress={userProgress} />
        {user && newWords && <Game newWords={newWords}/>}
      </div>
    </UserContext.Provider>
  );
}

export default App;
