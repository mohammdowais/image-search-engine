import React from 'react'

const Images = ({results}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
    {results.map((result, index) => (
      <div key={index} className="flex flex-col items-center">
        <img
          src={`data:image/jpeg;base64,${result.image}`}
          alt={result.text}
          className="w-64 h-64 object-cover rounded-lg shadow-md transform hover:scale-105 animate-fade-up animate-once animate-duration-1000 animate-delay-500 animate-ease-linear"
          title={result.name}
        />
        <p className="mt-2 text-center text-slate-200">{result.text} ({result.distance})</p>
      </div>
    ))}
  </div>
  )
}

export default Images