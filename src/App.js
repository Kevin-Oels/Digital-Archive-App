import React, {useState} from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
} from "react-router-dom";
import ArchiveGrid from './components/archiveGrid'
import ArchiveItem from './components/archiveItem'
import Login from "./components/login";
import './App.css';
import { AppContext } from "./helpers/contextLib";

function App() {
  const [isAuthenticated, userHasAuthenticated] = useState(localStorage.getItem('userHasAuthenticated'));
  const [userAttributes, setUserAttributes] = useState(JSON.parse(localStorage.getItem('userAttributes')));

  let isAdmin = false

  if (userAttributes) {
    // set admin state based on groupss
    isAdmin = userAttributes['cognito:groups'] ?  userAttributes['cognito:groups'].includes('admins') : false;

    // logout user if the access token as expired
    const timeNow = Math.floor(new Date().getTime()/1000.0)
    if (timeNow > userAttributes.exp) {
      handleLogout()
    }
  }


  function handleLogout() {
    userHasAuthenticated(false);
    setUserAttributes(null);
    localStorage.removeItem('userHasAuthenticated')
    localStorage.removeItem('userAttributes')
    window.location.href="/login";
  }

  function showItem(props) {
    return <ArchiveItem props={props} />
  }
  
  function showGrid(props) {
    return <ArchiveGrid props={props} />
  }

  return (
    <Router>
      <div className="App">
        <header className="App-header">
          Document Archive
        
          <div className='login-container'>
            {isAuthenticated ? (<Link to='/' onClick={handleLogout}>Logout</Link> )
            : (
            <Link to='/login'>Login</Link>
            )}
          </div>
        </header>
        <AppContext.Provider value={{ isAuthenticated, userHasAuthenticated, isAdmin, userAttributes}}>
          <Switch>
            <Route exact path="/login"><Login /></Route>
            <Route path="/item/:documentid" component={showItem} />
            <Route path="/" component={showGrid} />
          </Switch>
        </AppContext.Provider>
      </div>
    </Router>
  );
}

export default App;
