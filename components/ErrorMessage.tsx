interface ErrorMessageProps {
    message: string;
  }

  export default function ErrorMessage({ message }: ErrorMessageProps) {
    if (!message) return null;
  
    return (
      <div className="mt-4 p-3 bg-red-600/80 text-white rounded-lg text-sm shadow-md">
        ⚠️ {message}
      </div>
    );
  }
  