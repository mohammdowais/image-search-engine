import React, { useState } from 'react';
import axios from 'axios';
import FileInput from './components/FileInput';
import Button from './components/Button';
import Images from './components/Images';

function App() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleImageChange = (file) => {
    setSelectedImage(file);
    setResults([]); // Clear previous results
  };

  const handleImageUpload = async () => {
    if (!selectedImage) return;

    const formData = new FormData();
    formData.append('image', selectedImage);

    setLoading(true);

    try {
      const response = await axios.post('http://localhost:3000/search', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setResults(response.data);
    } catch (error) {
      console.error('Error fetching similar images:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100 p-4 bg-gradient-to-b from-slate-900 to-cyan-900">
    <h1 className="flex text-4xl font-bold mb-10 mt-3 text-slate-400">Image to Image Search</h1>

    <h1 className="flex text-2xl font-bold mb-10 mt-3 text-slate-500">Drop an image below to find similar looking images.</h1>
    
    <div className="mb-4">
      <FileInput handleImageChange={handleImageChange} setSelectedImage={setSelectedImage}/>
    </div>
    
    <Button handleImageUpload={handleImageUpload} selectedImage={selectedImage} loading={loading}/>

    <Images results={results}/>
  </div>
  );

}

export default App;
