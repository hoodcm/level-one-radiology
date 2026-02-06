import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface NewsletterSignupProps {
  headline?: string;
  subhead?: string;
  variant?: "inline" | "section";
}

export default function NewsletterSignup({
  headline,
  subhead,
  variant = "inline",
}: NewsletterSignupProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");
    setErrorMessage("");

    try {
      const response = await fetch("https://buttondown.com/api/emails/embed-subscribe/leveloneradiology", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ email }),
      });

      if (response.ok || response.status === 303) {
        setStatus("success");
        setEmail("");
      } else {
        setStatus("error");
        setErrorMessage("Something went wrong. Please try again.");
      }
    } catch {
      setStatus("error");
      setErrorMessage("Network error. Please try again.");
    }
  }

  if (variant === "section") {
    return (
      <div className="newsletter-cta">
        {headline && <h3 className="newsletter-cta__headline">{headline}</h3>}
        {subhead && <p className="newsletter-cta__subhead">{subhead}</p>}
        {status === "success" ? (
          <p style={{ color: "var(--color-signal-cyan)", fontSize: "var(--fz-body-s)" }}>
            You're in. Check your inbox for a welcome email.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="newsletter-inline">
            <div className="newsletter-inline__form">
              <Input
                type="email"
                placeholder="Your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                aria-label="Email address"
                disabled={status === "loading"}
              />
              <Button
                type="submit"
                disabled={status === "loading"}
                style={{
                  background: "var(--color-signal-red)",
                  borderColor: "var(--color-signal-red)",
                  color: "#ffffff",
                  fontFamily: "var(--ff-ui)",
                  fontSize: "var(--fz-ui)",
                  fontWeight: 700,
                  letterSpacing: "var(--ls-ui)",
                  textTransform: "uppercase" as const,
                }}
              >
                {status === "loading" ? "..." : "Subscribe"}
              </Button>
            </div>
            {status === "error" && (
              <p style={{ color: "var(--color-signal-red)", fontSize: "var(--fz-body-xs)" }}>
                {errorMessage}
              </p>
            )}
            <p className="newsletter-inline__privacy">No spam. Unsubscribe anytime.</p>
          </form>
        )}
      </div>
    );
  }

  // Inline variant (hero)
  return (
    <div className="newsletter-inline" id="subscribe">
      {status === "success" ? (
        <p style={{ color: "var(--color-signal-cyan)", fontSize: "var(--fz-body-s)" }}>
          You're in. Check your inbox for a welcome email.
        </p>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="newsletter-inline__form">
            <Input
              type="email"
              placeholder="Your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              aria-label="Email address"
              disabled={status === "loading"}
            />
            <Button
              type="submit"
              disabled={status === "loading"}
              style={{
                background: "var(--color-signal-red)",
                borderColor: "var(--color-signal-red)",
                color: "#ffffff",
                fontFamily: "var(--ff-ui)",
                fontSize: "var(--fz-ui)",
                fontWeight: 700,
                letterSpacing: "var(--ls-ui)",
                textTransform: "uppercase" as const,
              }}
            >
              {status === "loading" ? "..." : "Subscribe"}
            </Button>
          </div>
          {status === "error" && (
            <p style={{ color: "var(--color-signal-red)", fontSize: "var(--fz-body-xs)" }}>
              {errorMessage}
            </p>
          )}
          <p className="newsletter-inline__privacy">No spam. Unsubscribe anytime.</p>
        </form>
      )}
    </div>
  );
}
