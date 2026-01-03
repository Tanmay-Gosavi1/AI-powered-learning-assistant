import React from 'react'
import {BrainIcon ,Mail , Lock, User} from 'lucide-react'
import { Link , useNavigate } from 'react-router-dom'
import {useState} from 'react'
import {useForm} from 'react-hook-form'
import { useAuth } from '../../context/AuthContext.jsx'
import { toast } from 'react-hot-toast'
import authService from '../../service/authService.js'

const Signup = () => {
  const { register, handleSubmit, formState: { errors: formErrors } } = useForm();
  const [loading , setLoading] = useState(false);
  const [errors, setErrors] = useState(null);
  const navigate = useNavigate();
 
  const {login} = useAuth();

  const onSubmit = async (data) => {
    setLoading(true);
    setErrors(null); // Clear previous errors
    console.log(data);
    try {
      const response = await authService.register(data.name, data.email , data.password);
      const { token, user } = response;
      login(user , token);
      toast.success("Account created successfully");
      navigate("/dashboard");
    } catch (error) {
      console.error('Signup error:', error);
      // Handle validation errors from server
      if (error.errors && Array.isArray(error.errors)) {
        const errorMessages = error.errors.map(err => err.message).join(', ');
        setErrors(errorMessages);
        toast.error(errorMessages);
      } else {
        const errorMessage = error.message || "Failed to create account, please try again";
        setErrors(errorMessage);
        toast.error(errorMessage);
      }
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
            <div className='p-3 rounded-xl bg-blue-900 text-white hover:bg-blue-800 transition-colors'>
              <BrainIcon />
            </div>
            <h1 className='text-2xl font-bold mt-3 mb-2 '>Create Account</h1>
            <h3 className='text-sm font-semibold text-gray-500'>Join us and start your learning journey</h3>
          </div>
          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className='py-5 space-y-3 border-b border-gray-300'>
              <div className=''>
                <label htmlFor="" className='uppercase font-bold text-sm text-gray-700'>Name</label>
                <div className='flex p-3 border-2 border-gray-300 rounded-lg gap-2 mt-1.5'>
                  <User className='mx-2 text-gray-400 w-5 h-5'/>
                  <input type="text" placeholder='John Doe' {...register('name', {
                    required: 'Name is required',
                    minLength: { value: 2, message: 'Name must be at least 2 characters' }
                  })}
                    className='w-full outline-none placeholder:text-gray-400 font-semibold text-sm text-gray-700'
                  />
                </div>
                {formErrors.name && <p className='text-xs text-red-600 mt-1'>{formErrors.name.message}</p>}
              </div>
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
                    required: 'Password is required',
                    minLength: { value: 8, message: 'Password must be at least 8 characters' },
                    pattern: {
                      value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/,
                      message: 'Password must contain uppercase, lowercase, number and special character (!@#$%^&*)'
                    }
                  })}
                    className='outline-none w-full placeholder:text-gray-400 font-semibold text-sm text-gray-700'
                  />
                </div>
                {formErrors.password && <p className='text-xs text-red-600 mt-1'>{formErrors.password.message}</p>}
                <div className='text-[10px] text-gray-500 mt-1.5'>
                  <p>Password must contain:</p>
                  <ul className='list-disc list-inside ml-2'>
                    <li>At least 8 characters</li>
                    <li>One uppercase letter (A-Z)</li>
                    <li>One lowercase letter (a-z)</li>
                    <li>One number (0-9)</li>
                    <li>One special character (!@#$%^&*)</li>
                  </ul>
                </div>
              </div>

              {/* Errors */}
              {errors && (<div className='bg-red-50 rounded-lg p-3 border border-red-200 mt-5'>
                <p className='text-xs font-medium text-center text-red-600'>{errors}</p>
              </div>)}

              {/* Button */}
              <button type="submit" disabled={loading} className='w-full btn-primary text-white font-bold py-3 rounded-lg mt-4 transition-colors duration-300 hover:cursor-pointer shadow-md shadow-primary-25 disabled:opacity-50 disabled:cursor-not-allowed'>{loading ? "Creating Account..." : "Sign Up"}</button>
            </div>
          </form>
          <div className='mt-4 flex justify-center items-center text-sm'>
            <p className='font-medium text-gray-700'>Already have an account?</p><Link to="/login" className='text-blue-900 hover:text-blue-700 transition-colors duration-100 font-semibold ml-1'>Sign In</Link>
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

export default Signup