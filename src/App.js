import './App.css'
import React from "react";
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom'
import Convert from './Pages/Convert';

function App() {
  return(
    <Router>
      <div>
        <Routes>
          <Route exact path='/sign-kit/convert' element={<Convert />} />
          <Route exact path='*' element={<Convert/>} />
        </Routes>

        
      </div>
    </Router>
  )
}

export default App;