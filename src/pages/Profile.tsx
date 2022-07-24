import { useState, useEffect, useRef } from 'react'
import { getAuth, updateProfile } from 'firebase/auth'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '../firebase.config'
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify'
import arrowRight from '../assets/svg/keyboardArrowRightIcon.svg'
import homeIcon from '../assets/svg/homeIcon.svg'

type User = {
  name?: string;
  email?: string;
};

function Profile() {
  const [user, setUser] : [User, any] = useState({});
  var { name, email } = user;
  const [changeDetails, setChangeDetails] = useState<boolean>(false);

  const auth = getAuth();
  useEffect(() => {
    auth.onAuthStateChanged((user) => {
      if (user) {
        setUser({
          name: user.displayName,
          email: user.email
        });
      }
    })
  },[auth])

  const navigate = useNavigate();

  const onLogout = () => {
    auth.signOut();
    navigate('/');
  }

  const onSubmit = async () => {
    try {
      if (auth.currentUser!.displayName !== name) {
        await updateProfile(auth.currentUser!, {
          displayName: name
        });

        const userRef = doc(db, 'users', auth.currentUser!.uid);
        await updateDoc(userRef, {
          name
        });
      }
    } catch (error) {
      toast.error('Could not update profile')
    }
  }

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUser((prevState: User) => ({
      ...prevState,
      [e.target.id]: e.target.value
    }))
  }

  return (
    <div className="profile">
      <header className="profileHeader">
        <p className="pageHeader">
          My Profile 
        </p>
        <button type="button" className="logOut" onClick={onLogout}>
          Log Out
        </button>
      </header>

      <main>
        <div className="profileDetailsHeader">
          <p className="profileDetailsText">
            Personal Details
          </p>
          <p className="changePersonalDetails"
          onClick={() => {
            changeDetails && onSubmit();
            setChangeDetails(!changeDetails);  
          }}>
            {changeDetails ? 'done' : 'change'}
          </p>
        </div>

        <div className="profileCard">
          <form>
            <input type="text" 
            id="name" 
            className={!changeDetails ? 'profileName' : 'profileNameActive'} 
            disabled={!changeDetails} value={name} onChange={onChange}
            />

            <input type="text" 
            id="email" 
            className={!changeDetails ? 'profileEmail' : 'profileEmailActive'} 
            disabled={!changeDetails} value={email} onChange={onChange}
            />
          </form>

        </div>

        <Link to='/create-listing' className='createListing'>
          <img src={homeIcon} alt='home' />
          <p>Sell or rent out an item</p>
          <img src={arrowRight} alt="arrow right" />
        </Link>
      </main>
    </div>
  );
}

export default Profile;
