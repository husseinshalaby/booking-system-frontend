import React from "react";
import ErrorDisplay from "./error-display";

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {

    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {

    if (process.env.NODE_ENV === 'production') {

    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center p-4">
          <ErrorDisplay
            statusCode={500}
            title="Something went wrong"
            message="An unexpected error occurred. Our team has been notified and is working to resolve the issue."
          />
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;