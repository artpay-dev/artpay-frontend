const GallerySkeleton = () => {
  return (
    <div className="flex gap-6 flex-col md:flex-row mb-12 md:mb-36 animate-pulse">
      {/* Image Skeleton */}
      <div className="relative mb-12">
        <div className="w-full md:w-[420px] lg:w-[612px] h-[384px] md:h-[420px] lg:h-[612px] bg-gray-300 rounded-b-2xl md:rounded-2xl" />

        {/* Logo bottom-left on mobile */}
        <div className="absolute bottom-0 left-6 md:top-[360px] lg:top-[560px] md:bottom-auto max-w-[64px] sm:max-w-[100px] max-h-[64px] sm:max-h-[100px]">
          <div className="w-full h-full bg-gray-300 rounded-full" style={{ aspectRatio: '1/1' }} />
        </div>
      </div>

      {/* Right Side Content */}
      <div className="flex flex-col px-8 md:px-0 md:w-full">
        {/* Top buttons */}
        <div className="flex items-center mb-2 md:mb-10">
          <div className="w-24 h-10 bg-gray-300 rounded-full" />
          <div className="flex-grow" />
          <div className="w-8 h-8 bg-gray-300 rounded-full" />
        </div>

        {/* Title */}
        <div className="h-8 bg-gray-300 rounded w-2/3 mb-2" />
        {/* Subtitle */}
        <div className="h-6 bg-gray-200 rounded w-1/2 mt-3" />
        {/* Logo desktop */}
        <div className="hidden md:block w-16 h-16 md:w-[100px] md:h-[100px] bg-gray-300 rounded-full mt-6" />

        {/* Description */}
        <div className="h-5 bg-gray-200 rounded w-full mt-6 max-w-[400px]" />
        <div className="h-5 bg-gray-200 rounded w-4/5 mt-2 max-w-[400px]" />

        {/* Products count */}
        <div className="h-5 bg-gray-100 rounded w-1/3 mt-3 max-w-[400px]" />
      </div>
    </div>
  );
};

export default GallerySkeleton;
