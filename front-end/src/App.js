import logo from './logo.svg';
import './App.css';
import UserForm from './components/UserForm';
import Login from './components/Login';

const code = new URLSearchParams(window.location.search).get('code')

function App() {

  return (
    <div className="App">
      <h1>Playlist Mate</h1>
      {code ? <div><Login code={code} /><UserForm code={code} /></div> : <Login code={code}/>}
    </div>
  );
}

export default App;
