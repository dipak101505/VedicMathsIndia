import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { PostHogProvider} from 'posthog-js/react'
import posthog from 'posthog-js'
const options = {
  api_host: process.env.REACT_APP_PUBLIC_POSTHOG_HOST,
}

posthog.init('phc_AKw63M8ARyTLjIzHYlCHEuPiMIYdBlEpYaVrXSHDhcB',
  {
      api_host: 'https://us.i.posthog.com',
      person_profiles: 'identified_only' // or 'always' to create profiles for anonymous users as well
  }
)

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
      <App />
  </React.StrictMode>,
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
