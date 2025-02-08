"use client";

import React, { useState } from "react";
import { Button } from "@nextui-org/button";
import { Input } from "@nextui-org/input";
import { useRouter } from "next/navigation";
import { loginRequest } from "@/app/api/v1/login/request";
import logger from "@/lib/logger";
import { InvalidEmailOrPasswordError } from "@/lib/errors";
import { useAuth } from "@/providers/AuthProvider";

const Login = () => {
  const router = useRouter();
  const { setIsLoggedIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await loginRequest(email, password);
      setIsLoggedIn(true);
      router.push("/account");
    } catch (err: unknown) {
      if (err instanceof InvalidEmailOrPasswordError) {
        setError("Invalid email or password");
      } else {
        setError("An error occurred during login");
      }
      logger.error(err, "Error during login");
    }
  };

  return (
    <div className="flex flex-col justify-center items-center mt-12">
      <div className="w-1/2 text-center flex flex-col items-center">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full"
            autoComplete="email"
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full"
            autoComplete="current-password"
          />
          {error && <p className="text-red-500">{error}</p>}
          <Button type="submit" className="w-full">
            Login
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Login;
