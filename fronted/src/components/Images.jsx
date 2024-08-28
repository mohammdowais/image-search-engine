import React from 'react'

const Images = ({results}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
    {results.map((result, index) => (
      <div key={index} className="flex flex-col items-center">
        <img
          src={`data:image/jpeg;base64,${result.image}`}
          alt={result.text}
          className="w-64 h-64 object-cover rounded-lg shadow-md transform hover:scale-105 transition-transform duration-300"
          title={result.text}
        />
        <p className="mt-2 text-center text-slate-200">{result.text}</p>
      </div>
    ))}
  </div>
  )
}

export default Images