import {BrowserRouter , Routes , Route , Navigate} from 'react-router-dom'
import LoginPage from './pages/auth/Login'
import SignupPage from './pages/auth/Signup'
import DashboardPage from './pages/Dashboard/DashboardPage'
import Profile from './pages/Profile/Profile'
import DocumentsListPage from './pages/Document/DocumentListPage'
import DocumentDetailPage from './pages/Document/DocumentDetailPage'
import FlashcardListPage from './pages/Flashcards/FlashcardListPage'
import FlashcardPage from './pages/Flashcards/FlashcardPage'
import QuizTakePage from './pages/Quizzes/QuizTakePage'
import QuizResultPage from './pages/Quizzes/QuizResult'
import NotFoundPage from './pages/NotFoundPage'
import ProtectedRoute from './components/auth/ProtectedRoute'
import { useAuth } from './context/AuthContext.jsx'
import Spinner from './components/common/Spinner.jsx'
import Landing from './pages/landing/Landing.jsx'

const App = () => {
  const {loading} = useAuth();

  if (loading) {
    return <Spinner fullScreen label="Loading" />
  }
  return (
    <BrowserRouter>
      <Routes>
        {/* <Route path='/' element={isAuthenticated ? <Navigate to='/dashboard' /> : <Landing />} /> */}
        <Route path='/' element={<Landing />} />
        <Route path='/login' element={<LoginPage />} />
        <Route path='/signup' element={<SignupPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path='/dashboard' element={<DashboardPage />} />
          <Route path='/profile' element={<Profile />} />
          <Route path='/documents' element={<DocumentsListPage />} />
          <Route path='/documents/:id' element={<DocumentDetailPage />} />
          <Route path='/flashcards' element={<FlashcardListPage />} />
          <Route path='/documents/:id/flashcards' element={<FlashcardPage />} />
          <Route path='/quizzes/:quizId' element={<QuizTakePage />} />
          <Route path='/quizzes/:quizId/results' element={<QuizResultPage />} />
        </Route>

        {/* <Route path='*' element={<Navigate to="/" replace />} /> */}
      </Routes>
    </BrowserRouter>
  )
}

export default App