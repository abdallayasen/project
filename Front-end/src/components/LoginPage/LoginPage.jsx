import React, { useState, useEffect } from 'react';
import './LoginPage.css';
import { getDatabase, ref, onValue } from 'firebase/database';
import { db } from '../../firebase.js'; // Adjust the path as needed
import user_icon from '../../Assets/Icons/usernameIcon.png';
import password_icon from '../../Assets/Icons/passwordIcon.png';
import logohvra_icon from '../../Assets/Icons/graphmap.png';
import logohvraMan_icon from '../../Assets/Icons/manlogo.png';
import Haifa_icon from '../../Assets/Icons/Haifa.png';

import SignUp from './SignUp'; // Ensure the correct import path
//import ManagerMainPage from '../Manager_Model/ManagerMainPage'; 
//import CustomerMainpage from '../Customer_Model/CustomerMainpage'; 
//import FiledWorkerMainPage from '../field_worker_Model/FiledWorkerMainPage';
//import EmployeeOfficeMainpage from '../employee_office_Model/EmployeeOfficeMainpage';
import AddPost from '../AddPost.jsx';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showSignUp, setShowSignUp] = useState(false);
  const [users, setUsers] = useState([]);
  const [showManagerMainPage, setShowManagerMainPage] = useState(false);
  //const [showCustomerMainpage, setShowCustomerMainpage] = useState(false);
  //const [showFiledWorkerMainPage, setShowFiledWorkerMainPage] = useState(false);
  //const [showEmployeeOfficeMainpage, setShowEmployeeOfficeMainpage] = useState(false);

  // Fetch users when component mounts
  useEffect(() => {
    const usersRef = ref(db, 'users/');
    onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      const userList = data ? Object.values(data) : [];
      setUsers(userList);
    });
  }, []);

  const handleLogin = () => {
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
      switch (user.userType) {
        case 'manager':
          setShowManagerMainPage(true);
          break;
    //    case 'customer':
      //    setShowCustomerMainpage(true);
        //  break;
        //case 'field_worker':
         // setShowFiledWorkerMainPage(true);
          //break;
        //case 'employee_office':
         // setShowEmployeeOfficeMainpage(true);
         // break;
        default:
          console.log('User type not recognized');
      }
    } else {
      console.log('Invalid email or password');
    }
  };

  const handleSignup = () => {
    console.log('Signup button clicked');
    setShowSignUp(true);
    console.log('showSignUp state set to true');
  };

  const handleCloseSignUp = () => {
    console.log('Closing signup modal');
    setShowSignUp(false); // Close the sign-up modal
  };

  useEffect(() => {
    console.log('showSignUp state:', showSignUp);
  }, [showSignUp]);

  if (showSignUp) {
    console.log('Rendering SignUp component');
    return <SignUp onClose={handleCloseSignUp} />;
  }

  if (showManagerMainPage) {
    return <AddPost />;
  }

  //if (showCustomerMainpage) {
    //return <CustomerMainpage />;
 // }

 // if (showFiledWorkerMainPage) {
   // return <FiledWorkerMainPage />;
 // }

  //if (showEmployeeOfficeMainpage) {
   // return <EmployeeOfficeMainpage />;
  //}

  return (
    <div className='container'>
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
        <div className="submit" onClick={handleLogin}>Login</div>
      </div>
      <div className="forgot-password">Forgot password?<span>Click here!</span></div>
      <div className="signup-link">
        <button className="signup-button" onClick={handleSignup}>Sign Up</button>
      </div>

      <div className="lastpart">
        <div className="haifalogo">
          <img src={Haifa_icon} alt="Haifa Logo" />
        </div>
        <div className="manlogo">
          <img src={logohvraMan_icon} alt="Man Logo" />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
