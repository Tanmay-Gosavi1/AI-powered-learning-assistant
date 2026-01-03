import React from 'react'
import {useState , useEffect } from 'react'
import { FileText , X , Menu} from 'lucide-react'
import { Link , useNavigate} from 'react-router-dom'
import ProfileDropdown from '../layout/ProfileDropdown.jsx'
import {useAuth} from '../../context/AuthContext.jsx'

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isViewProfileOpen, setIsViewProfileOpen] = useState(false)
  const {user , isAuthenticated , logout} = useAuth();
  const navigate = useNavigate()

  useEffect(() => {
    const handleScroll = () =>{
      setIsScrolled(window.scrollY > 5)
    }
      window.addEventListener('scroll' , handleScroll)
      return ()=>window.removeEventListener('scroll' , handleScroll)  
  } ,[])

  return (
    <header className={`fixed top-0 w-full transition-all duration-200 bg-gray-100 z-50
    ${isScrolled ? 'bg-white/95 backdrop-blur-sm shadow-lg' : 'bg-white/0'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className='flex items-center space-x-2 hover:cursor-pointer' onClick={() => navigate('/')}>
            <div className='w-8 h-8 rounded-lg bg-linear-to-r from-blue-950 to-blue-700 flex items-center justify-center'><FileText className='text-white w-5'/></div>
            <span className='text-xl font-bold '>PrepMate</span>
          </div>

          {/* Links */}
          <div className='hidden lg:flex items-center space-x-8'>
            <a href="#features" 
              className=' text-gray-700 font-semibold hover:text-blue-800 relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-black hover:after:w-full after:transition-all after:duration-300'
              >Features
            </a>
            <a href="#testimonials" 
              className='text-gray-700 font-semibold hover:text-blue-800 relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-black hover:after:w-full after:transition-all after:duration-300'
              >Testimonials
            </a>
            <a href="#faqs" 
              className='text-gray-700 font-semibold hover:text-blue-800 relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-black hover:after:w-full after:transition-all after:duration-300'
              >FAQs
            </a>
          </div>

          {/* Login Signup */}
          <div className='hidden lg:flex items-center space-x-4'>
            {isAuthenticated ? (<>
              <ProfileDropdown 
                isOpen={isViewProfileOpen}
                onToggle={e=>{
                  e.stopPropagation(),
                  setIsViewProfileOpen(!isViewProfileOpen)
                }}
                avatar = {user?.avatar || ""}
                companyName={user?.name || ""}
                email={user?.email || ""} 
                onLogout={logout} 
              />
            </>) : (
              <>
                <Link to="/login" className='font-medium text-black hover:text-gray-900 transition-colors duration-200'>Login</Link>
                <Link to="/signup" className='bg-linear-to-r text-sm font-medium from-blue-950 to-blue-800 px-4 py-2 rounded-sm text-white hover:scale-105 transition-all duration-200'>Signup</Link>
              </>
              ) }
          </div>

          {/* Menu */}
          <div className='lg:hidden'>
            <button className='p-1.5 rounded-lg text-gray-500 hover:text-gray-700 cursor-pointer bg-gray-100 transition-colors duration-200'
             onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className='w-6 h-6'/> : <Menu className='w-6 h-6'/>}
            </button>
          </div>
        </div>
      </div>


      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className='lg:hidden absolute top-full left-0 right-0 bg-white border-b border-gray-100 pb-2'>
          <div className='px-2 py-3 space-y-1'>
            <a href="#features" className='block px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors duration-200'>Features</a>
            <a href="#testimonials" className='block px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors duration-200'>Testimonials</a>
            <a href="#faqs" className='block px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors duration-200'>FAQs</a>
          </div>
          {isAuthenticated ? (
          <>
            <button className='px-6 py-3  border-t border-gray-100 block w-full hover:cursor-pointer hover:bg-green-50 transition-colors duration-200 hover:text-blue-950'>
              <Link to='/dashboard' className='font-medium '>Dashboard</Link>  
            </button>  
          </>) : (
          <>
            <Link to="/login" className='block px-6 py-2 mt-2 border-t border-gray-100 text-gray-700 text-center hover:bg-gray-100 font-medium transition-colors duration-200'>Login</Link>
            <Link to="/signup" className='block mx-4 my-2 text-center font-medium bg-linear-to-r from-blue-950 to-blue-800 px-4 py-2 rounded-sm text-white hover:scale-95 transition-all duration-200'>Signup</Link>
          </>
        )}
        </div>
      )}
    </header>
  )
}

export default Header