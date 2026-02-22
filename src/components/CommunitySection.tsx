import { motion } from "framer-motion";
import { Quote, Star } from "lucide-react";

const testimonials = [
  {
    name: "Aron M.",
    role: "Competitive FPS Player",
    quote: "Delivery was instant and activation worked without any friction. This is now my default game store.",
  },
  {
    name: "Linda K.",
    role: "RPG Collector",
    quote: "The platform filters are clean and I can find quality titles in minutes. Pricing is consistently strong.",
  },
  {
    name: "Moses T.",
    role: "Content Creator",
    quote: "Reliable checkout and clear game details make this store easy to recommend to my audience.",
  },
];

const CommunitySection = () => {
  return (
    <section id="community" className="border-y border-border bg-card/50 py-20">
      <div className="container mx-auto px-4">
        <div className="mb-10 text-center">
          <h2 className="font-display text-3xl font-bold uppercase tracking-wider text-foreground md:text-4xl">
            Community <span className="text-primary">Reviews</span>
          </h2>
          <p className="mt-3 font-body text-lg text-muted-foreground">
            Feedback from players using HASHEEM GAMING every week.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {testimonials.map((item, index) => (
            <motion.article
              key={item.name}
              className="rounded-xl border border-border bg-background/70 p-5"
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: index * 0.1 }}
            >
              <div className="mb-3 flex items-center justify-between">
                <Quote className="h-5 w-5 text-primary" />
                <div className="flex items-center gap-1 text-primary">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-current" />
                  ))}
                </div>
              </div>
              <p className="mb-4 font-body text-sm leading-relaxed text-muted-foreground">"{item.quote}"</p>
              <div>
                <p className="font-display text-xs font-bold uppercase tracking-wide text-foreground">{item.name}</p>
                <p className="font-body text-xs text-muted-foreground">{item.role}</p>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CommunitySection;
