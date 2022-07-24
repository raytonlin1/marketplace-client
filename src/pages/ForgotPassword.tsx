import { useState } from 'react'
import { Link } from 'react-router-dom'
import { getAuth, sendPasswordResetEmail } from 'firebase/auth'
import { toast } from 'react-toastify'
import { ReactComponent as ArrowRightIcon } from '../assets/svg/keyboardArrowRightIcon.svg'

function ForgotPassword() {
  const [email, setEmail] = useState<string>('')
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value)
  }

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      const auth = getAuth()
      await sendPasswordResetEmail(auth, email)
      toast.success('Password Reset email was sent (check Spam folder)')
    } catch (error) {
      toast.error('Could not set password reset email')
    }
  }

  return (
    <div className="pageContainer">
      <header>
        <p className="pageHeader">
          Forgot Password 
        </p>
      </header>

      <main>
        <form onSubmit={onSubmit}>
          <input type="email" className="emailInput" 
          placeholder='Email' id='email' value={email}
          onChange={onChange}
          />
          <Link className='forgotPasswordLink' to='/sign-in'>
            Sign In
          </Link>

          <div className='signInBar'>
            <div className='signInText'>
              Send Reset Link
            </div>
            <button className="signInButton" type="submit">
              <ArrowRightIcon fill='#ffffff' width='34px' height='34px'/>
            </button>
          </div>
        </form>
      </main>

    </div>
  );
}

export default ForgotPassword;
