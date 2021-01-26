import { Box } from "@material-ui/core";
import { Component } from "react";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error, errorInfo) {
    console.log(error);
  }

  render() {
    const { hasError, error } = this.state;
    if (hasError) {
      return (
        <Box sx={{ padding: "12px", fontSize: "17px", width: "200px" }}>
          {error.toString()}
        </Box>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
