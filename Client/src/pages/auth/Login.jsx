import React from 'react'
import {BrainIcon ,Mail , Lock} from 'lucide-react'
import { Link , useNavigate } from 'react-router-dom'
import {useState} from 'react'
import {useForm} from 'react-hook-form'
import { useAuth } from '../../context/AuthContext.jsx'
import { toast } from 'react-hot-toast'
import authService from '../../service/authService.js'

const Login = () => {
  const { register, handleSubmit, formState: { errors: formErrors } } = useForm();
  const [loading , setLoading] = useState(false);
  const [errors, setErrors] = useState(null);
  const navigate = useNavigate();
 
  const {login} = useAuth();

  const onSubmit = async (data) => {
    setLoading(true);
    console.log(data);
    try {
      const {token , user } = await authService.login(data.email , data.password);
      login(user , token);
      toast.success("Logged in successfully");
      setLoading(false);
      navigate("/dashboard");
    } catch (error) {
      setErrors(error.message || "Failed to login , please check your credentials");
      toast.error(error.message || "Failed to login");
    } finally{
      setLoading(false);
    }

  }
  return (
    <div className='h-screen w-full flex justify-center items-center'>
      <div className=''>
        {/* Card */}
        <div className='p-6 md:p-10 border-2 border-gray-200 shadow-xl rounded-2xl w-92 md:w-100 bg-white'>
          {/* Info */}
          <div className='flex flex-col items-center justify-center mb-3'>
            {/* logo */}
            <div className='p-3 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 transition-colors'>
              <BrainIcon />
            </div>
            <h1 className='text-2xl font-bold mt-3 mb-2 '>Welcome back</h1>
            <h3 className='text-sm font-semibold text-gray-500'>Sign in to continue your journey</h3>
          </div>
          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className='py-5 space-y-3 border-b border-gray-300'>
              <div className=''>
                <label htmlFor="" className='uppercase font-bold text-sm text-gray-700'>Email</label>
                <div className='flex p-3 border-2 border-gray-300 rounded-lg gap-2 mt-1.5'>
                  <Mail className='mx-2 text-gray-400 w-5 h-5'/>
                  <input type="email" placeholder='you@gmail.com' {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address'
                    }
                  })}
                    className='w-full outline-none placeholder:text-gray-400 font-semibold text-sm text-gray-700'
                  />
                </div>
                {formErrors.email && <p className='text-xs text-red-600 mt-1'>{formErrors.email.message}</p>}
              </div>
              <div className=''>
                <label htmlFor="" className='uppercase font-bold text-sm text-gray-700'>Password</label>
                <div className='flex p-3 border-2 border-gray-300 rounded-lg gap-2 mt-1.5'>
                  <Lock className='mx-2 text-gray-400 w-5 h-5'/>
                  <input type="password" placeholder='••••••••' {...register('password', {
                    required: 'Password is required'
                  })}
                    className='outline-none w-full placeholder:text-gray-400 font-semibold text-sm text-gray-700'
                  />
                </div>
                {formErrors.password && <p className='text-xs text-red-600 mt-1'>{formErrors.password.message}</p>}
              </div>

              {/* Errors */}
              {errors && (<div className='bg-red-50 rounded-lg p-3 border border-red-200 mt-5'>
                <p className='text-xs font-medium text-center text-red-600'>{errors}</p>
              </div>)}

              {/* Button */}
              <button type="submit" disabled={loading} className='w-full bg-linear-to-r from-emerald-600 via-emerald-500 to-emerald-400 text-white font-bold py-3 rounded-lg mt-4 hover:from-emerald-400 hover:via-emerald-400 hover:to-emerald-500 transition-colors duration-300 hover:cursor-pointer shadow-md shadow-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed'>{loading ? "Loading..." : "Sign In"}</button>
            </div>
          </form>
          <div className='mt-4 flex justify-center items-center text-sm'>
            <p className='font-medium text-gray-700'>Don't have an account?</p><Link to="/signup" className='text-emerald-500 hover:text-emerald-700 transition-colors duration-100 font-semibold ml-1'>Sign Up</Link>
          </div>
        </div>
        {/* p */}
        <div className='py-5'>
          <p className='text-center text-gray-400 font-medium text-xs md:text-sm'>By continuing, you agree to our Terms & Privacy policy</p>
        </div>
      </div>
    </div>
  )
}

export default Login