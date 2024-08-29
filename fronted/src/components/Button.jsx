import React from 'react'

const Button = ({handleImageUpload,selectedImage,loading}) => {
  return (
    <button
        onClick={handleImageUpload}
        disabled={!selectedImage}
        className={`px-4 py-2 text-white font-semibold rounded ${
          loading ? 'bg-slate-800' : selectedImage?'bg-slate-900 hover:bg-slate-900':'bg-none'
        } ${!selectedImage && 'opacity-50 '}`}
      >
        {loading ? 'Searching...' : selectedImage? 'Find Similar Images':'Upload Image to search'}
      </button>
  )
}

export default Button