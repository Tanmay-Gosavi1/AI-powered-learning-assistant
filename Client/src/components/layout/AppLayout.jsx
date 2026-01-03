import React from 'react'
import { useState , useEffect } from 'react'
import {   Menu , X , LogOut , Bell, BrainCircuit } from 'lucide-react'
import {useAuth} from '../../context/AuthContext.jsx'
import ProfileDropdown from './ProfileDropdown.jsx'
import { Link , useNavigate, useLocation} from 'react-router-dom'
import { NAVIGATION_MENU } from '../../utils/data.js'

const NavItem = ({item , isActive , onClick , isCollapsed}) => {
  const Icon = item.icon;
  return (
  <button
    onClick={() => onClick(item.id)}
    className={`w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-300 ${
      isActive
        ? "bg-blue-50 text-blue-900 shadow-sm shadow-blue-50"
        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
    } cursor-pointer`}
  >
    <Icon
      className={`h-5 w-5 shrink-0 ${
        isActive ? "text-blue-900" : "text-gray-500"
      }`}
    />

    {!isCollapsed && (
      <span className="ml-3 truncate">{item.name}</span>
    )}
  </button>
);

}

const DashboardLayout = ({children , activeMenu}) => {

  const { logout , user} = useAuth();
  const navigate = useNavigate()
  const [sidebarOpen , setSidebarOpen] = useState(false)
  const [isMobile , setIsMobile] = useState(false)
  const [profileDropdownOpen , setProfileDropdownOpen] = useState(false)
  const location = useLocation()

  const getActiveFromPath = (path) => {
    const segments = path.split('/').filter(Boolean)
    const first = segments[0] || 'dashboard'
    if (first === 'dashboard') return 'dashboard'
    if (first === 'documents') return 'documents'
    if (first === 'flashcards') return 'flashcards'
    if (first === 'profile') return 'profile'
    return 'dashboard'
  }

  const [activeNavItem , setActiveNavItem] = useState(() => activeMenu || getActiveFromPath(location.pathname))


  useEffect(()=>{
    const handleResize = () => {
      const mobile = window.innerWidth < 768 ;
      setIsMobile(mobile)
      if(!mobile){
        setSidebarOpen(false)
      }
    }
    handleResize()
    window.addEventListener('resize' , handleResize)
    return () => window.removeEventListener('resize' , handleResize)
  }, [])

  useEffect(()=>{
    const handleClickOutside = () => {
      if(profileDropdownOpen){
        setProfileDropdownOpen(false)
      }
    }
    document.addEventListener('click' , handleClickOutside)
    return () => document.removeEventListener('click' , handleClickOutside)
  } , [profileDropdownOpen])

  // Keep active nav in sync with URL (handles refresh and deep links)
  useEffect(() => {
    const current = getActiveFromPath(location.pathname)
    setActiveNavItem(current)
  }, [location.pathname])

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const sidebarCollapsed = !isMobile && false;

  const handleNavigation = (itemId)=>{
    setActiveNavItem(itemId)
    navigate(`/${itemId}`)
    if(isMobile){
      setSidebarOpen(false)
    }
  }

  return (
    <div className='flex h-screen bg-gray-50'>
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 transition-transform duration-300
        ${isMobile ? sidebarOpen ?  'translate-x-0' : '-translate-x-full' : 'translate-x-0'}
        ${sidebarCollapsed ? 'w-16' : 'w-64'} bg-white border-r border-gray-200`}>

        {/* Company Logo */}
         <div className='flex items-center px-6 border-b border-gray-200 h-16'>
            <Link to="/" className='flex items-center space-x-3'>
                <div className='w-8 h-8 bg-linear-to-br from-blue-900 to-blue-700 rounded-lg flex justify-center items-center'>
                  <BrainCircuit className='h-5 w-5 text-white '/>
                </div>
                {!sidebarCollapsed && <span className='text-lg whitespace-nowrap font-bold text-gray-900'>PrepMate</span>}
            </Link>
         </div> 

        {/* nav */}
        <nav className='p-4 space-y-2'>
          {NAVIGATION_MENU.map((item) => (
            <NavItem 
              key={item.id}
              item={item}
              isActive={activeNavItem === item.id}
              onClick={() => handleNavigation(item.id)}
              isCollapsed={sidebarCollapsed}
            />
          ))}
        </nav>

        {/* Logout */}
        <div className='absolute bottom-4 right-4 left-4 '>
          <button className='w-full group cursor-pointer flex items-center px-3 py-2.5 text-sm font-medium text-gray-600 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors duration-250' onClick={logout}>
            <LogOut className='flex shrink-0 text-gray-600 group-hover:text-red-600 transition-colors duration-250'/>
            {!sidebarCollapsed && <span className='ml-3' onClick={logout}>Logout</span>}
          </button>
        </div>
      </div>
      
      {/* Mobile overlay*/}
      {isMobile && sidebarOpen && (
        <div className='fixed inset-0 bg-black/10 bg-opacity-25 z-40 backdrop-blur-sm' onClick={()=>setSidebarOpen(false)} />
      )}

      {/* Main Content */}
      <div className={`flex-1 flex flex-col transition-all duration-300
        ${isMobile ? 'ml-0' : sidebarCollapsed ? 'ml-16' : 'ml-64'}
      `}>
        {/* TopNav */}
        <header className='bg-white/80 backdrop-blur-sm border-b border-gray-200 h-16 flex items-center justify-between px-6 sticky top-0 z-30'>
          <div className='flex items-center space-x-4'>
            {
              isMobile && (
                <button className='p-2 rounded-xl hover:bg-gray-100 transition-colors duration-200'
                 onClick={toggleSidebar}>
                  {sidebarOpen ? <X className='h-5 w-5 text-gray-600'/> : <Menu className='h-5 w-5 text-gray-600'/>}
                </button>
              )
            }
            <div className=''>
              <h1 className='text-gray-900 text-base font-semibold'>Welcome back , {user?.name}</h1>
              <p className='text-gray-500 text-sm hidden sm:block'>Here’s your learning overview.</p>
            </div>
          </div>

          <div className='flex items-center space-x-3'>
            {/* Profile dropdown */}
            <ProfileDropdown 
              isOpen={profileDropdownOpen}
              onToggle={e=>{
                e.stopPropagation(), // prevent event bubbling which would close the dropdown
                setProfileDropdownOpen(!profileDropdownOpen)
              }}
              avatar = {user?.avatar || ""}
              companyName={user?.name || ""}
              email={user?.email || ""} 
              onLogout={logout} 
            />
          </div>
        </header>

        <main className='flex-1 overflow-y-auto p-6'>
          {children}
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout