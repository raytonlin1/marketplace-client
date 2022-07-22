import { useState } from 'react';
import {Link, useNavigate} from 'react-router-dom'
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'
import {ReactComponent as ArrowRightIcon} from '../assets/svg/keyboardArrowRightIcon.svg'
import visibilityIcon from '../assets/svg/visibilityIcon.svg'

function SignIn() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const {email, password} = formData;
  const navigate = useNavigate();

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prevState)=>({
      ...prevState,
      [e.target.id]: e.target.value
    }))
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    try {
      const auth = getAuth();

      const userCredential = await signInWithEmailAndPassword(auth,email,password);
      if (userCredential.user) {
        navigate('/');
      }
    } catch (error) {
      if (error instanceof Error) {
        console.log(error)
      }
    }
  };

  return (
    <>
      <div className='pageContainer'>
        <header>
          <p className='pageHeader'>Welcome Back!</p>
        </header>

        <form onSubmit={onSubmit}>
          <input type='email' className='emailInput'
            placeholder='Email' id='email' value={email} 
            onChange={onChange}
          />
          
          <div className='passwordInputDiv'>
            <input type={showPassword ? 'text' : 'password'} 
              placeholder='Password'
              className='passwordInput' id='password' 
              value={password} onChange={onChange}
            />

            <img src={visibilityIcon} alt="show password" 
              className="showPassword"
              onClick={() => setShowPassword((prevState) => !prevState)} />
          </div>

          <Link to='/forgot-password' className='forgotPasswordLink'>
            Forgot Password
          </Link>

          <div className='signInBar'>
            <p className='signInText'>
              Sign In
            </p>
            <button className="signInButton" type="submit">
              <ArrowRightIcon fill='#ffffff' width='34px' height='34px' />    
            </button>
          </div>
        </form>

        {/* Google Oauth */}

        <Link to='/sign-up' className='registerLink'>
          Sign up instead
        </Link>

      </div>
    </>
  );
}

export default SignIn;
