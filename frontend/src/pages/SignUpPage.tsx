import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { axiosInstance } from "../lib/axios";

const SignUpPage = () => {
  const [formData, setFormData] = useState({ fullName: "", email: "", password: "" });
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axiosInstance.post("/auth/signup", formData);
      window.location.reload(); // Quick refresh to update auth state
    } catch (error) {
      alert("Error signing up");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200">
      <div className="card w-96 bg-base-100 shadow-xl p-8">
        <h2 className="text-2xl font-bold text-center mb-6">Create Account</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input 
            type="text" placeholder="Full Name" className="input input-bordered w-full" 
            onChange={(e) => setFormData({...formData, fullName: e.target.value})}
          />
          <input 
            type="email" placeholder="Email" className="input input-bordered w-full" 
            onChange={(e) => setFormData({...formData, email: e.target.value})}
          />
          <input 
            type="password" placeholder="Password" className="input input-bordered w-full" 
            onChange={(e) => setFormData({...formData, password: e.target.value})}
          />
          <button className="btn btn-primary w-full">Sign Up</button>
        </form>
      </div>
    </div>
  );
};

export default SignUpPage;