import { Box } from "@material-ui/core";
import { Component } from "react";

class ErrorBoundary extends Component<
  any,
  {
    hasError: boolean;
    error: Error | null;
  }
> {
  constructor(props: any) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error) {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.log(error);
    //TODO: log error here
  }

  render() {
    const { hasError, error } = this.state;
    if (hasError) {
      return (
        <Box sx={{ padding: "12px", fontSize: "17px", width: "200px" }}>
          {error?.toString()}
        </Box>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
