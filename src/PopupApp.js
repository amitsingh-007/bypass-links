import React, { StrictMode } from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { createStore } from "redux";
import { PopupContent } from "./components/PopupContent";
import reducer from "./reducers";

const store = createStore(reducer);

ReactDOM.render(
  <StrictMode>
    <Provider store={store}>
      <PopupContent />
    </Provider>
  </StrictMode>,
  document.getElementById("root")
);
