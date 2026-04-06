import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* ========== HERO ========== */}
      <section className="flex flex-col items-center justify-center min-h-screen text-center px-4 relative overflow-hidden">
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />

        <div className="relative z-10 max-w-4xl space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full text-xs font-medium text-primary">
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            Now in beta — Powered by Liceu Underground
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-bold tracking-tight leading-[0.9]">
            Level up
            <br />
            <span className="text-primary">your language.</span>
          </h1>

          <p className="text-xl md:text-2xl text-foreground-muted font-light max-w-2xl mx-auto leading-relaxed">
            AI-powered ESL training built for Brazilian professionals.
            CEFR-aligned exercises, adaptive placement, and a tutor that
            actually knows your level.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link
              href="/onboarding"
              className="px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition text-lg neon-glow"
            >
              Take the Placement Test — Free
            </Link>
            <a
              href="#how-it-works"
              className="px-8 py-4 bg-secondary text-secondary-foreground font-semibold rounded-xl hover:bg-secondary/80 transition text-lg"
            >
              Learn more
            </a>
          </div>

          <p className="text-xs text-muted-foreground">
            No credit card required. Find your CEFR level in 5 minutes.
          </p>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-muted-foreground"
          >
            <path d="M12 5v14M19 12l-7 7-7-7" />
          </svg>
        </div>
      </section>

      {/* ========== SOCIAL PROOF ========== */}
      <section className="py-16 border-y border-border bg-background-muted">
        <div className="max-w-container mx-auto px-4 text-center space-y-6">
          <p className="text-sm text-muted-foreground uppercase tracking-widest font-medium">
            From the makers of Liceu Underground
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 text-muted-foreground">
            <div className="text-center">
              <p className="text-3xl font-bold text-foreground">100%</p>
              <p className="text-xs mt-1">AI-Generated Content</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-foreground">CEFR</p>
              <p className="text-xs mt-1">Aligned A1–C2</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-foreground">24/7</p>
              <p className="text-xs mt-1">AI Tutor Available</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-foreground">R$49</p>
              <p className="text-xs mt-1">/month Pro Plan</p>
            </div>
          </div>
        </div>
      </section>

      {/* ========== HOW IT WORKS ========== */}
      <section id="how-it-works" className="py-24 px-4">
        <div className="max-w-container mx-auto space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-display font-bold">
              How it <span className="text-primary">works</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Four steps from zero to fluent. No paperwork, no scheduling, no
              waiting.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              {
                step: "01",
                title: "Take the Placement Test",
                desc: "15 adaptive questions powered by Claude. We find your exact CEFR level — A1 through C2. Takes 5 minutes. Free.",
                icon: "🎯",
              },
              {
                step: "02",
                title: "Get Your Level",
                desc: "See your CEFR level instantly. Your personalized exercise queue is generated and ready to go.",
                icon: "📊",
              },
              {
                step: "03",
                title: "Practice Daily",
                desc: "MCQ, fill-in-the-blank, vocabulary, and listening exercises. Earn XP, build streaks, climb the leaderboard.",
                icon: "⚡",
              },
              {
                step: "04",
                title: "Talk to Leo",
                desc: "Our AI tutor adapts to your level. Practice conversation, ask grammar questions, get real-time feedback.",
                icon: "🤖",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="relative bg-card border border-border rounded-xl p-6 space-y-4 hover:border-primary/30 transition group"
              >
                <div className="text-4xl">{item.icon}</div>
                <div className="text-xs text-primary font-mono font-bold tracking-widest">
                  STEP {item.step}
                </div>
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== FEATURES ========== */}
      <section className="py-24 px-4 bg-background-muted">
        <div className="max-w-container mx-auto space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-display font-bold">
              Built for <span className="text-primary">real progress</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Not another gamified kindergarten. This is serious English training
              for adults who need results.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: "🧠",
                title: "AI-Generated Exercises",
                desc: "Claude generates exercises tailored to your level and topic. Always fresh, always relevant.",
              },
              {
                icon: "📈",
                title: "Adaptive Placement",
                desc: "15 questions that find your exact CEFR level. No guessing, no wasting time on content that's too easy or too hard.",
              },
              {
                icon: "🔥",
                title: "Streaks & Leaderboards",
                desc: "Daily streaks, XP system, weekly leaderboards. The kind of motivation that actually sticks.",
              },
              {
                icon: "🎧",
                title: "Listening Practice",
                desc: "Native-quality audio generated by OpenAI TTS. Train your ear with real-world English at your level.",
              },
              {
                icon: "🤖",
                title: "Leo — AI Tutor",
                desc: "A conversational tutor that knows your CEFR level. Practice anytime, get corrections that actually help.",
              },
              {
                icon: "👨‍🏫",
                title: "Teacher Oversight",
                desc: "Teachers can assign exercises, track progress, and reset levels. AI generates, humans verify.",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="bg-card border border-border rounded-xl p-6 space-y-3 hover:border-primary/30 transition"
              >
                <div className="text-3xl">{feature.icon}</div>
                <h3 className="text-lg font-semibold">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== COMPARISON ========== */}
      <section className="py-24 px-4">
        <div className="max-w-container mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-display font-bold">
              Why <span className="text-primary">Lexio</span>?
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              We're not Duolingo for adults. We're not a boring textbook. We're
              something in between.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-4 px-4 font-medium text-muted-foreground">
                    Feature
                  </th>
                  <th className="text-center py-4 px-4 font-bold text-primary">
                    Lexio
                  </th>
                  <th className="text-center py-4 px-4 font-medium text-muted-foreground">
                    Duolingo
                  </th>
                  <th className="text-center py-4 px-4 font-medium text-muted-foreground">
                    Traditional ESL
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {[
                  ["CEFR-aligned content", "✓", "✗", "✓"],
                  ["AI-generated exercises", "✓", "✗", "✗"],
                  ["AI conversational tutor", "✓", "✗", "✗"],
                  ["Teacher oversight", "✓", "✗", "✓"],
                  ["Professional/Business English", "✓", "✗", "△"],
                  ["Adult-focused UX", "✓", "✗", "△"],
                  ["Adaptive placement test", "✓", "✓", "△"],
                  ["Streaks & gamification", "✓", "✓", "✗"],
                ].map(([feature, lexio, duo, trad]) => (
                  <tr key={feature} className="hover:bg-secondary/30 transition">
                    <td className="py-3 px-4">{feature}</td>
                    <td className="py-3 px-4 text-center text-lg">{lexio}</td>
                    <td className="py-3 px-4 text-center text-muted-foreground">
                      {duo}
                    </td>
                    <td className="py-3 px-4 text-center text-muted-foreground">
                      {trad}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ========== TESTIMONIALS ========== */}
      <section className="py-24 px-4 bg-background-muted">
        <div className="max-w-container mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-display font-bold">
              What our <span className="text-primary">students</span> say
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                quote:
                  "Finally, something that doesn't feel like a children's game. The exercises are actually relevant to my job.",
                name: "Beta Tester",
                role: "IT Professional",
              },
              {
                quote:
                  "The AI tutor is genuinely good. It adjusts to my level and doesn't waste my time with stuff I already know.",
                name: "Beta Tester",
                role: "Finance Analyst",
              },
              {
                quote:
                  "I've tried every app out there. Lexio is the first one where I feel like I'm actually making progress.",
                name: "Beta Tester",
                role: "Healthcare Worker",
              },
            ].map((t, i) => (
              <div
                key={i}
                className="bg-card border border-border rounded-xl p-6 space-y-4"
              >
                <div className="text-primary text-2xl font-display">"</div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t.quote}
                </p>
                <div className="pt-2 border-t border-border">
                  <p className="font-medium text-sm">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== FAQ ========== */}
      <section className="py-24 px-4">
        <div className="max-w-3xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-display font-bold">
              Frequently <span className="text-primary">asked</span>
            </h2>
          </div>

          <div className="space-y-4">
            {[
              {
                q: "What is the CEFR?",
                a: "The Common European Framework of Reference for Languages. It's the international standard for describing language ability, from A1 (beginner) to C2 (mastery). All our content is calibrated to these levels.",
              },
              {
                q: "Is the placement test really free?",
                a: "Yes. Take it anytime, no account required. It's 15 adaptive questions and takes about 5 minutes. We show your result immediately — it's our way of letting you try before you commit.",
              },
              {
                q: "How is this different from Duolingo?",
                a: "Duolingo is designed for everyone, which means it's optimized for no one. Lexio is built specifically for Brazilian adults who need professional English. Our content is AI-generated, CEFR-aligned, and includes a real AI tutor that adapts to your level.",
              },
              {
                q: "Can I cancel my subscription anytime?",
                a: "Yes. Manage your subscription directly through Stripe's customer portal. No hidden fees, no cancellation calls, no retention tactics.",
              },
              {
                q: "Who creates the exercises?",
                a: "Claude (Anthropic's AI) generates exercises based on topic, level, and skill. Human teachers review and approve every exercise before it reaches students. Best of both worlds.",
              },
              {
                q: "What's Leo?",
                a: "Leo is our AI English tutor powered by Claude. He knows your CEFR level and adapts his vocabulary and corrections accordingly. Available 24/7 for conversation practice, grammar questions, and real-world English help.",
              },
            ].map((faq, i) => (
              <details
                key={i}
                className="bg-card border border-border rounded-xl group"
              >
                <summary className="px-6 py-4 cursor-pointer font-medium hover:text-primary transition list-none flex items-center justify-between">
                  {faq.q}
                  <span className="text-muted-foreground group-open:rotate-180 transition-transform">
                    ↓
                  </span>
                </summary>
                <div className="px-6 pb-4 text-sm text-muted-foreground leading-relaxed">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ========== PRICING ========== */}
      <section className="py-24 px-4 bg-background-muted">
        <div className="max-w-container mx-auto text-center space-y-12">
          <div className="space-y-4">
            <h2 className="text-3xl md:text-4xl font-display font-bold">
              Simple <span className="text-primary">pricing</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Start free. Upgrade when you're ready.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {/* Free */}
            <div className="bg-card border border-border rounded-xl p-8 space-y-6 text-left">
              <div>
                <h3 className="text-lg font-semibold">Free</h3>
                <p className="text-4xl font-bold mt-2">
                  R$0
                  <span className="text-base font-normal text-muted-foreground">
                    /forever
                  </span>
                </p>
              </div>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <span className="text-success">✓</span> CEFR Placement Test
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-success">✓</span> 3 AI Tutor messages/day
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-muted-foreground">✗</span> Full exercise library
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-muted-foreground">✗</span> Streaks & leaderboards
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-muted-foreground">✗</span> Progress tracking
                </li>
              </ul>
              <Link
                href="/onboarding"
                className="block w-full py-3 bg-secondary text-secondary-foreground font-semibold rounded-xl hover:bg-secondary/80 transition text-center"
              >
                Take the Placement Test
              </Link>
            </div>

            {/* Pro */}
            <div className="bg-card border-2 border-primary/30 rounded-xl p-8 space-y-6 text-left relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-primary text-primary-foreground text-xs font-semibold rounded-full">
                Most Popular
              </div>
              <div>
                <h3 className="text-lg font-semibold">Pro</h3>
                <p className="text-4xl font-bold mt-2">
                  R$49
                  <span className="text-base font-normal text-muted-foreground">
                    /month
                  </span>
                </p>
              </div>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <span className="text-success">✓</span> Full exercise library
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-success">✓</span> Unlimited AI Tutor
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-success">✓</span> Streaks, XP & leaderboards
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-success">✓</span> Progress tracking
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-success">✓</span> Teacher assignments
                </li>
              </ul>
              <Link
                href="/auth/login"
                className="block w-full py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition text-center neon-glow"
              >
                Start Learning Today
              </Link>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Cancel anytime via Stripe customer portal. No questions asked.
          </p>
        </div>
      </section>

      {/* ========== CTA ========== */}
      <section className="py-24 px-4">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <h2 className="text-3xl md:text-5xl font-display font-bold">
            Ready to <span className="text-primary">level up</span>?
          </h2>
          <p className="text-lg text-muted-foreground max-w-lg mx-auto">
            Take the free placement test. Find your level. Start practicing in
            under 5 minutes.
          </p>
          <Link
            href="/onboarding"
            className="inline-block px-10 py-4 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition text-lg neon-glow"
          >
            Start for Free
          </Link>
        </div>
      </section>

      {/* ========== FOOTER ========== */}
      <footer className="py-12 border-t border-border px-4">
        <div className="max-w-container mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <h4 className="font-display font-bold text-lg mb-2">
                Lexio Underground
              </h4>
              <p className="text-sm text-muted-foreground">
                AI-powered ESL training for Brazilian professionals.
                <br />
                From the makers of Liceu Underground.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Product</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>
                  <Link
                    href="/onboarding"
                    className="hover:text-foreground transition"
                  >
                    Placement Test
                  </Link>
                </li>
                <li>
                  <Link
                    href="/auth/login"
                    className="hover:text-foreground transition"
                  >
                    Sign In
                  </Link>
                </li>
                <li>
                  <Link
                    href="/billing"
                    className="hover:text-foreground transition"
                  >
                    Pricing
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Legal</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-foreground transition">
                    Terms of Use
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-8 text-center text-xs text-muted-foreground">
            <p>© {new Date().getFullYear()} Lexio Underground — by Liceu Underground. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
