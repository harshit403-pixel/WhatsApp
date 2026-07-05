import { useState } from "react";
import { Link, useNavigate } from "react-router";
import {
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  UserRound,
} from "lucide-react";
import { motion } from "framer-motion";
import { useSelector } from "react-redux";

import useAuth from "../hooks/useAuth";
import AuthShell from "../components/AuthShell";
import { Button } from "../../shared/components/ui/Button";
import Input from "../../shared/components/ui/Input";
import Spinner from "../../shared/components/ui/Spinner";
import { appToast } from "../../shared/lib/toast";

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const { loading } = useSelector((state) => state.auth);

  const [showPassword, setShowPassword] = useState(false);
  const [fields, setFields] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const nextErrors = {};

    if (!fields.username.trim()) {
      nextErrors.username = "Username is required.";
    } else if (fields.username.trim().length < 3) {
      nextErrors.username =
        "Username must be at least 3 characters long.";
    }

    if (!fields.email.trim()) {
      nextErrors.email = "Email is required.";
    } else if (!/\S+@\S+\.\S+/.test(fields.email)) {
      nextErrors.email = "Please provide a valid email address.";
    }

    if (!fields.password.trim()) {
      nextErrors.password = "Password is required.";
    } else if (fields.password.length < 6) {
      nextErrors.password =
        "Password must be at least 6 characters long.";
    }

    if (fields.confirmPassword !== fields.password) {
      nextErrors.confirmPassword =
        "Passwords do not match yet.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!validate()) {
      appToast.error(
        "A few details still need attention",
        "Check the form fields and try again."
      );
      return;
    }

    try {
      await register({
        username: fields.username.trim(),
        email: fields.email.trim(),
        password: fields.password,
      });

      appToast.success(
        "Account created",
        "Your secure workspace is ready."
      );
      navigate("/");
    } catch (error) {
      appToast.error(
        error.response?.data?.message ||
          "Registration failed",
        "Please review your details and try again."
      );
    }
  };

  return (
    <AuthShell
      eyebrow="Create your account"
      title="Launch a calmer messaging workspace."
      description="Register once, then keep using the existing production auth flow without changing any backend behavior."
      footerPrompt="Already have an account?"
      footerLabel="Sign in"
      footerHref="/login"
    >
      <motion.form
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.24, delay: 0.08 }}
        onSubmit={handleRegister}
        className="glass-panel w-full max-w-xl space-y-6 rounded-[2rem] p-6 sm:p-7"
      >
        <div className="space-y-1">
          <h2 className="text-xl font-semibold text-white">
            Set up your account
          </h2>
          <p className="text-sm text-zinc-400">
            Usernames need at least 3 characters and passwords need at least 6,
            matching the backend validators.
          </p>
        </div>

        <div className="grid gap-4">
          <Input
            label="Username"
            type="text"
            name="username"
            autoComplete="username"
            value={fields.username}
            onChange={(event) =>
              setFields((current) => ({
                ...current,
                username: event.target.value,
              }))
            }
            icon={<UserRound className="h-4 w-4" />}
            error={errors.username}
            placeholder="Choose a username"
          />

          <Input
            label="Email"
            type="email"
            name="email"
            autoComplete="email"
            value={fields.email}
            onChange={(event) =>
              setFields((current) => ({
                ...current,
                email: event.target.value,
              }))
            }
            icon={<Mail className="h-4 w-4" />}
            error={errors.email}
            placeholder="name@company.com"
          />

          <Input
            label="Password"
            type={showPassword ? "text" : "password"}
            name="password"
            autoComplete="new-password"
            value={fields.password}
            onChange={(event) =>
              setFields((current) => ({
                ...current,
                password: event.target.value,
              }))
            }
            icon={<LockKeyhole className="h-4 w-4" />}
            error={errors.password}
            placeholder="Create a password"
            hint="Minimum length: 6 characters"
            rightSlot={
              <button
                type="button"
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
                onClick={() =>
                  setShowPassword((current) => !current)
                }
                className="text-zinc-500 transition hover:text-white"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            }
          />

          <Input
            label="Confirm password"
            type={showPassword ? "text" : "password"}
            name="confirmPassword"
            autoComplete="new-password"
            value={fields.confirmPassword}
            onChange={(event) =>
              setFields((current) => ({
                ...current,
                confirmPassword: event.target.value,
              }))
            }
            icon={<LockKeyhole className="h-4 w-4" />}
            error={errors.confirmPassword}
            placeholder="Re-enter your password"
          />
        </div>

        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={loading}
        >
          {loading ? (
            <>
              <Spinner size="sm" className="text-black" />
              <span>Creating your account</span>
            </>
          ) : (
            "Create account"
          )}
        </Button>

        <p className="text-center text-sm text-zinc-500">
          Already set up?{" "}
          <Link
            to="/login"
            className="font-medium text-emerald-300 transition hover:text-emerald-200"
          >
            Sign in here
          </Link>
        </p>
      </motion.form>
    </AuthShell>
  );
};

export default Register;
