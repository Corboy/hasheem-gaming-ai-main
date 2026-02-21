import { Gamepad2, Trophy, Users, Download } from "lucide-react";
import { motion } from "framer-motion";

const stats = [
  { icon: <Gamepad2 className="h-7 w-7" />, value: "500+", label: "Games Available" },
  { icon: <Users className="h-7 w-7" />, value: "2M+", label: "Active Gamers" },
  { icon: <Download className="h-7 w-7" />, value: "10M+", label: "Downloads" },
  { icon: <Trophy className="h-7 w-7" />, value: "99.9%", label: "Uptime" },
];

const StatsSection = () => {
  return (
    <section className="border-y border-border bg-card py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
            >
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary">
                {stat.icon}
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
