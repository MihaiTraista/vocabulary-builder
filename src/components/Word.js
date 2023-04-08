import { useState, useEffect } from 'react';

export default function Word({ currentWord, quizFlag, isCorrect, quizNewWord, handleAnswer, showMeme }){
  const [formValue, setFormValue] = useState('');
  const [concealed, setConcealed] = useState(null);

  useEffect(() => {
    console.log(`______________ ${currentWord.word}`);
    const re = new RegExp(currentWord.word, "gi");
    setConcealed([currentWord.def, ...currentWord.examples].map(sentance => sentance.replace(re, '_____')));
  }, [currentWord]);


  const handleSubmit = (event) => { // async because isCorrect should be set before goToNextPage 
    event.preventDefault()
    console.log(`formValue ${formValue}, currentWord.word ${currentWord.word} correct ${formValue === currentWord.word}`);
    handleAnswer(formValue === currentWord.word)
    setFormValue('');
  }

  return currentWord && concealed &&
    <div 
      className="word" 
      style={{"borderColor": quizFlag ? "rgb(0, 69, 173)" : isCorrect ? "green" : "red"}}>

      {!showMeme ? 
      <>
        {quizFlag ?
          <form onSubmit={handleSubmit}>
            <input type="text" value={formValue} onChange={(e) => setFormValue(e.target.value)} />
            <button type="submit" disabled={!formValue}>Submit</button>
          </form>
          :
          <div style={{"display": "flex", "justify-content": "center"}}>
            <h1>{currentWord.word}</h1>
            <button onClick={quizNewWord}>Next</button>
          </div>
        }
        
        <p className="def">{quizFlag ? concealed[0] : currentWord.def}</p>
        <p>{quizFlag ? concealed[1] : currentWord.examples[0]}</p>
        <p>{quizFlag ? concealed[2] : currentWord.examples[1]}</p>
        <p>{quizFlag ? concealed[3] : currentWord.examples[2]}</p>
      </>
      :
      <>
        <h1>that's like...</h1>
        <iframe style={{"height": "400px"}}title="meme" src={currentWord.meme}></iframe>
        <button onClick={quizNewWord}>Next</button>
      </>}  
    </div>
}