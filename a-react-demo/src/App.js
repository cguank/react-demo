import React,{useEffect,useState,createContext,useContext,useRef} from 'react'
import './App.css';
import { Link, BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import { APage  } from './pages/APage';
import { BPage  } from './pages/BPage';

const BaseContext = createContext(1);
const BaseContextDemo = () => {
  const { base } = useContext(BaseContext);
  return <div>{base}</div>;
};

const App = () => {
  const [count, setCount] = useState(0);

  const handleClick = () => {
    // setCount(0);
    setCount(v => v + 1);
  };

  useEffect(() => {
    console.log('Hello Mount Effect');
    return () => {
      console.log('Hello Unmount Effect');
    };
  }, []);
  useEffect(() => {
    console.log('Hello count Effect');
  }, [count]);

  const ref = useRef();

  const [base, setBase] = useState(null);
  const initValue = {
    base,
    setBase,
  };

  return (
    <div>
      <div ref={ref}>
        <div>Render by state</div>
        <div>{count}</div>
        <button onClick={handleClick}>Add Count</button>
        <button onClick={() => setBase(i => ++i)}>Add Base</button>
        <BaseContextDemo />
      </div>
    </div>
    // <BaseContext.Provider value={initValue}>
    //   <div ref={ref}>
    //     <div>Render by state</div>
    //     <div>{count}</div>
    //     <button onClick={handleClick}>Add Count</button>
    //     <button onClick={() => setBase(i => ++i)}>Add Base</button>
    //     <BaseContextDemo />
    //   </div>
    // </BaseContext.Provider>
  );
};

// function App () {
//   return (
//       <Router>
//         <Link to="/apage">apage</Link>
//         <Link to="/bpage">bpage</Link>
//         <Routes>
//           <Route path="/apage" element={<APage/> } />
//           <Route path="/bpage" element={<BPage/> } />
//         </Routes>
//       </Router>
//   );
// }



// class App extends React.Component {
//   constructor() {
//     super()
//     this.state = {
//       count: 0
//     }
//   }
//   componentDidMount () {
//     console.log('....mount');
//   }
//   componentDidUpdate () {
//     console.log('......update');
//   }
//   componentWillUnmount () {
//     console.log('......unmount');
//   }
//   render () {
//     return (
//       <div className="App">
//         <p>{this.state.count}</p>
//         <span onClick={() => this.setState({count: this.state.count+1})}>click me</span>
//       </div>
//     )
//   }
// }

export default App;
