import * as ReactModule from "react";
import * as ReactDOMModule from "react-dom/client";
import App from "./App";
import "./index.css";

const React = (ReactModule as any).default;
const ReactDOM = (ReactDOMModule as any).default;
ReactDOM.createRoot(document.getElementById("root")!).render(React.createElement(App));
