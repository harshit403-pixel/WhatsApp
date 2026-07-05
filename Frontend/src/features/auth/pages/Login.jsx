import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import { motion } from "framer-motion";
import { useSelector } from "react-redux";

import useAuth from "../hooks/useAuth";
import AuthShell from "../components/AuthShell";
import { Button } from "../../shared/components/ui/Button";
import Input from "../../shared/components/ui/Input";
import Spinner from "../../shared/components/ui/Spinner";
import { appToast } from "../../shared/lib/toast";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { loading } = useSelector((state) => state.auth);

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [fields, setFields] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const nextErrors = {};

    if (!fields.email.trim()) {
      nextErrors.email = "Email is required.";
    } else if (!/\S+@\S+\.\S+/.test(fields.email)) {
      nextErrors.email = "Please provide a valid email address.";
    }

    if (!fields.password.trim()) {
      nextErrors.password = "Password is required.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!validate()) {
      appToast.error(
        "We need a few details first",
        "Check the highlighted fields and try again."
      );
      return;
    }

    try {
      await login({
        email: fields.email.trim(),
        password: fields.password,
      });

      appToast.success(
        "Welcome back",
        rememberMe
          ? "Your secure session is ready on this device."
          : "You're signed in and ready to jump back in."
      );
      navigate("/");
    } catch (error) {
      appToast.error(
        error.response?.data?.message || "Login failed",
        "Double-check your credentials and try again."
      );
    }
  };

  return (
    <AuthShell
      eyebrow="Return to chat"
      title="Step back into your workspace."
      description="Sign in with your existing account to access the redesigned desktop messaging experience."
      footerPrompt="Need an account?"
      footerLabel="Create one"
      footerHref="/register"
    >
      <motion.form
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.24, delay: 0.08 }}
        onSubmit={handleLogin}
        className="glass-panel w-full max-w-xl space-y-6 rounded-[2rem] p-6 sm:p-7"
      >
        <div className="space-y-1">
          <h2 className="text-xl font-semibold text-white">
            Welcome back
          </h2>
          <p className="text-sm text-zinc-400">
            Use your existing credentials. Session cookies remain secure on the
            backend.
          </p>
        </div>

        <div className="grid gap-4">
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
            autoComplete="current-password"
            value={fields.password}
            onChange={(event) =>
              setFields((current) => ({
                ...current,
                password: event.target.value,
              }))
            }
            icon={<LockKeyhole className="h-4 w-4" />}
            error={errors.password}
            placeholder="Enter your password"
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
        </div>

        <div className="flex flex-col gap-3 text-sm text-zinc-400 sm:flex-row sm:items-center sm:justify-between">
          <label className="inline-flex items-center gap-3 text-zinc-300">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(event) =>
                setRememberMe(event.target.checked)
              }
              className="h-4 w-4 rounded border-white/12 bg-white/5 text-emerald-400 accent-emerald-400"
            />
            <span>Remember me on this device</span>
          </label>

          <span className="text-xs text-zinc-500">
            Secure cookie sessions stay enabled either way.
          </span>
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
              <span>Signing you in</span>
            </>
          ) : (
            "Enter workspace"
          )}
        </Button>

        <p className="text-center text-sm text-zinc-500">
          Prefer a fresh start?{" "}
          <Link
            to="/register"
            className="font-medium text-emerald-300 transition hover:text-emerald-200"
          >
            Register instead
          </Link>
        </p>
      </motion.form>
    </AuthShell>
  );
};

export default Login;
