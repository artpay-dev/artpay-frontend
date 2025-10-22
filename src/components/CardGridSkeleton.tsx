const CardGridSkeleton = ({ count = 8, className = '' }) => {
  return (
    <div className={`${className} grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-pulse`}>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="w-full h-full"
        >
          {/* Image */}
          <div className="w-full rounded-2xl overflow-hidden bg-gray-300 aspect-square" />

          {/* Content */}
          <div className="mt-4 py-4 flex flex-col justify-between">
            <div className="flex">
              {/* Left section */}
              <div className="flex flex-col flex-1 min-h-40 space-y-2">
                <div className="w-1/2 h-4 bg-gray-300 rounded" />
                <div className="w-full h-6 bg-gray-300 rounded" />
                <div className="w-3/4 h-4 bg-gray-200 rounded" />
                <div className="w-1/2 h-5 bg-gray-300 rounded mt-4" />
              </div>

              {/* Right icons */}
              <div className="flex flex-col items-end justify-between max-w-[50px] ml-2">
                <div className="w-6 h-6 bg-gray-300 rounded-full" />
                <div className="w-8 h-8 bg-gray-300 rounded" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CardGridSkeleton;
