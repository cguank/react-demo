import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import {List} from './pages/List';
import {SingleChld} from './pages/SingleChild';
import {UseEffect} from './pages/UseEffect';
import {BailOut} from './pages/BailOut';
import {Concurrent} from './pages/Concurrent';
import {APage} from './pages/APage';
import {ClickEvent} from './pages/ClickEvent';
import {Diff} from './pages/Diff';
import {UseContext} from './pages/UseContext';
import {UseRef} from './pages/UseRef';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(
  document.getElementById('root')
);

// root.render(<Concurrent />)
// root.render(<UseRef />)
root.render(<Diff />)
// root.render(<UseContext />)
// root.render(<UseEffect />)
// root.render(<BailOut />)
// root.render(<List />)
// root.render(<ClickEvent />)
// root.render(<APage />)
// root.render(<SingleChld />)
// root.render(<App />)
// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
