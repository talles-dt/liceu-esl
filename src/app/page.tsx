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
            Agora em beta — Powered by Liceu Underground
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-bold tracking-tight leading-[0.9]">
            Evolua
            <br />
            <span className="text-primary">seu inglês.</span>
          </h1>

          <p className="text-xl md:text-2xl text-foreground-muted font-light max-w-2xl mx-auto leading-relaxed">
            Treinamento de ESL com IA para profissionais brasileiros. Exercícios alinhados ao CEFR, nivelamento adaptativo e um tutor que
            realmente conhece seu nível.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link
              href="/onboarding"
              className="px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition text-lg neon-glow"
            >
              Faça o Teste de Nivelamento — Grátis
            </Link>
            <a
              href="#how-it-works"
              className="px-8 py-4 bg-secondary text-secondary-foreground font-semibold rounded-xl hover:bg-secondary/80 transition text-lg"
            >
              Saiba mais
            </a>
          </div>

          <p className="text-xs text-muted-foreground">
            Não precisa de cartão de crédito. Descubra seu nível CEFR em 5 minutos.
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
            Dos criadores do Liceu Underground
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 text-muted-foreground">
            <div className="text-center">
              <p className="text-3xl font-bold text-foreground">100%</p>
              <p className="text-xs mt-1">Conteúdo Gerado por IA</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-foreground">CEFR</p>
              <p className="text-xs mt-1">Alinhado A1–C2</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-foreground">24/7</p>
              <p className="text-xs mt-1">Tutor IA Disponível</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-foreground">R$99</p>
              <p className="text-xs mt-1">/mês Plano Pro</p>
            </div>
          </div>
        </div>
      </section>

      {/* ========== HOW IT WORKS ========== */}
      <section id="how-it-works" className="py-24 px-4">
        <div className="max-w-container mx-auto space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-display font-bold">
              Como <span className="text-primary">funciona</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Quatro passos do zero à fluência. Sem burocracia, sem agendamento, sem
              espera.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              {
                step: "01",
                title: "Faça o Teste de Nivelamento",
                desc: "15 perguntas adaptativas com Claude. Encontramos seu nível exato do CEFR — de A1 a C2. Leva 5 minutos. Grátis.",
                icon: "🎯",
              },
              {
                step: "02",
                title: "Descubra Seu Nível",
                desc: "Veja seu nível CEFR instantaneamente. Sua fila personalizada de exercícios é gerada e está pronta para começar.",
                icon: "📊",
              },
              {
                step: "03",
                title: "Pratique Diariamente",
                desc: "Exercícios de múltipla escolha, preencher lacunas, vocabulário e compreensão auditiva. Ganhe XP, mantenha sequências, suba no ranking.",
                icon: "⚡",
              },
              {
                step: "04",
                title: "Converse com o Leo",
                desc: "Nosso tutor de IA se adapta ao seu nível. Pratique conversação, tire dúvidas de gramática e receba feedback em tempo real.",
                icon: "🤖",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="relative bg-card border border-border rounded-xl p-6 space-y-4 hover:border-primary/30 transition group"
              >
                <div className="text-4xl">{item.icon}</div>
                <div className="text-xs text-primary font-mono font-bold tracking-widest">
                  PASSO {item.step}
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
              Feito para <span className="text-primary">resultados reais</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Não é mais um app infantilizado. Este é um treinamento sério de inglês
              para adultos que precisam de resultados.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: "🧠",
                title: "Exercícios Gerados por IA",
                desc: "O Claude gera exercícios personalizados para seu nível e tópico. Sempre novos, sempre relevantes.",
              },
              {
                icon: "📈",
                title: "Nivelamento Adaptativo",
                desc: "15 perguntas que encontram seu nível exato do CEFR. Sem chute, sem perder tempo com conteúdo muito fácil ou muito difícil.",
              },
              {
                icon: "🔥",
                title: "Sequências e Rankings",
                desc: "Sequências diárias, sistema de XP, rankings semanais. O tipo de motivação que realmente funciona.",
              },
              {
                icon: "🎧",
                title: "Compreensão Auditiva",
                desc: "Áudio de qualidade nativa gerado por OpenAI TTS. Treine seu ouvido com inglês do mundo real no seu nível.",
              },
              {
                icon: "🤖",
                title: "Leo — Tutor de IA",
                desc: "Um tutor conversacional que conhece seu nível CEFR. Pratique a qualquer hora, receba correções que realmente ajudam.",
              },
              {
                icon: "📅",
                title: "Aulas ao Vivo",
                desc: "Agende sessões individuais com seu professor via Cal.com. A IA gera, humanos revisam — o melhor dos dois mundos.",
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
              Por que <span className="text-primary">Lexio</span>?
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Não somos o Duolingo para adultos. Não somos um livro chato. Somos
              algo entre os dois.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-4 px-4 font-medium text-muted-foreground">
                    Recurso
                  </th>
                  <th className="text-center py-4 px-4 font-bold text-primary">
                    Lexio
                  </th>
                  <th className="text-center py-4 px-4 font-medium text-muted-foreground">
                    Duolingo
                  </th>
                  <th className="text-center py-4 px-4 font-medium text-muted-foreground">
                    ESL Tradicional
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {[
                  ["Conteúdo alinhado ao CEFR", "✓", "✗", "✓"],
                  ["Exercícios gerados por IA", "✓", "✗", "✗"],
                  ["Tutor conversacional de IA", "✓", "✗", "✗"],
                  ["Supervisão de professores", "✓", "✗", "✓"],
                  ["Inglês profissional/negócios", "✓", "✗", "△"],
                  ["UX focado em adultos", "✓", "✗", "△"],
                  ["Teste de nivelamento adaptativo", "✓", "✓", "△"],
                  ["Sequências e gamificação", "✓", "✓", "✗"],
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
              O que nossos <span className="text-primary">alunos</span> dizem
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                quote:
                  "Finalmente, algo que não parece um jogo de criança. Os exercícios são realmente relevantes para o meu trabalho.",
                name: "Beta Tester",
                role: "Profissional de TI",
              },
              {
                quote:
                  "O tutor de IA é realmente bom. Ele se adapta ao meu nível e não perde meu tempo com coisas que eu já sei.",
                name: "Beta Tester",
                role: "Analista Financeiro",
              },
              {
                quote:
                  "Já testei todos os apps existentes. Lexio é o primeiro onde sinto que estou realmente progredindo.",
                name: "Beta Tester",
                role: "Profissional da Saúde",
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
              Perguntas <span className="text-primary">frequentes</span>
            </h2>
          </div>

          <div className="space-y-4">
            {[
              {
                q: "O que é o CEFR?",
                a: "O Quadro Europeu Comum de Referência para Línguas. É o padrão internacional para descrever a proficiência em idiomas, de A1 (iniciante) a C2 (domínio). Todo nosso conteúdo é calibrado para esses níveis.",
              },
              {
                q: "O teste de nivelamento é realmente grátis?",
                a: "Sim. Faça a qualquer hora, sem precisar de conta. São 15 perguntas adaptativas e leva cerca de 5 minutos. Mostramos seu resultado imediatamente — é nossa forma de deixar você experimentar antes de se comprometer.",
              },
              {
                q: "Como isso é diferente do Duolingo?",
                a: "O Duolingo é feito para todo mundo, o que significa que não é otimizado para ninguém. O Lexio é construído especificamente para adultos brasileiros que precisam de inglês profissional. Nosso conteúdo é gerado por IA, alinhado ao CEFR e inclui um tutor de IA real que se adapta ao seu nível.",
              },
              {
                q: "Posso cancelar minha assinatura a qualquer momento?",
                a: "Sim. Gerencie sua assinatura diretamente pelo portal do cliente da Stripe. Sem taxas ocultas, sem ligações de cancelamento, sem táticas de retenção.",
              },
              {
                q: "Quem cria os exercícios?",
                a: "O Claude (IA da Anthropic) gera exercícios com base no tópico, nível e habilidade. Professores humanos revisam e aprovam cada exercício antes de chegar aos alunos. O melhor dos dois mundos.",
              },
              {
                q: "O que é o Leo?",
                a: "Leo é nosso tutor de inglês com IA, alimentado pelo Claude. Ele conhece seu nível CEFR e adapta seu vocabulário e correções de acordo. Disponível 24/7 para prática de conversação, dúvidas de gramática e ajuda com inglês do mundo real.",
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
              Preço <span className="text-primary">simples</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Comece grátis. Faça upgrade quando estiver pronto.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {/* Free */}
            <div className="bg-card border border-border rounded-xl p-8 space-y-6 text-left">
              <div>
                <h3 className="text-lg font-semibold">Grátis</h3>
                <p className="text-4xl font-bold mt-2">
                  R$0
                  <span className="text-base font-normal text-muted-foreground">
                    /para sempre
                  </span>
                </p>
              </div>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <span className="text-success">✓</span> Teste de Nivelamento CEFR
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-success">✓</span> 3 mensagens com o Tutor IA/dia
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-muted-foreground">✗</span> Biblioteca completa de exercícios
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-muted-foreground">✗</span> Sequências e rankings
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-muted-foreground">✗</span> Acompanhamento de progresso
                </li>
              </ul>
              <Link
                href="/onboarding"
                className="block w-full py-3 bg-secondary text-secondary-foreground font-semibold rounded-xl hover:bg-secondary/80 transition text-center"
              >
                Faça o Teste de Nivelamento
              </Link>
            </div>

            {/* Pro */}
            <div className="bg-card border-2 border-primary/30 rounded-xl p-8 space-y-6 text-left relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-primary text-primary-foreground text-xs font-semibold rounded-full">
                Mais Popular
              </div>
              <div>
                <h3 className="text-lg font-semibold">Pro</h3>
                <p className="text-4xl font-bold mt-2">
                  R$99
                  <span className="text-base font-normal text-muted-foreground">
                    /mês
                  </span>
                </p>
              </div>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <span className="text-success">✓</span> Biblioteca completa de exercícios
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-success">✓</span> Tutor IA ilimitado
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-success">✓</span> Sequências, XP e rankings
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-success">✓</span> Acompanhamento de progresso
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-success">✓</span> Tarefas do professor
                </li>
              </ul>
              <Link
                href="/auth/login"
                className="block w-full py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition text-center neon-glow"
              >
                Comece a Aprender Hoje
              </Link>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Cancele a qualquer momento pelo portal do cliente da Stripe. Sem perguntas.
          </p>
        </div>
      </section>

      {/* ========== CTA ========== */}
      <section className="py-24 px-4">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <h2 className="text-3xl md:text-5xl font-display font-bold">
            Pronto para <span className="text-primary">evoluir</span>?
          </h2>
          <p className="text-lg text-muted-foreground max-w-lg mx-auto">
            Faça o teste de nivelamento grátis. Descubra seu nível. Comece a praticar em
            menos de 5 minutos.
          </p>
          <Link
            href="/onboarding"
            className="inline-block px-10 py-4 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition text-lg neon-glow"
          >
            Comece Grátis
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
                Treinamento de ESL com IA para profissionais brasileiros.
                <br />
                Dos criadores do Liceu Underground.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Produto</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>
                  <Link
                    href="/onboarding"
                    className="hover:text-foreground transition"
                  >
                    Teste de Nivelamento
                  </Link>
                </li>
                <li>
                  <Link
                    href="/auth/login"
                    className="hover:text-foreground transition"
                  >
                    Entrar
                  </Link>
                </li>
                <li>
                  <Link
                    href="/billing"
                    className="hover:text-foreground transition"
                  >
                    Preços
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Legal</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>
                  <Link
                    href="/terms"
                    className="hover:text-foreground transition"
                  >
                    Termos de Uso
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy"
                    className="hover:text-foreground transition"
                  >
                    Política de Privacidade
                  </Link>
                </li>
                <li>
                  <a
                    href="mailto:talles@oliceu.com"
                    className="hover:text-foreground transition"
                  >
                    Contato
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-8 text-center text-xs text-muted-foreground">
            <p>© {new Date().getFullYear()} Lexio Underground — by Liceu Underground. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
