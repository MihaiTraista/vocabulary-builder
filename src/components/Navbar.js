import { UserContext } from '../lib/context';
import { useContext } from 'react';
import { auth, googleAuthProvider, googleEmailProvider } from '../lib/firebase';
import firebase from 'firebase/compat/app';

export default function Navbar({ userProgress }){
  const { user } = useContext(UserContext);

  const signOut = () => {
    auth.signOut();
  }

  const signIn = async (provider) => {
    if (provider === "google"){
      try {
        await auth.signInWithPopup(googleAuthProvider);
        console.log(`Successfully signed in ${auth.currentUser.displayName}`)
      } catch(err){
        console.log(`Could not sign in user. ${err}`);
      }  
    }

    if (provider === "email"){
      try {
        await auth.signInWithPopup(googleEmailProvider);
        console.log(`Successfully signed in ${auth.currentUser.displayName}`)
      } catch(err){
        console.log(`Could not sign in user. ${err}`);
      }  
    } 
  }


  return(
    <div className="navbar">
      {user ?
        <div className="profile">
          {/* <h5>L {userProgress.learning} M {userProgress.mastered}___</h5> */}
          <img className="user-pic" src='/hacker.png' alt="user face"/>          
          <div className="mastered-count-div"></div>          
          <h5 className="mastered-count">{userProgress.mastered}</h5>          
          <button onClick={signOut}>Sign out</button>
        </div> 
      : 
      <>
        <button onClick={() => signIn("google")}>Signin with Google</button>
      </>}
    </div>
  )
}