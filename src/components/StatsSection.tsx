import { motion } from "framer-motion";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";
import { statIconMap } from "@/lib/site-icon-map";

const StatsSection = () => {
  const { settings } = useSiteSettings();

  return (
    <section className="section-shell border-y border-white/5 bg-card/60">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
          {settings.stats.map((stat, index) => (
            <motion.div
              key={`${stat.label}-${index}`}
              className="rounded-2xl border border-white/5 bg-background/70 p-5 text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                {statIconMap[stat.icon]}
              </div>
              <div className="font-display text-2xl font-semibold text-foreground md:text-3xl">
                {stat.value}
              </div>
              <div className="font-body text-sm text-muted-foreground">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
