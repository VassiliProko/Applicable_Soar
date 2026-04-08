"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { X, Mail, ArrowLeft } from "lucide-react";
import Button from "@/app/components/ui/Button";
import Input from "@/app/components/ui/Input";
import { sendOtp, verifyOtp } from "@/app/actions/auth";
import { createClient } from "@/utils/supabase/client";

type Step = "email" | "otp";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  onAuthenticated: () => void;
}

export default function AuthModal({
  open,
  onClose,
  onAuthenticated,
}: AuthModalProps) {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const emailRef = useRef<HTMLInputElement>(null);

  // Focus email input when modal opens
  useEffect(() => {
    if (open && step === "email") {
      setTimeout(() => emailRef.current?.focus(), 100);
    }
  }, [open, step]);

  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      setStep("email");
      setEmail("");
      setOtp(["", "", "", "", "", ""]);
      setError("");
      setLoading(false);
    }
  }, [open]);

  const handleSendOtp = async () => {
    if (!email.trim()) return;
    setLoading(true);
    setError("");

    const result = await sendOtp(email.trim());

    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    setStep("otp");
    setLoading(false);
    setTimeout(() => otpRefs.current[0]?.focus(), 100);
  };

  const handleVerifyOtp = useCallback(
    async (code: string) => {
      setLoading(true);
      setError("");

      const result = await verifyOtp(email.trim(), code);

      if (result.error) {
        setError(result.error);
        setOtp(["", "", "", "", "", ""]);
        setLoading(false);
        setTimeout(() => otpRefs.current[0]?.focus(), 100);
        return;
      }

      onAuthenticated();
    },
    [email, onAuthenticated]
  );

  const handleOtpChange = (index: number, value: string) => {
    // Only allow digits
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...otp];
    next[index] = digit;
    setOtp(next);

    if (digit && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 6 digits are filled
    if (digit && index === 5) {
      const code = next.join("");
      if (code.length === 6) {
        handleVerifyOtp(code);
      }
    }
  };

  const handleOtpKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 0) return;

    const next = ["", "", "", "", "", ""];
    for (let i = 0; i < pasted.length; i++) {
      next[i] = pasted[i];
    }
    setOtp(next);

    if (pasted.length === 6) {
      handleVerifyOtp(pasted);
    } else {
      otpRefs.current[pasted.length]?.focus();
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${window.location.pathname}`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="
          relative z-10 w-full max-w-[var(--modal-max-width)]
          bg-background rounded-[var(--radius-lg)]
          shadow-high border border-border
          mx-md
          animate-[modalIn_var(--duration-base)_var(--ease-enter)_forwards]
        "
      >
        {/* Header */}
        <div className="flex items-center justify-between px-lg pt-lg pb-sm">
          <div className="flex items-center gap-2xs">
            {step === "otp" && (
              <button
                onClick={() => {
                  setStep("email");
                  setOtp(["", "", "", "", "", ""]);
                  setError("");
                }}
                className="p-1 -ml-1 rounded-[var(--radius-sm)] text-text-secondary hover:text-text-primary hover:bg-surface-1 transition-colors duration-[var(--duration-micro)] cursor-pointer"
              >
                <ArrowLeft size={18} />
              </button>
            )}
            <h2 className="type-title">
              {step === "email" ? "Sign in to SOAR" : "Enter verification code"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-[var(--radius-sm)] text-text-secondary hover:text-text-primary hover:bg-surface-1 transition-colors duration-[var(--duration-micro)] cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-lg pb-lg">
          {step === "email" ? (
            <>
              <p className="type-body text-text-secondary mb-md">
                Enter your email to receive a 6-digit verification code.
              </p>

              {/* Google Sign-In */}
              <button
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="
                  w-full h-[var(--input-height)] px-[var(--input-px)]
                  rounded-[var(--radius-sm)] border border-border
                  bg-background text-text-primary type-body font-medium
                  hover:border-border-hover hover:bg-surface-1
                  active:scale-[0.99]
                  transition-all duration-[var(--duration-micro)]
                  flex items-center justify-center gap-2xs
                  disabled:opacity-40 disabled:pointer-events-none
                  cursor-pointer
                "
              >
                <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4" />
                  <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853" />
                  <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.997 8.997 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05" />
                  <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335" />
                </svg>
                Continue with Google
              </button>

              {/* Divider */}
              <div className="flex items-center gap-sm my-md">
                <div className="flex-1 h-px bg-border" />
                <span className="type-caption text-text-tertiary">or</span>
                <div className="flex-1 h-px bg-border" />
              </div>

              {/* Email input */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendOtp();
                }}
              >
                <Input
                  ref={emailRef}
                  type="email"
                  placeholder="you@example.com"
                  label="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={!!error}
                  autoComplete="email"
                />

                {error && (
                  <p className="type-caption text-error mt-2xs">{error}</p>
                )}

                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  className="w-full mt-md"
                  disabled={loading || !email.trim()}
                >
                  {loading ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Sending...
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-2">
                      <Mail size={16} />
                      Send verification code
                    </span>
                  )}
                </Button>
              </form>
            </>
          ) : (
            <>
              <p className="type-body text-text-secondary mb-md">
                We sent a 6-digit code to{" "}
                <span className="font-medium text-text-primary">{email}</span>
              </p>

              {/* OTP Inputs */}
              <div className="flex gap-2xs justify-center mb-md" onPaste={handleOtpPaste}>
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => {
                      otpRefs.current[i] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    disabled={loading}
                    className="
                      w-11 h-13 text-center text-xl font-semibold
                      rounded-[var(--radius-sm)] border
                      bg-background text-text-primary
                      transition-all duration-[var(--duration-micro)]
                      placeholder:text-text-tertiary
                      focus:outline-none focus:border-primary focus:ring-2 focus:ring-[var(--primary-focus-ring)]
                      border-border hover:border-border-hover
                      disabled:opacity-40
                    "
                    autoComplete="one-time-code"
                  />
                ))}
              </div>

              {error && (
                <p className="type-caption text-error text-center mb-sm">{error}</p>
              )}

              {loading && (
                <div className="flex justify-center mb-sm">
                  <span className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                </div>
              )}

              <button
                onClick={handleSendOtp}
                disabled={loading}
                className="
                  w-full type-caption text-text-secondary
                  hover:text-primary transition-colors duration-[var(--duration-micro)]
                  disabled:opacity-40 cursor-pointer text-center
                "
              >
                Didn&apos;t receive the code? Resend
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
