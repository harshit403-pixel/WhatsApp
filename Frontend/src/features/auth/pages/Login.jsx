import React from "react";
import { useNavigate, Link } from "react-router";
import useAuth from "../hooks/useAuth";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    const email = e.target.email.value;
    const password = e.target.password.value;

    try {
      await login({ email, password });

      // Redirect after successful login
      navigate("/");
    } catch (error) {
      console.error(error);
      alert(
        error.response?.data?.message || "Login failed"
      );
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold text-center mb-8">
          Login
        </h1>

        <form
          onSubmit={handleLogin}
          className="flex flex-col gap-5"
        >
          {/* Email */}
          <div>
            <label className="block mb-2 font-medium">
              Email
            </label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              required
              className="w-full border rounded-lg px-4 py-3 outline-none focus:border-blue-500"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block mb-2 font-medium">
              Password
            </label>
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              required
              className="w-full border rounded-lg px-4 py-3 outline-none focus:border-blue-500"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="bg-black text-white py-3 rounded-lg hover:opacity-90 transition"
          >
            Login
          </button>
        </form>

        <p className="text-center mt-6">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-blue-600 hover:underline"
          >
            Register
          </Link>
        </p>
      </div>
    </main>
  );
};

export default Login;