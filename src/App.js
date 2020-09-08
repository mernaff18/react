import React from 'react';
import logo from './logo.svg';
import './App.css';
import { fetchData } from './app/modules/reducer';

function App() {
  return (
    <div className="App">
      <p>test</p>
      <ul>
      {fetchData.map((d) => (
        <li>
          <img alt="logo" />
          <p>{}</p>
        </li>
      ))}
      </ul>
    </div>
  );
}

export default App;
