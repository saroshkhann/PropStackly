"use client";

import { Mail, MessageCircle, Phone, PlugZap, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type Channel = "call" | "whatsapp" | "email";

const channels: Record<Channel, { label: string; icon: LucideIcon; explain: string; logLabel: string }> = {
  call: {
    label: "Call",
    icon: Phone,
    explain: "Calling isn't connected yet. Once enabled, this will open your phone's dialer with the client's number.",
    logLabel: "Log a call instead",
  },
  whatsapp: {
    label: "WhatsApp",
    icon: MessageCircle,
    explain: "WhatsApp isn't connected yet. Once enabled, this will open a chat with the client in WhatsApp.",
    logLabel: "Log a WhatsApp message",
  },
  email: {
    label: "Email",
    icon: Mail,
    explain: "Email isn't connected yet. Once enabled, this will open a new message in your email app.",
    logLabel: "Log an email",
  },
};

interface ContactActionsProps {
  phoneMasked: string;
  hasWhatsApp: boolean;
  email: string | null;
  onLog?: (channel: Channel) => void;
  size?: "sm" | "default";
  className?: string;
}

/** Quick contact buttons that are explicit about integrations not being connected in the prototype. */
export function ContactActions({ phoneMasked, hasWhatsApp, email, onLog, size = "default", className }: ContactActionsProps) {
  const available: Channel[] = ["call", ...(hasWhatsApp ? (["whatsapp"] as const) : []), ...(email ? (["email"] as const) : [])];

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {available.map((channel) => {
        const meta = channels[channel];
        const Icon = meta.icon;
        return (
          <Popover key={channel}>
            <PopoverTrigger asChild>
              <Button variant="outline" size={size}>
                <Icon />
                {meta.label}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-72">
              <div className="flex items-start gap-3">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-warning-soft text-warning">
                  <PlugZap className="size-4" aria-hidden />
                </span>
                <div className="min-w-0 text-sm">
                  <p className="font-medium">Integration not connected</p>
                  <p className="mt-1 text-[13px] text-muted-foreground">{meta.explain}</p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {channel === "email" ? email : phoneMasked}
                  </p>
                </div>
              </div>
              {onLog && (
                <Button variant="secondary" size="sm" className="mt-3 w-full" onClick={() => onLog(channel)}>
                  {meta.logLabel}
                </Button>
              )}
            </PopoverContent>
          </Popover>
        );
      })}
    </div>
  );
}
