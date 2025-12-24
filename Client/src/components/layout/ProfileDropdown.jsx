import React from "react";
import { ChevronDown, SpaceIcon } from "lucide-react";
import {useNavigate} from 'react-router-dom'

const ProfileDropdown = ({ isOpen, onToggle, avatar, companyName, email, onLogout }) => {
    const navigate = useNavigate();
  return <>
    <div className="relative">
        <button className="flex items-center space-x-3 p-2 hover:cursor-pointer bg-gray-50 rounded-lg" onClick={onToggle}>
            {avatar 
                ?  
                    (<img src={avatar} alt="Avatar" className="w-8 h-8 rounded-full object-cover"/> ) 
                : 
                    (<div className="w-8 h-8 rounded-xl bg-blue-900 flex items-center justify-center text-white font-semibold">
                        <span className="">{companyName.charAt(0).toUpperCase()}</span>
                    </div>)
            }
            <div className="hidden sm:block text-left">
                <p className="text-sm font-semibold capitalize">{companyName}</p>
                <p className="text-xs text-gray-700">{email}</p>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-600"/>
        </button>

        {isOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-100 pt-2 shadow-lg rounded-xl z-50 overflow-hidden">
                <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-semibold capitalize">{companyName}</p>
                    <p className="text-xs text-gray-700">{email}</p>
                </div>
                <a onClick={()=>navigate('/profile')} className="block px-4 py-2 text-sm hover:bg-gray-100 font-medium cursor-pointer border-b border-gray-100 transition-colors duration-200">
                    View Profile
                </a>
                <div className="">
                    <a href="#" onClick={onLogout} className="block px-4 pt-2 pb-3 text-sm hover:bg-red-50 font-medium cursor-pointer text-red-600 transition-colors duration-200">
                        Sign Out
                    </a>
                </div>
            </div>
        )}
    </div>
  </>;  
};

export default ProfileDropdown;
