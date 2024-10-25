import React from "react";
import ScratchCardGrid from "./components/ScratchCardGrid";

function App() {
  return (
    <div className="App" style={{width: "350px", margin: "0 auto"}}>
      <h1>Scratch Card Game</h1>
      <ScratchCardGrid rows={4} cols={3} winCount={3} />
    </div>
  );
}

export default App;
