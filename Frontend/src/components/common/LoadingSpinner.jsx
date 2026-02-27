const LoadingSpinner = ({ size = "md", text = "Loading..." }) => {
  const sizes = {
    sm: "h-6 w-6 border-2",
    md: "h-12 w-12 border-4",
    lg: "h-20 w-20 border-4",
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16">
      <div
        className={`${sizes[size]} rounded-full border-pink-200
          border-t-pink-500 animate-spin`}
        style={{ borderTopColor: "#f472b6" }}
      />
      {text && (
        <p className="text-gray-500 dark:text-gray-400 animate-pulse text-sm">
          {text}
        </p>
      )}
    </div>
  );
};

export default LoadingSpinner;