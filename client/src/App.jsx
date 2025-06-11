import Canvas from './canvas';
import Customizer from './pages/Customizer';
import Home from './pages/Home';
import ErrorBoundary from './canvas/ErrorBoundary';

function App() {
    return (
      <main className="app transition-all ease-in">
        <Home />
        <ErrorBoundary>
          <Canvas />
        </ErrorBoundary>
        <Customizer />
      </main>
       
  )
}

export default App
