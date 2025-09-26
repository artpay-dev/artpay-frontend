const SkeletonCard = () => {
  return (
    <div className="p-4 bg-neutral-100 rounded-lg space-y-6 opacity-65 animate-pulse w-full">
      <div className="space-y-2">
        <div className="h-5 w-3/4 bg-gray-300 rounded"></div>
        <div className="h-4 w-full bg-gray-300 rounded"></div>
        <div className="h-4 w-2/3 bg-gray-300 rounded"></div>
      </div>
      <div className="h-10 w-full bg-gray-300 rounded"></div>
      <div className="h-4 w-1/4 bg-gray-300 rounded"></div>
    </div>
  );
};

export default SkeletonCard;