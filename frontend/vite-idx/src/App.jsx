import './App.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import ListingsPage from './components/ListingsPage';
import PropertyDetailPage from './components/PropertyDetailPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ListingsPage />} />
        <Route path="/property/:id" element={<PropertyDetailPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
