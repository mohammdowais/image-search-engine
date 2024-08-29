import React, { useState } from "react";

const FileInput = ({handleImageChange,setSelectedImage}) => {
  const [preview, setPreview] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    handleImageChange(file)
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
        setSelectedImage(true);
        handleImageChange(file)
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => {
    setDragActive(false);
  };

  return (
    <div className="flex flex-col items-center">
      <div
  className={`w-64 h-64 p-4 border-2 border-dashed rounded-md flex items-center ${
    dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"
  }`}
  onDragOver={handleDragOver}
  onDragLeave={handleDragLeave}
  onDrop={handleDrop}
>
  <input
    type="file"
    accept="image/*"
    onChange={handleFileChange}
    className="hidden"
    id="file-input"
  />
  <label
    htmlFor="file-input"
    className="relative cursor-pointer text-center flex items-center w-full"
  >
    {preview ? (
                      <><img
                          src={preview}
                          alt="Preview"
                          className="object-cover w-60 h-60 rounded-md" />
                          <button
                              onClick={() => { setPreview(null); setSelectedImage(false); }}
                              className="absolute top-[-5px] right-[-5px] px-2 pb-0.5 bg-red-500 text-white rounded-full "
                          >
                              x
                          </button>
                        </>
    ) : (
      <span className="text-gray-500 mr-4">
        Drag and drop an image, or click to select
      </span>
    )}
  </label>
</div>
      
    </div>
  );
};

export default FileInput;
