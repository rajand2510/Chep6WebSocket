import React from "react";

import { SignedIn, SignedOut  } from "@clerk/clerk-react";
import Chat from "./Components/Chat";
import Login from "./Components/Login";
import SignUp1 from "./Components/SignUp1";
const App = () => {
  return (
    <div>
      <SignedIn>
        <Chat />
      </SignedIn>

      <SignedOut>
        <div className="p-4">
          <h2 className="text-xl font-bold mb-4">Welcome to NoteApp</h2>
          <Login routing="path" path="/sign-in" />
          <SignUp1 routing="path" path="/sign-up" />
        </div>
      </SignedOut>
    </div>
  );
};

export default App;
