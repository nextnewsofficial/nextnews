import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { AuthProvider } from './contexts/auth.context';
import AppRouter from './routes/AppRouter';
import theme from './styles/theme';
import './styles/global.css';
import TopNavbar from "./components/layout/TopNavbar";

function App() {
  return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <AuthProvider>
              <TopNavbar />
            <AppRouter />
          </AuthProvider>
        </Router>
      </ThemeProvider>
  );
}

export default App;