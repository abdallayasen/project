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
import { UserContext } from '../../context/UserContext'; // Correct import path

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showSignUp, setShowSignUp] = useState(false);
  const [users, setUsers] = useState([]);
  const [customers, setCustomers] = useState([]);
  const navigate = useNavigate();
  const { setUser } = useContext(UserContext); // Use UserContext

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
    const allUsers = [...users, ...customers]; // Combine users and customers
    const user = allUsers.find(u => u.email === email && u.password === password);
    if (user) {
      setUser(user); // Set the logged-in user in context
      switch (user.userType) {
        case 'manager':
          navigate('/manager');
          break;
        case 'customer':
          navigate('/customermainpage');
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
      console.log('Invalid email or password');
    }
  };

  const handleCloseSignUp = () => {
    setShowSignUp(false);
  };

  if (showSignUp) {
    return <SignUp onClose={handleCloseSignUp} />;
  }

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

       
