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
  // todo replace this with aws auth
  const [isAuthenticated, userHasAuthenticated] = useState(localStorage.getItem('userHasAuthenticated'));
  const [isAdmin, isUserAdmin] = useState(localStorage.getItem('isUserAdmin'));

  function handleLogout() {
    userHasAuthenticated(false);
    localStorage.removeItem('userHasAuthenticated')
    localStorage.removeItem('isUserAdmin')
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
        <AppContext.Provider value={{ isAuthenticated, userHasAuthenticated, isAdmin, isUserAdmin }}>
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
