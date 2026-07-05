import React, { useState } from "react";
import { useNavigate } from "react-router";
import useAuth from "../hooks/useAuth";

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();

    const username = e.target.username.value;
    const email = e.target.email.value;
    const password = e.target.password.value;

    try {
      setLoading(true);

      await register({
        username,
        email,
        password,
      });

      navigate("/");
    } catch (error) {
      console.error(error);
      alert(
        error.response?.data?.message ||
          "Registration failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main>
      <h1>Register</h1>

      <form onSubmit={handleRegister}>
        <input
          type="text"
          name="username"
          placeholder="Username"
          required
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Creating Account..." : "Register"}
        </button>
      </form>
    </main>
  );
};

export default Register;