export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="bg-primary/5 border-b border-border py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">About LIFE WITH AI</h1>
          <p className="text-xl text-muted-foreground">Empowering India's next generation with practical AI skills</p>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-14">
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-4">Our Mission</h2>
          <p className="text-muted-foreground leading-relaxed text-lg">
            LIFE WITH AI was founded with one goal: make quality AI education accessible to every student and job seeker in India. We believe that understanding Artificial Intelligence is no longer optional — it's the skill that separates the future-ready from the rest.
          </p>
        </section>
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-6">Why Choose Us</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: "Industry-Expert Instructors", desc: "Our courses are taught by practitioners with real-world AI and ML experience." },
              { title: "Practical Curriculum", desc: "Every lesson is designed around real problems you'll face on the job — not just theory." },
              { title: "Affordable Pricing", desc: "World-class education at prices that work for Indian students and job seekers." },
            ].map(({ title, desc }) => (
              <div key={title} className="bg-card border border-border rounded-xl p-6">
                <h3 className="font-semibold text-foreground mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </section>
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-4">Our Story</h2>
          <p className="text-muted-foreground leading-relaxed">
            Started in 2023 by a group of AI engineers and educators, LIFE WITH AI has grown into a trusted platform for thousands of learners. From machine learning fundamentals to advanced deep learning, our curriculum is continuously updated to reflect the fast-moving AI landscape.
          </p>
        </section>
        <section className="bg-primary/5 rounded-2xl p-8 text-center">
          <p className="text-3xl font-bold text-primary mb-2">5,000+</p>
          <p className="text-muted-foreground mb-6">Students enrolled across India</p>
          <div className="grid grid-cols-3 gap-4">
            {[["50+", "Courses"], ["100+", "PDF Resources"], ["4.8★", "Avg Rating"]].map(([num, label]) => (
              <div key={label}>
                <p className="text-xl font-bold text-foreground">{num}</p>
                <p className="text-sm text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
