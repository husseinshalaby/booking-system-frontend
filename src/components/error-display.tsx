interface ErrorDisplayProps {
  statusCode?: number;
  title?: string;
  message?: string;
  showImage?: boolean;
}

export default function ErrorDisplay({ statusCode = 500, title, message, showImage = true }: ErrorDisplayProps) {

  const getDefaultTitle = (code: number) => {
    switch (code) {
      case 404:
        return "Page Not Found";
      case 500:
        return "Server Error";
      case 403:
        return "Access Denied";
      case 400:
        return "Bad Request";
      default:
        return "An error occurred";
    }
  };

  const getDefaultMessage = (code: number) => {
    switch (code) {
      case 404:
        return "Oops! It seems like the page you were looking for doesn't exist or has been moved.";
      case 500:
        return "Oops! Something went wrong. Please try again later.";
      case 403:
        return "You don't have permission to access this resource.";
      case 400:
        return "There was an issue with your request. Please check and try again.";
      default:
        return "Oops! Something went wrong. Please try again later.";
    }
  };

  return (
    <div className="card p-8 w-full max-w-lg shadow-lg rounded-lg bg-white">
      <div className="flex flex-col items-center gap-6">
        {showImage && (
          <div className="relative w-full mb-4">
            <img src="/error-background.jpg" alt="Error Illustration" className="max-h-[200px] mx-auto" />
          </div>
        )}

        <div className="text-center">
          <h1 className="text-4xl text-gray-400 font-bold mb-2">{statusCode}</h1>
          <h2 className="text-4xl font-semibold text-gray-700 mb-4">
            {title || getDefaultTitle(statusCode)}
          </h2>

          <p className="text-gray-700 mb-6">
            {message || getDefaultMessage(statusCode)}
          </p>
        </div>
      </div>
    </div>
  );
}