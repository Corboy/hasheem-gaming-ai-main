import { motion } from "framer-motion";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";
import { statIconMap } from "@/lib/site-icon-map";

const StatsSection = () => {
  const { settings } = useSiteSettings();

  return (
    <section className="border-y border-border bg-card py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {settings.stats.map((stat, index) => (
            <motion.div
              key={`${stat.label}-${index}`}
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary">
                {statIconMap[stat.icon]}
              </div>
              <div className="font-display text-2xl font-black text-foreground md:text-3xl">
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
