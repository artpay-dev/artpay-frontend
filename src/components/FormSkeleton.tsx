const FormSkeleton = () => {
  return (
    <div className="lg:min-w-md xl:w-xl w-full max-w-md mx-auto animate-pulse space-y-4 p-6 bg-gray-50 border border-gray-200 rounded-lg">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="h-10 bg-gray-200 rounded-md"></div>
      ))}

      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded-md w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded-md w-5/6"></div>
      </div>

      <div className="w-full flex justify-center pt-2">
        <div className="h-10 w-32 bg-gray-200 rounded-md"></div>
      </div>
    </div>
  );
};

export default FormSkeleton;
