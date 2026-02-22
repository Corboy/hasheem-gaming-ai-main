import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import CartDrawer from "@/components/CartDrawer";
import { CommerceProvider } from "@/contexts/CommerceContext";
import { SiteSettingsProvider } from "@/contexts/SiteSettingsContext";
import ContentPage from "@/pages/ContentPage";
import Admin from "@/pages/Admin";
import Index from "./pages/Index";
import GameDetail from "./pages/GameDetail";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <SiteSettingsProvider>
    <CommerceProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <CartDrawer />

            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/game/:id" element={<GameDetail />} />
              <Route
                path="/about"
                element={
                  <ContentPage
                    title="About HASHEEM GAMING"
                    description="HASHEEM GAMING is a digital storefront focused on fast delivery, transparent pricing, and reliable support for gamers."
                    sections={[
                      {
                        heading: "Who We Are",
                        body: [
                          "HASHEEM GAMING is a curated marketplace for digital games across PC, Mobile, and PlayStation.",
                          "Our mission is simple: help players discover quality titles quickly and purchase with confidence.",
                        ],
                      },
                      {
                        heading: "What We Prioritize",
                        body: [
                          "Clear pricing and visible discounts.",
                          "Secure checkout flows and reliable delivery.",
                          "Responsive support when customers need help.",
                        ],
                      },
                      {
                        heading: "How We Improve",
                        body: [
                          "We continuously update our catalog, experience, and support workflows based on customer feedback and usage analytics.",
                        ],
                      },
                    ]}
                  />
                }
              />
              <Route
                path="/contact"
                element={
                  <ContentPage
                    title="Contact Support"
                    description="Need help with orders, activation, refunds, or account issues? Reach our support team through the channels below."
                    sections={[
                      {
                        heading: "Support Channels",
                        body: [
                          "Email: support@hasheemgaming.com",
                          "Phone: +1 (202) 555-0118",
                          "Live assistant: use the support widget on the bottom-right corner.",
                        ],
                      },
                      {
                        heading: "Support Hours",
                        body: [
                          "We process urgent issues every day and aim to respond to all requests within 24 hours.",
                        ],
                      },
                      {
                        heading: "When Contacting Us",
                        body: [
                          "Please include your order reference, platform, and a short issue summary. This helps us resolve faster.",
                        ],
                      },
                    ]}
                  />
                }
              />
              <Route
                path="/privacy"
                element={
                  <ContentPage
                    title="Privacy Policy"
                    description="This policy explains how HASHEEM GAMING collects, uses, and protects your personal information."
                    sections={[
                      {
                        heading: "Information We Collect",
                        body: [
                          "Contact details provided during account creation or support requests.",
                          "Order and transaction details required to deliver your purchases.",
                          "Basic analytics data used to improve site performance and user experience.",
                        ],
                      },
                      {
                        heading: "How We Use Data",
                        body: [
                          "To process purchases and deliver digital products.",
                          "To provide customer support and prevent fraud.",
                          "To improve storefront usability and conversion flow.",
                        ],
                      },
                      {
                        heading: "Data Protection",
                        body: [
                          "We apply technical and organizational controls to protect customer data and limit unauthorized access.",
                        ],
                      },
                    ]}
                  />
                }
              />
              <Route
                path="/terms"
                element={
                  <ContentPage
                    title="Terms of Service"
                    description="By accessing or purchasing from HASHEEM GAMING, you agree to the following terms."
                    sections={[
                      {
                        heading: "Account Responsibilities",
                        body: [
                          "Users are responsible for maintaining account security and ensuring information is accurate.",
                        ],
                      },
                      {
                        heading: "Purchases and Access",
                        body: [
                          "Digital products are delivered to the purchasing account and may be subject to platform-specific activation rules.",
                        ],
                      },
                      {
                        heading: "Limitations",
                        body: [
                          "Reselling purchased keys and abuse of promotions may result in order cancellation or account restrictions.",
                        ],
                      },
                    ]}
                  />
                }
              />
              <Route
                path="/refund-policy"
                element={
                  <ContentPage
                    title="Refund Policy"
                    description="We review refund requests fairly and as quickly as possible while protecting against abuse."
                    sections={[
                      {
                        heading: "Eligible Cases",
                        body: [
                          "Duplicate purchases.",
                          "Activation failures that cannot be resolved by support.",
                          "Incorrect product fulfillment caused by platform error.",
                        ],
                      },
                      {
                        heading: "Non-Eligible Cases",
                        body: [
                          "Products already redeemed successfully.",
                          "Requests made after significant usage where applicable.",
                        ],
                      },
                      {
                        heading: "How to Request",
                        body: [
                          "Submit your order reference and issue details through support. Our team will review and respond with next steps.",
                        ],
                      },
                    ]}
                  />
                }
              />
              <Route path="/admin" element={<Admin />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </CommerceProvider>
  </SiteSettingsProvider>
);

export default App;
