const Button = ({
    children ,
    onClick ,
    type = "button" ,
    disabled = false ,
    className = "",
    variant = "primary" ,
    size = "md"
}) => {

    const basicStyles = 'inline-flex cursor-pointer items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 whitespace-nowrap'
    const variantStyles = {
        primary : 'btn-primary text-white hover:scale-105 shadow-lg shadow-primary-25 focus:ring-blue-300',
        secondary : 'bg-linear-to-r from-gray-100 via-gray-200 to-gray-300 text-gray-700 hover:from-gray-200 hover:via-gray-300 hover:to-gray-400 focus:ring-gray-300',
        outline : 'bg-transparent border-2 border-gray-300 text-gray-700 hover:bg-gray-100 focus:ring-gray-200',
        success : 'bg-linear-to-br from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white shadow-lg shadow-yellow-500/25 focus:ring-yellow-300',
    } 

    const sizeStyles = {
        sm : 'h-9 px-4 text-xs',
        md : 'h-11 px-6 text-sm',
    }
  return (
    <button
        type={type}
        onClick={onClick}
        disabled={disabled}
        className={`${basicStyles} transition-all duration-250 ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        >
        {children}
    </button>
  )
}

export default Button