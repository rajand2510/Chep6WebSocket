import React from 'react';
import ReactDOM from 'react-dom/client';
import { ClerkProvider } from '@clerk/clerk-react';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

import './index.css'


const clerkFrontendApi = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
if(!clerkFrontendApi) throw new Error("Api is not there")

ReactDOM.createRoot(document.getElementById('root')).render(

    <BrowserRouter>
      <ClerkProvider publishableKey={clerkFrontendApi}>
      <App />
        </ClerkProvider>
    </BrowserRouter>

);
