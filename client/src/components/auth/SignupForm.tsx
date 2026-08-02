import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import useAuth from "../../hooks/useAuth";
import Button from "../common/Button";
import Input from "../common/Input";

interface SignupData {
  name: string;
  email: string;
  password: string;
}

const SignupForm = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupData>();

  const onSubmit = async (data: SignupData) => {
    try {
      setLoading(true);
      await signup(data);
      toast.success("Account created successfully!");
      navigate("/dashboard");
    } catch {
      toast.error("Could not create account. Email may already be registered.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white dark:bg-gray-800 shadow-lg rounded-xl p-8">

      <h2 className="text-3xl font-bold text-center mb-6">
        Create Account
      </h2>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-5"
      >
        <Input
          label="Name"
          placeholder="Full Name"
          {...register("name", {
            required: "Name is required",
          })}
        />

        <Input
          label="Email"
          placeholder="Email"
          {...register("email", {
            required: "Email is required",
          })}
        />

        <Input
          label="Password"
          type="password"
          placeholder="Password"
          {...register("password", {
            required: "Password is required",
            minLength: {
              value: 6,
              message: "Password must be at least 6 characters",
            },
          })}
        />

        <Button
          type="submit"
          className="w-full"
          disabled={loading}
        >
          {loading ? "Creating account..." : "Register"}
        </Button>

      </form>

      <p className="text-center mt-5">

        Already have an account?

        <Link
          to="/login"
          className="text-blue-600 ml-2"
        >
          Login
        </Link>

      </p>

    </div>
  );
};

export default SignupForm;
