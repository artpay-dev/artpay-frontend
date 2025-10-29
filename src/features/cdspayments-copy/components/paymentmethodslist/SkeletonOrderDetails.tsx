const SkeletonOrderDetails = () => {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="flex items-center gap-2.5">
        <div className="size-8 overflow-hidden border border-gray-200 rounded-sm p-1 bg-white">
          <div className="w-full h-full bg-gray-300"></div>
        </div>
        <div className="h-4 w-2/3 bg-gray-300 rounded"></div>
      </div>
      <div className="flex flex-col gap-1">
        <span className="h-3 w-1/4 bg-gray-300 rounded"></span>
        <span className="h-4 w-1/2 bg-gray-300 rounded"></span>
      </div>
      <div className="flex flex-col gap-1">
        <span className="h-3 w-1/4 bg-gray-300 rounded"></span>
        <span className="h-4 w-2/3 bg-gray-300 rounded"></span>
      </div>
      <div className="flex flex-col gap-1">
        <span className="h-3 w-1/4 bg-gray-300 rounded"></span>
        <span className="h-4 w-1/3 bg-gray-300 rounded"></span>
      </div>
    </div>
  );
};

export default SkeletonOrderDetails;