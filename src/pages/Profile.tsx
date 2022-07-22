import { useState, useEffect } from 'react'
import { getAuth } from 'firebase/auth'

type User = {
  displayName?: number;
};

function Profile() {
  const [user, setUser] : [User, any] = useState({});

  const auth = getAuth();
  const curUser = auth.currentUser;
  useEffect(() => {
    if (curUser) {
      setUser(curUser);
    }
  },[])

  return (
    <div className="App">
      {(user) ? <h1>{user.displayName}</h1> : 'Not Logged In'}
    </div>
  );
}

export default Profile;
