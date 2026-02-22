import { MessageCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const WHATSAPP_LINK = "https://wa.me/255628612344";
const WHATSAPP_NUMBER = "0628612344";

const WhatsAppFloatButton = () => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <a
          href={WHATSAPP_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="button-lift fixed bottom-6 left-4 z-50 inline-flex items-center gap-2 rounded-full border border-white/10 bg-card/95 px-4 py-2 font-body text-sm font-semibold text-foreground shadow-[var(--soft-shadow)] hover:border-primary/40"
          aria-label="Chat on WhatsApp"
        >
          <MessageCircle className="h-4 w-4 text-green-400" />
          {WHATSAPP_NUMBER}
        </a>
      </TooltipTrigger>
      <TooltipContent>Chat on WhatsApp</TooltipContent>
    </Tooltip>
  );
};

export default WhatsAppFloatButton;
