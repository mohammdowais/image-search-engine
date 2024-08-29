import React, { useState } from 'react';
import axios from 'axios';
import FileInput from './components/FileInput';
import Button from './components/Button';
import Images from './components/Images';

function App() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1); // New state to manage pagination

  const handleImageChange = (file) => {
    setSelectedImage(file);
    setResults([]); // Clear previous results
    setPage(1); // Reset page when a new image is selected
  };

  const handleImageUpload = async () => {
    if (!selectedImage) return;

    const formData = new FormData();
    formData.append('image', selectedImage);
    formData.append('page', page); // Send the current page to the server

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

  const handleLoadMore = async () => {
    const nextPage = page + 1;
    const formData = new FormData();
    formData.append('image', selectedImage);
    formData.append('page', nextPage); // Request the next page of results

    setLoading(true);

    try {
      const response = await axios.post('http://localhost:3000/search', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setResults((prevResults) => [...prevResults, ...response.data]); // Append new results to the existing ones
      setPage(nextPage); // Update the page state
    } catch (error) {
      console.error('Error fetching more images:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100 p-4 bg-gradient-to-b from-slate-900 to-cyan-900">
      <h1 className="flex text-4xl font-bold mb-10 mt-3 text-slate-400">Image to Image Search</h1>
      <h1 className="flex text-2xl font-bold mb-10 mt-3 text-slate-500">Drop an image below to find similar looking images.</h1>

      <div className="mb-4">
        <FileInput handleImageChange={handleImageChange} setSelectedImage={setSelectedImage} />
      </div>

      <Button handleImageUpload={handleImageUpload} selectedImage={selectedImage} loading={loading} />

      <Images results={results} />

      {results.length > 0 && (
        <button
          onClick={handleLoadMore}
          className="mt-8 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900"
        >
          Load More
        </button>
      )}
    </div>
  );
}

export default App;
