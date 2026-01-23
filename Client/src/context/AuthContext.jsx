import React , {createContext , useContext , useState , useEffect } from 'react'

const AuthContext = createContext()

export const useAuth  = () => {
  const context = useContext(AuthContext)
  if(!context){
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}

export const AuthProvider = ({children}) => {

    const [user , setUser] = useState(null)
    const [loading ,setLoading] = useState(true)
    const [isAuthenticated , setIsAuthenticated] = useState(false)

    useEffect(() => {
      checkAuthStatus()
    }, [])

    const checkAuthStatus = async () => {
      try {
        setLoading(true)
        const token = localStorage.getItem('token')
        const userStr = localStorage.getItem('user')
        if(token && userStr){
          const userData = JSON.parse(userStr)
          setUser(userData)
          setIsAuthenticated(true)
        }
      }
      catch(err){
        console.log("Error checking auth status" , err)
        logout()
      }
      finally{
        setLoading(false)
      }
    }

    const login = async (userData  , token ) => {
        localStorage.setItem('token' , token)
        localStorage.setItem('user' , JSON.stringify(userData))
        setUser(userData)
        setIsAuthenticated(true)
    }
     
    const logout = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        localStorage.removeItem('refreshToken')

        setUser(null)
        setIsAuthenticated(false)
        window.location.href = '/'
    }

    const updateUser = (updatedData) => {
      const updatedUser = {...user , ...updatedData}
      localStorage.setItem('user' , JSON.stringify(updatedUser))
      setUser(updatedUser)
    }
    
    const value = {
      user , 
      isAuthenticated ,
      loading ,
      login ,
      logout ,
      updateUser,
      checkAuthStatus
    }

    return (
      <AuthContext.Provider value={value}>
        {children}
      </AuthContext.Provider>
    )
}
