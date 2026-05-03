"use client";

import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

class BurgerErrorBoundary extends Component<Props, State> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "var(--header-font)",
          color: "var(--black)",
          gap: "12px",
        }}>
          <span style={{ fontSize: "80px" }}>🍔</span>
          <p style={{ fontSize: "18px" }}>Burger failed to load</p>
        </div>
      );
    }

    return this.props.children;
  }
}

export default BurgerErrorBoundary;