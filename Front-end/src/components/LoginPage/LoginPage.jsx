import React, { useState, useEffect, useContext } from 'react';
import './LoginPage.css';
import { ref, onValue } from 'firebase/database';
import { useNavigate } from 'react-router-dom';
import { db } from '../../firebase.js';
import user_icon from '../../Assets/Icons/usernameIcon.png';
import password_icon from '../../Assets/Icons/passwordIcon.png';
import logohvra_icon from '../../Assets/Icons/graphmap.png';
import logohvraMan_icon from '../../Assets/Icons/manlogo.png';
import Haifa_icon from '../../Assets/Icons/Haifa.png';
import SignUp from './SignUp';
import ForgotPasswordPopup from './ForgotPasswordPopup'; // Import ForgotPasswordPopup
import { UserContext } from '../../context/UserContext';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showSignUp, setShowSignUp] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false); // State to show Forgot Password Popup
  const [users, setUsers] = useState([]);
  const [customers, setCustomers] = useState([]);
  const navigate = useNavigate();
  const { setUser } = useContext(UserContext);
  const auth = getAuth();

  useEffect(() => {
    const fetchUsers = () => {
      const usersRef = ref(db, 'users/');
      onValue(usersRef, (snapshot) => {
        const data = snapshot.val();
        const userList = data ? Object.values(data) : [];
        setUsers(userList);
      });
    };

    const fetchCustomers = () => {
      const customersRef = ref(db, 'customers/');
      onValue(customersRef, (snapshot) => {
        const data = snapshot.val();
        const customerList = data ? Object.values(data) : [];
        setCustomers(customerList);
      });
    };

    fetchUsers();
    fetchCustomers();
  }, []);

  const handleLogin = () => {
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const firebaseUser = userCredential.user;
        const allUsers = [...users, ...customers];
        const user = allUsers.find((u) => u.email === email);

        if (user) {
          setUser({ ...user, uid: firebaseUser.uid });
          switch (user.userType) {
            case 'manager':
              navigate('/manager');
              break;
            case 'employee_office':
              navigate('/employee-office-main');
              break;
            case 'field_worker':
              navigate('/field-worker-main');
              break;
            default:
              console.log('User type not recognized');
          }
        } else {
          console.log('User found in Firebase Auth but not in Realtime Database');
          alert('User found in Firebase Auth but not in Realtime Database');

        }
      })
      .catch((error) => {
        console.log('Invalid email or password:', error.message);
        alert('Invalid email or password'); // Show alert on error

      });
  };

  const handleCloseSignUp = () => {
    setShowSignUp(false);
  };

  const handleForgotPasswordClick = () => {
    setShowForgotPassword(true); // Show the Forgot Password Popup
  };

  const handleCloseForgotPassword = () => {
    setShowForgotPassword(false); // Close the Forgot Password Popup
  };

  if (showSignUp) {
    return <SignUp onClose={handleCloseSignUp} />;
  }

  return (
    <div className="container">
      <div className="header">
        <img src={logohvra_icon} alt="Logo" />
        <div className="text">Sign in</div>
        <div className="underline"></div>
      </div>
      <div className="inputs">
        <div className="input">
          <img src={user_icon} alt="User Icon" />
          <input
            type="text"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="input">
          <img src={password_icon} alt="Password Icon" />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
      </div>
      <div className="submit-container">
        <div className="submit" onClick={handleLogin}>
          Login
        </div>
      </div>
      <div className="forgot-password" onClick={handleForgotPasswordClick}>
        Forgot password?<span>Click here!</span>
      </div>
      <div className="lastpart">
        <div className="haifalogo">
          <img src={Haifa_icon} alt="Haifa Logo" />
        </div>
        <div className="manlogo">
          <img src={logohvraMan_icon} alt="Man Logo" />
        </div>
      </div>

      {/* Render the Forgot Password Popup */}
      {showForgotPassword && (
        <ForgotPasswordPopup
          open={showForgotPassword}
          onClose={handleCloseForgotPassword}
        />
      )}
    </div>
  );
};

export default LoginPage;
