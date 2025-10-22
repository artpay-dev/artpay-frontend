const ArtworkPageSkeleton = () => {
  return (
    <div className="mt-0 sm:mt-12 md:mt-18 flex justify-center overflow-visible animate-pulse">
      <div className="flex flex-col w-full lg:flex-row max-w-screen-xl gap-8">
        {/* Immagine opera */}
        <div className="w-full max-w-2xl lg:min-w-sm lg:min-h-screen rounded-b-2xl md:rounded-2xl overflow-hidden">
          <div className="sticky top-0 w-full aspect-square bg-gray-300 rounded-b-2xl md:rounded-2xl" />
        </div>

        {/* Dettagli opera */}
        <div className="flex flex-col pt-6 max-w-2xl w-full px-4 md:px-8">
          {/* Intestazione */}
          <div className="flex items-center mb-4 gap-2">
            <div className="h-4 w-32 bg-gray-300 rounded" />
            <div className="flex-grow" />
            <div className="w-6 h-6 bg-gray-300 rounded-full" />
            <div className="w-6 h-6 bg-gray-300 rounded-full" />
            <div className="w-6 h-6 bg-gray-300 rounded-full" />
          </div>

          {/* Titolo */}
          <div className="h-8 bg-gray-300 rounded w-3/4 mb-2" />
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-4" />

          {/* Tecnica e dimensioni */}
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4" />

          {/* Certificazioni */}
          <div className="h-4 bg-gray-100 rounded w-2/3 mb-1" />
          <div className="h-4 bg-gray-100 rounded w-1/2 mb-4" />

          {/* Stato disponibilità */}
          <div className="h-4 bg-gray-100 rounded w-1/2 mb-6" />

          {/* Divider */}
          <div className="w-full h-px bg-gray-200 my-6" />

          {/* Prezzo e bottone acquisto */}
          <div className="flex items-center mb-6 gap-4">
            <div className="h-6 w-24 bg-gray-300 rounded" />
            <div className="flex-grow" />
            <div className="h-10 w-32 bg-gray-300 rounded" />
          </div>

          {/* Divider */}
          <div className="w-full h-px bg-gray-200 my-6" />

          {/* Prenotazione */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="h-6 w-24 bg-gray-300 rounded" />
            <div className="flex flex-col items-end gap-2">
              <div className="h-10 w-40 bg-gray-300 rounded" />
              <div className="h-4 w-48 bg-gray-200 rounded" />
            </div>
          </div>

          {/* Banner prestito */}
          <div className="bg-gray-400 text-white rounded p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-gray-500 rounded-full" />
            <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full gap-4">
              <div className="h-4 w-3/4 bg-white/40 rounded" />
              <div className="h-4 w-24 bg-white/40 rounded" />
            </div>
          </div>

          {/* Contatti galleria */}
          <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
            <div className="flex flex-col sm:items-start gap-2">
              <div className="h-4 w-32 bg-gray-300 rounded" />
              <div className="h-4 w-24 bg-gray-200 rounded" />
            </div>
            <div className="h-10 w-48 bg-gray-300 rounded" />
          </div>

          {/* Divider */}
          <div className="w-full h-px bg-gray-200 my-6" />

          {/* Sezioni extra */}
          <div className="flex flex-col gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="space-y-2">
                <div className="h-4 w-1/3 bg-gray-300 rounded" />
                <div className="h-4 w-full bg-gray-200 rounded" />
                <div className="h-4 w-5/6 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArtworkPageSkeleton;
