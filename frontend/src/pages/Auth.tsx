import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/signup';
      const payload = isLogin ? { email, password } : { name, email, password };
      
      const response = await api.post(endpoint, payload);
      
      localStorage.setItem('peblo_token', response.data.token);
      localStorage.setItem('peblo_user', JSON.stringify(response.data.user));
      
     
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Something went wrong');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-lg">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
          {isLogin ? 'Welcome Back' : 'Join Peblo Notes'}
        </h2>
        
        {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input 
                type="text" required 
                className="w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={name} onChange={(e) => setName(e.target.value)}
              />
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input 
              type="email" required 
              className="w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={email} onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input 
              type="password" required 
              className="w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={password} onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button 
            type="submit" 
            className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
          >
            {isLogin ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button 
            onClick={() => setIsLogin(!isLogin)} 
            className="text-blue-600 font-semibold hover:underline"
          >
            {isLogin ? 'Sign up' : 'Log in'}
          </button>
        </p>
      </div>
    </div>
  );
}