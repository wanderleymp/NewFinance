import { useState } from 'react'
import { ThemeProvider, CssBaseline } from '@mui/material'
import { BrowserRouter } from 'react-router-dom'
import { SnackbarProvider } from 'notistack'
import { lightTheme, darkTheme } from './theme/theme'
import AppRoutes from './routes'
import '@fontsource/inter/300.css'
import '@fontsource/inter/400.css'
import '@fontsource/inter/500.css'
import '@fontsource/inter/600.css'
import '@fontsource/inter/700.css'

function App() {
  const [darkMode, setDarkMode] = useState(false)

  return (
    <BrowserRouter>
      <ThemeProvider theme={darkMode ? darkTheme : lightTheme}>
        <CssBaseline />
        <SnackbarProvider 
          maxSnack={3}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          autoHideDuration={5000}
        >
          <AppRoutes darkMode={darkMode} setDarkMode={setDarkMode} />
        </SnackbarProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}

export default App
