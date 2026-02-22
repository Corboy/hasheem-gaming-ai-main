import { motion } from "framer-motion";
import { CreditCard, Headphones, Lock, Smartphone } from "lucide-react";

const paymentMethods = [
  { label: "M-Pesa", icon: <Smartphone className="h-4 w-4" /> },
  { label: "Tigo Pesa", icon: <Smartphone className="h-4 w-4" /> },
  { label: "Airtel Money", icon: <Smartphone className="h-4 w-4" /> },
  { label: "Visa", icon: <CreditCard className="h-4 w-4" /> },
  { label: "Mastercard", icon: <CreditCard className="h-4 w-4" /> },
];

const trustFeatures = [
  {
    icon: <Lock className="h-5 w-5" />,
    title: "Secure Payments",
    description: "All payments are encrypted and verified before completion.",
  },
  {
    icon: <CreditCard className="h-5 w-5" />,
    title: "Instant Digital Delivery",
    description: "Your game key is delivered instantly after successful checkout.",
  },
  {
    icon: <Headphones className="h-5 w-5" />,
    title: "24/7 Customer Support",
    description: "Our team is always available for payment or activation support.",
  },
];

const PerksSection = () => {
  return (
    <section className="section-shell border-y border-white/5 bg-card/60">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-display text-3xl font-semibold text-foreground md:text-4xl">
            Secure & Trusted Checkout
          </h2>
          <p className="mt-3 font-body text-base text-muted-foreground">
            All transactions are securely processed and encrypted.
          </p>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-2.5">
          {paymentMethods.map((method) => (
            <div
              key={method.label}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-background px-4 py-2 font-body text-sm font-medium text-foreground"
            >
              <span className="text-primary">{method.icon}</span>
              {method.label}
            </div>
          ))}
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {trustFeatures.map((feature, index) => (
            <motion.article
              key={feature.title}
              className="rounded-2xl border border-white/8 bg-background/80 p-5"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: index * 0.08 }}
            >
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                {feature.icon}
              </div>
              <h3 className="font-display text-lg font-semibold text-foreground">{feature.title}</h3>
              <p className="mt-2 font-body text-sm text-muted-foreground">{feature.description}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PerksSection;
