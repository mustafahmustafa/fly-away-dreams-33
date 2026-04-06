import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

type Status = "loading" | "valid" | "already" | "invalid" | "success" | "error";

const Unsubscribe = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<Status>("loading");

  useEffect(() => {
    if (!token) {
      setStatus("invalid");
      return;
    }
    const validate = async () => {
      try {
        const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/handle-email-unsubscribe?token=${token}`;
        const resp = await fetch(url, {
          headers: { apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY },
        });
        const data = await resp.json();
        if (resp.ok && data.valid === true) setStatus("valid");
        else if (data.reason === "already_unsubscribed") setStatus("already");
        else setStatus("invalid");
      } catch {
        setStatus("invalid");
      }
    };
    validate();
  }, [token]);

  const handleUnsubscribe = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("handle-email-unsubscribe", {
        body: { token },
      });
      if (error) throw error;
      if (data?.success) setStatus("success");
      else if (data?.reason === "already_unsubscribed") setStatus("already");
      else setStatus("error");
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-5">
      <div className="bg-card border border-border rounded-2xl p-10 max-w-[440px] w-full text-center">
        {status === "loading" && (
          <>
            <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-xl mx-auto mb-4 animate-pulse">✉</div>
            <p className="text-foreground/50 text-sm">Validating your request...</p>
          </>
        )}
        {status === "valid" && (
          <>
            <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-2xl mx-auto mb-5">✉</div>
            <h1 className="font-display text-xl font-bold text-foreground mb-2">Unsubscribe</h1>
            <p className="text-sm text-foreground/50 mb-6 leading-relaxed">
              You'll stop receiving app emails from SkyVoyAI. This won't affect account-related emails.
            </p>
            <button
              onClick={handleUnsubscribe}
              className="w-full py-3 bg-destructive text-destructive-foreground rounded-lg font-medium text-sm transition-all hover:opacity-90"
            >
              Confirm Unsubscribe
            </button>
          </>
        )}
        {status === "success" && (
          <>
            <div className="w-14 h-14 rounded-full bg-success/10 border border-success/20 flex items-center justify-center text-2xl mx-auto mb-5">✓</div>
            <h1 className="font-display text-xl font-bold text-foreground mb-2">Unsubscribed</h1>
            <p className="text-sm text-foreground/50 leading-relaxed">You've been successfully unsubscribed from app emails.</p>
          </>
        )}
        {status === "already" && (
          <>
            <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center text-2xl mx-auto mb-5">📭</div>
            <h1 className="font-display text-xl font-bold text-foreground mb-2">Already Unsubscribed</h1>
            <p className="text-sm text-foreground/50 leading-relaxed">You've already been removed from our mailing list.</p>
          </>
        )}
        {status === "invalid" && (
          <>
            <div className="w-14 h-14 rounded-full bg-destructive/10 border border-destructive/20 flex items-center justify-center text-2xl mx-auto mb-5">⚠</div>
            <h1 className="font-display text-xl font-bold text-foreground mb-2">Invalid Link</h1>
            <p className="text-sm text-foreground/50 leading-relaxed">This unsubscribe link is invalid or has expired.</p>
          </>
        )}
        {status === "error" && (
          <>
            <div className="w-14 h-14 rounded-full bg-destructive/10 border border-destructive/20 flex items-center justify-center text-2xl mx-auto mb-5">✕</div>
            <h1 className="font-display text-xl font-bold text-foreground mb-2">Something Went Wrong</h1>
            <p className="text-sm text-foreground/50 leading-relaxed">Please try again later or contact support.</p>
          </>
        )}
      </div>
    </div>
  );
};

export default Unsubscribe;
