"use client";

import React, { useState } from "react";
import { Button } from "@nextui-org/button";
import { Input } from "@nextui-org/input";
import { useRouter } from "next/navigation";
import { loginRequest } from "@/app/api/v1/login/request";
import logger from "@/lib/logger";

const Login = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await loginRequest(email, password);
      if (response.ok) {
        router.push("/account");
      } else {
        setError("Invalid email or password");
      }
    } catch (err: unknown) {
      logger.error({ err }, "Error during login");
      setError("An error occurred during login");
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
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full"
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
