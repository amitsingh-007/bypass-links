import { Typography } from "@material-ui/core";
import React, { Component } from "react";

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
        <Typography component="div" variant="h6">
          {error.toString()}
        </Typography>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
