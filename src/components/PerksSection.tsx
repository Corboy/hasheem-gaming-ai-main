import { Shield, Zap, CreditCard, Headphones } from "lucide-react";
import { motion } from "framer-motion";

const perks = [
  { icon: <Shield className="h-6 w-6" />, title: "Secure Payments", desc: "256-bit SSL encrypted transactions" },
  { icon: <Zap className="h-6 w-6" />, title: "Instant Delivery", desc: "Get your game keys in seconds" },
  { icon: <CreditCard className="h-6 w-6" />, title: "Best Prices", desc: "Price match guarantee on all titles" },
  { icon: <Headphones className="h-6 w-6" />, title: "24/7 Support", desc: "Our team is always here to help" },
];

const PerksSection = () => (
  <section className="py-16">
    <div className="container mx-auto px-4">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {perks.map((perk, i) => (
          <motion.div
            key={perk.title}
            className="rounded-xl border border-border bg-card p-5 text-center transition-all hover:border-primary/40 hover:shadow-[var(--neon-glow)]"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
          >
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
              {perk.icon}
            </div>
            <h4 className="mb-1 font-display text-xs font-bold uppercase tracking-wider text-foreground">
              {perk.title}
            </h4>
            <p className="font-body text-xs text-muted-foreground">{perk.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default PerksSection;
