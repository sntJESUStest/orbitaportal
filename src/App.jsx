import { useState, useEffect, useRef, useCallback } from "react";

const PAGES = { home: "Início", features: "Recursos", download: "Download", blog: "Blog", support: "Suporte", about: "Sobre" };

/* ── LOGO SVG ── */
function LogoIcon({ size = 30 }) {
  return (
    <svg width={size} height={size} viewBox="-65 -55 130 110" style={{ display: "block" }}>
      <defs><radialGradient id="sGrad" cx="35%" cy="35%"><stop offset="0%" stopColor="#5aadff"/><stop offset="50%" stopColor="#4e9fff"/><stop offset="100%" stopColor="#1a3a7a"/></radialGradient></defs>
      <ellipse rx="55" ry="20" fill="none" stroke="#1e3a6a" strokeWidth="1.2" transform="rotate(-25)"/>
      <path d="M52,-7 A55,20 25 0,0 -52,7" fill="none" stroke="#1e3a6a" strokeWidth="1.2" transform="rotate(25)"/>
      <circle r="18" fill="url(#sGrad)"/><ellipse rx="12" ry="5" cy="-5" fill="rgba(255,255,255,0.06)"/>
      <path d="M-52,7 A55,20 25 0,0 52,-7" fill="none" stroke="#4e9fff" strokeWidth="2.5" strokeLinecap="round" transform="rotate(25)"/>
      <circle cx="50" cy="-13" r="5" fill="#7c5cfc"/><circle cx="50" cy="-13" r="2" fill="#b8a0ff" opacity="0.6"/>
      <circle cx="-46" cy="16" r="3" fill="#4e9fff" opacity="0.5"/>
    </svg>
  );
}

/* ── SCROLL REVEAL HOOK ── */
function useReveal(threshold = 0.15) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.unobserve(el); } }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}

function Reveal({ children, delay = 0, direction = "up", className = "", style = {} }) {
  const [ref, visible] = useReveal(0.1);
  const dirs = { up: "translateY(40px)", down: "translateY(-40px)", left: "translateX(40px)", right: "translateX(-40px)", none: "translateY(0)" };
  return (
    <div ref={ref} className={className} style={{
      ...style, opacity: visible ? 1 : 0,
      transform: visible ? "translate(0)" : dirs[direction],
      transition: `opacity 0.7s ease ${delay}s, transform 0.7s ease ${delay}s`,
    }}>{children}</div>
  );
}

/* ── STAGGER CHILDREN ── */
function Stagger({ children, baseDelay = 0, increment = 0.1, direction = "up", className = "" }) {
  return (
    <div className={className}>
      {Array.isArray(children) ? children.map((child, i) => (
        <Reveal key={i} delay={baseDelay + i * increment} direction={direction}>{child}</Reveal>
      )) : children}
    </div>
  );
}

/* ── COUNTER ANIMATION ── */
function AnimatedCount({ value, suffix = "", duration = 1500 }) {
  const [ref, visible] = useReveal(0.3);
  const [display, setDisplay] = useState("0");
  useEffect(() => {
    if (!visible) return;
    if (isNaN(parseInt(value))) { setDisplay(value); return; }
    const target = parseInt(value);
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(target * ease).toString());
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [visible, value, duration]);
  return <span ref={ref}>{display}{suffix}</span>;
}

/* ── PARALLAX MOUSE ── */
function useParallax(intensity = 0.02) {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const handle = (e) => {
      const cx = window.innerWidth / 2, cy = window.innerHeight / 2;
      setOffset({ x: (e.clientX - cx) * intensity, y: (e.clientY - cy) * intensity });
    };
    window.addEventListener("mousemove", handle);
    return () => window.removeEventListener("mousemove", handle);
  }, [intensity]);
  return offset;
}

/* ── STARS CANVAS ── */
function Stars() {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext("2d");
    let w = c.width = window.innerWidth, h = c.height = window.innerHeight;
    const stars = Array.from({ length: 120 }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      r: Math.random() * 1.2 + 0.3, o: Math.random(), s: Math.random() * 0.003 + 0.001
    }));
    let raf;
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      stars.forEach(s => { s.o += s.s; const a = Math.abs(Math.sin(s.o));
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(160,190,255,${a * 0.5 + 0.1})`; ctx.fill(); });
      raf = requestAnimationFrame(draw);
    };
    draw();
    const resize = () => { w = c.width = window.innerWidth; h = c.height = window.innerHeight; };
    window.addEventListener("resize", resize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={ref} className="stars" />;
}

/* ── ORBIT SYSTEM ── */
function OrbitSystem() {
  const [time, setTime] = useState(0);
  const parallax = useParallax(0.015);
  useEffect(() => {
    let raf;
    const tick = () => { setTime(t => t + 0.004); raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);
  const items = [
    { emoji: "📄", label: "Documentos", ring: 100, speed: 1, offset: 0 },
    { emoji: "💰", label: "Holerites", ring: 100, speed: 1, offset: 2.1 },
    { emoji: "🔔", label: "Alertas", ring: 100, speed: 1, offset: 4.2 },
    { emoji: "🔒", label: "Segurança", ring: 150, speed: 0.6, offset: 0.5 },
    { emoji: "👁️", label: "Rastreio", ring: 150, speed: 0.6, offset: 2.6 },
    { emoji: "💬", label: "Comunicados", ring: 150, speed: 0.6, offset: 4.7 },
    { emoji: "📊", label: "Painel", ring: 200, speed: 0.35, offset: 1 },
    { emoji: "📱", label: "App", ring: 200, speed: 0.35, offset: 3.5 },
  ];
  return (
    <div className="orbit-system" style={{ transform: `translate(${parallax.x}px, ${parallax.y}px)` }}>
      <div className="orbit-ring orbit-ring-1" /><div className="orbit-ring orbit-ring-2" /><div className="orbit-ring orbit-ring-3" />
      <div className="orbit-center"><LogoIcon size={130} /></div>
      {items.map((it, i) => {
        const angle = time * it.speed + it.offset;
        const x = Math.cos(angle) * it.ring, y = Math.sin(angle) * it.ring;
        return (
          <div key={i} className="orbit-item" style={{ transform: `translate(${x}px, ${y}px)` }}>
            <div className="orbit-item-inner">{it.emoji}</div>
            <span className="oi-label">{it.label}</span>
          </div>
        );
      })}
    </div>
  );
}

/* ── PHONE MOCKUP ── */
function PhoneMockup({ children, active }) {
  return (
    <div className={`phone-frame ${active ? "phone-active" : ""}`}>
      <div className="phone-notch" />
      <div className="phone-screen">{children}</div>
      <div className="phone-bar"><div className="phone-bar-line" /></div>
    </div>
  );
}

function ScreenDocuments() {
  const docs = [
    { icon: "📊", name: "Balancete Agosto/2026", date: "02/09/2026", tag: "Novo" },
    { icon: "📄", name: "DARF IRPJ", date: "28/08/2026", tag: "" },
    { icon: "📄", name: "Guia FGTS", date: "25/08/2026", tag: "" },
    { icon: "📄", name: "DAS Simples Nacional", date: "20/08/2026", tag: "" },
    { icon: "📊", name: "Balancete Julho/2026", date: "01/08/2026", tag: "Lido" },
  ];
  return (
    <>
      <div className="scr-header">
        <span className="scr-greet">Meus Documentos</span>
        <span className="scr-bell">🔔<span className="scr-badge">3</span></span>
      </div>
      <div className="scr-search">🔍 Buscar documento...</div>
      <div className="scr-tabs"><span className="scr-tab active">Todos</span><span className="scr-tab">Fiscal</span><span className="scr-tab">Contábil</span></div>
      {docs.map((d, i) => (
        <div key={i} className="scr-row">
          <span className="scr-row-icon">{d.icon}</span>
          <div className="scr-row-info">
            <span className="scr-row-name">{d.name}</span>
            <span className="scr-row-date">{d.date}</span>
          </div>
          {d.tag && <span className={`scr-row-tag ${d.tag === "Novo" ? "tag-new" : "tag-read"}`}>{d.tag}</span>}
        </div>
      ))}
    </>
  );
}

function ScreenHolerites() {
  const items = [
    { month: "Agosto/2026", value: "R$ 3.450,00", status: "Disponível" },
    { month: "Julho/2026", value: "R$ 3.450,00", status: "Visualizado" },
    { month: "Junho/2026", value: "R$ 3.280,00", status: "Visualizado" },
    { month: "Maio/2026", value: "R$ 3.280,00", status: "Visualizado" },
  ];
  return (
    <>
      <div className="scr-header">
        <span className="scr-greet">Holerites</span>
        <span className="scr-bell">👤</span>
      </div>
      <div className="scr-holerite-card">
        <div className="scr-h-label">Último holerite</div>
        <div className="scr-h-value">R$ 3.450,00</div>
        <div className="scr-h-period">Agosto/2026 • Líquido</div>
        <div className="scr-h-btn">Baixar PDF</div>
      </div>
      <div className="scr-h-title">Histórico</div>
      {items.map((h, i) => (
        <div key={i} className="scr-row">
          <span className="scr-row-icon">💰</span>
          <div className="scr-row-info">
            <span className="scr-row-name">{h.month}</span>
            <span className="scr-row-date">{h.value}</span>
          </div>
          <span className={`scr-row-tag ${h.status === "Disponível" ? "tag-new" : "tag-read"}`}>{h.status}</span>
        </div>
      ))}
    </>
  );
}

function ScreenNotifications() {
  const notifs = [
    { icon: "📄", text: "Novo balancete de Agosto disponível", time: "Há 2 horas", unread: true },
    { icon: "💰", text: "Holerite de Agosto processado", time: "Há 5 horas", unread: true },
    { icon: "⚠️", text: "DARF IRPJ vence em 3 dias", time: "Há 1 dia", unread: true },
    { icon: "📄", text: "Guia FGTS disponível para download", time: "Há 2 dias", unread: false },
    { icon: "💬", text: "Comunicado do escritório", time: "Há 3 dias", unread: false },
  ];
  return (
    <>
      <div className="scr-header">
        <span className="scr-greet">Notificações</span>
        <span className="scr-bell">✓</span>
      </div>
      <div className="scr-notif-count">3 novas notificações</div>
      {notifs.map((n, i) => (
        <div key={i} className={`scr-notif ${n.unread ? "scr-notif-unread" : ""}`}>
          <span className="scr-notif-icon">{n.icon}</span>
          <div className="scr-notif-body">
            <span className="scr-notif-text">{n.text}</span>
            <span className="scr-notif-time">{n.time}</span>
          </div>
          {n.unread && <span className="scr-notif-dot" />}
        </div>
      ))}
    </>
  );
}

function ScreenProfile() {
  return (
    <>
      <div className="scr-header"><span className="scr-greet">Perfil</span><span className="scr-bell">⚙️</span></div>
      <div className="scr-profile-top">
        <div className="scr-avatar">EC</div>
        <div className="scr-profile-name">Empresa Exemplo</div>
        <div className="scr-profile-cnpj">CNPJ: 12.345.678/0001-90</div>
      </div>
      <div className="scr-profile-stats">
        <div className="scr-stat"><div className="scr-stat-n">24</div><div className="scr-stat-l">Documentos</div></div>
        <div className="scr-stat"><div className="scr-stat-n">8</div><div className="scr-stat-l">Holerites</div></div>
        <div className="scr-stat"><div className="scr-stat-n">3</div><div className="scr-stat-l">Pendentes</div></div>
      </div>
      <div className="scr-profile-menu">
        <div className="scr-p-item">👤 Dados da empresa</div>
        <div className="scr-p-item">🔒 Alterar senha</div>
        <div className="scr-p-item">🔔 Preferências de notificação</div>
        <div className="scr-p-item">📧 Email cadastrado</div>
        <div className="scr-p-item scr-p-logout">🚪 Sair</div>
      </div>
    </>
  );
}

function PhoneShowcase() {
  const [active, setActive] = useState(0);
  const screens = [
    { label: "Documentos", comp: <ScreenDocuments /> },
    { label: "Holerites", comp: <ScreenHolerites /> },
    { label: "Notificações", comp: <ScreenNotifications /> },
    { label: "Perfil", comp: <ScreenProfile /> },
  ];
  return (
    <div className="showcase">
      <Reveal delay={0.2}>
        <div className="showcase-tabs">
          {screens.map((s, i) => (
            <button key={i} className={`showcase-tab ${active === i ? "active" : ""}`} onClick={() => setActive(i)}>{s.label}</button>
          ))}
        </div>
      </Reveal>
      <Reveal delay={0.3}>
        <div className="showcase-phone-wrap">
          <PhoneMockup active>{screens[active].comp}</PhoneMockup>
        </div>
      </Reveal>
    </div>
  );
}

/* ── PAGES ── */
function Home({ goTo }) {
  return (
    <>
      <section className="hero">
        <Reveal delay={0.1}><OrbitSystem /></Reveal>
        <Reveal delay={0.3}><div className="hero-tag"><span className="pulse-dot" /> Portal contábil inteligente</div></Reveal>
        <Reveal delay={0.5}><h1>Sua contabilidade em <em>órbita</em></h1></Reveal>
        <Reveal delay={0.65}><p>Acesse documentos, holerites, guias e comunicados da sua empresa direto pelo celular. Tudo organizado, seguro e disponível em tempo real.</p></Reveal>
        <Reveal delay={0.8}><div className="hero-btns">
          <button className="btn-p" onClick={() => goTo("download")}>Baixar o app</button>
          <button className="btn-s" onClick={() => goTo("features")}>Ver recursos</button>
        </div></Reveal>
        <Reveal delay={1}><div className="scroll-hint">
          <div className="scroll-arrow" />
        </div></Reveal>
      </section>

      <div className="trust-bar">
        {[{ n: "24", s: "/7", l: "acesso aos documentos" }, { n: "100", s: "%", l: "digital e seguro" }, { n: "0", s: "", l: "papel necessário" }].map((t, i) => (
          <Reveal key={t.l} delay={i * 0.15} direction="up">
            <div className="trust-item">
              <div className="trust-num"><AnimatedCount value={t.n} />{t.s}</div>
              <div className="trust-label">{t.l}</div>
            </div>
          </Reveal>
        ))}
      </div>

      <section className="sec">
        <Reveal><div className="sec-label">Recursos</div></Reveal>
        <Reveal delay={0.1}><div className="sec-title">Tudo que sua empresa precisa, num só lugar</div></Reveal>
        <Reveal delay={0.2}><div className="sec-desc">O Orbita centraliza a comunicação entre o escritório contábil e sua empresa, eliminando e-mails perdidos e documentos extraviados.</div></Reveal>
        <Stagger className="f-grid" baseDelay={0.1} increment={0.08}>
          {[
            { icon: "📄", title: "Documentos na Nuvem", desc: "Acesse balancetes, DARFs, guias e relatórios a qualquer momento. Tudo organizado por competência." },
            { icon: "💰", title: "Holerites Digitais", desc: "Receba seus holerites automaticamente assim que processados. Sem papel, sem atraso." },
            { icon: "🔔", title: "Notificações em Tempo Real", desc: "Seja avisado quando um novo documento for disponibilizado ou quando houver um prazo importante." },
            { icon: "🔒", title: "Acesso Seguro", desc: "Login com senha pessoal e controle de primeiro acesso. Seus dados protegidos com criptografia." },
            { icon: "👁️", title: "Rastreio de Visualização", desc: "Saiba quando cada documento foi visualizado. Transparência total para sua empresa e o escritório." },
            { icon: "💬", title: "Comunicados Diretos", desc: "Receba avisos e comunicados do escritório sem depender de e-mail ou WhatsApp." },
          ].map(f => (<div key={f.title} className="f-card"><div className="f-icon">{f.icon}</div><h3>{f.title}</h3><p>{f.desc}</p></div>))}
        </Stagger>
      </section>

      <section className="sec" style={{ paddingTop: 40 }}>
        <Reveal><div className="sec-label" style={{ textAlign: "center" }}>Conheça o app</div></Reveal>
        <Reveal delay={0.1}><div className="sec-title" style={{ textAlign: "center", margin: "0 auto" }}>Veja o Orbita em ação</div></Reveal>
        <Reveal delay={0.15}><div className="sec-desc" style={{ textAlign: "center", margin: "14px auto 0" }}>Navegue pelas telas e descubra como é simples acessar seus documentos contábeis.</div></Reveal>
        <PhoneShowcase />
      </section>

      <section className="sec" style={{ paddingTop: 20 }}>
        <Reveal><div className="sec-label">Segurança</div></Reveal>
        <Reveal delay={0.1}><div className="sec-title">Seus dados protegidos</div></Reveal>
        <Stagger className="sec-strip" baseDelay={0.15} increment={0.06}>
          {["Criptografia de ponta", "Autenticação segura", "Hospedagem em nuvem", "Backup automático", "Controle de acesso"].map(s => (
            <div key={s} className="sec-pill">🛡️ {s}</div>
          ))}
        </Stagger>
      </section>

      <Reveal><div className="cta">
        <h2>Comece a usar agora</h2>
        <p>Baixe o Orbita e tenha sua contabilidade sempre acessível.</p>
        <button className="btn-p" onClick={() => goTo("download")}>Baixar gratuitamente</button>
      </div></Reveal>
    </>
  );
}

function Features() {
  return (
    <section className="sec" style={{ paddingTop: 90 }}>
      <Reveal><div className="sec-label">Plataforma</div></Reveal>
      <Reveal delay={0.1}><div className="sec-title">Recursos completos para sua gestão contábil</div></Reveal>
      <Reveal delay={0.15}><div className="sec-desc">Cada funcionalidade foi pensada para simplificar a rotina entre o escritório contábil e seus clientes.</div></Reveal>
      <Stagger className="f-grid" baseDelay={0.05} increment={0.07}>
        {[
          { icon: "📄", title: "Central de Documentos", desc: "Todos os documentos contábeis organizados por mês e categoria. Balancetes, guias, DARFs, certidões — tudo acessível com poucos toques." },
          { icon: "💰", title: "Holerites Automáticos", desc: "Processamento inteligente que separa e distribui os holerites automaticamente para cada colaborador da empresa." },
          { icon: "🔔", title: "Push Notifications", desc: "Alertas instantâneos no celular quando um documento novo é publicado, um prazo se aproxima ou há um comunicado do escritório." },
          { icon: "👤", title: "Primeiro Acesso Guiado", desc: "Fluxo simplificado: o cliente recebe um link, cria sua senha e já começa a usar. Sem burocracia." },
          { icon: "👁️", title: "Controle de Leitura", desc: "O escritório sabe exatamente quais documentos foram visualizados e por quem. Ideal para compliance e prazos críticos." },
          { icon: "📊", title: "Painel Administrativo", desc: "Visão completa para o escritório: log de atividades, gestão de clientes, upload em lote e métricas de engajamento." },
          { icon: "📱", title: "App Responsivo", desc: "Funciona perfeitamente no celular, tablet ou computador. A experiência se adapta ao dispositivo do cliente." },
          { icon: "📧", title: "Notificações por Email", desc: "Além do push, o cliente recebe um email avisando sobre novos documentos. Dois canais para garantir que nada passe." },
          { icon: "🔐", title: "Gestão de Acessos", desc: "Controle granular: quem pode ver o quê, histórico de sessões, bloqueio e desbloqueio de usuários pelo painel admin." },
        ].map(f => (<div key={f.title} className="f-card"><div className="f-icon">{f.icon}</div><h3>{f.title}</h3><p>{f.desc}</p></div>))}
      </Stagger>
    </section>
  );
}

function Download({ goTo }) {
  return (
    <>
      <div className="dl-hero">
        <Reveal><div className="sec-label">Download</div></Reveal>
        <Reveal delay={0.1}><div className="sec-title" style={{ margin: "0 auto", textAlign: "center" }}>Acesse o Orbita no seu dispositivo</div></Reveal>
        <Reveal delay={0.15}><p className="sec-desc" style={{ margin: "14px auto 0", textAlign: "center" }}>Escolha como prefere acessar o portal contábil.</p></Reveal>
      </div>
      <Stagger className="dl-cards" baseDelay={0.1} increment={0.12}>
        {[
          { icon: "🍎", name: "iOS", sub: "iPhone e iPad", btn: "App Store" },
          { icon: "🤖", name: "Android", sub: "Smartphones e tablets", btn: "Google Play" },
          { icon: "🌐", name: "Navegador", sub: "Acesse de qualquer computador", btn: "Acessar agora" },
        ].map(d => (<div key={d.name} className="dl-card"><div className="dl-ico">{d.icon}</div><h3>{d.name}</h3><p>{d.sub}</p><button className="btn-p">{d.btn}</button></div>))}
      </Stagger>
      <section className="sec">
        <Reveal><div className="sec-label">Como começar</div></Reveal>
        <Reveal delay={0.1}><div className="sec-title">Três passos para acessar</div></Reveal>
        <Stagger className="f-grid steps-grid" baseDelay={0.15} increment={0.15}>
          {[
            { icon: "1️⃣", title: "Receba o convite", desc: "Seu escritório contábil envia um link de primeiro acesso para o email cadastrado da sua empresa." },
            { icon: "2️⃣", title: "Crie sua senha", desc: "Acesse o link, defina uma senha pessoal e pronto — seu acesso está ativo." },
            { icon: "3️⃣", title: "Acesse seus documentos", desc: "Baixe o app ou acesse pelo navegador. Todos os documentos da sua empresa estarão lá." },
          ].map(s => (<div key={s.title} className="f-card"><div className="f-icon">{s.icon}</div><h3>{s.title}</h3><p>{s.desc}</p></div>))}
        </Stagger>
      </section>
    </>
  );
}

function Blog() {
  const posts = [
    { emoji: "📄", tag: "Novidade", title: "Orbita: o novo portal de documentos contábeis", excerpt: "Conheça a plataforma que vai transformar a forma como sua empresa recebe e consulta documentos contábeis.", date: "Setembro 2026" },
    { emoji: "💰", tag: "Folha", title: "Holerites digitais: como acessar pelo app", excerpt: "Passo a passo completo para visualizar e baixar os holerites dos colaboradores diretamente no Orbita.", date: "Setembro 2026" },
    { emoji: "🔒", tag: "Segurança", title: "Como protegemos os dados da sua empresa", excerpt: "Entenda as camadas de segurança que garantem que seus documentos contábeis estejam sempre protegidos.", date: "Em breve" },
    { emoji: "📊", tag: "Gestão", title: "5 vantagens do portal contábil para sua empresa", excerpt: "De redução de papel a rastreabilidade total — como o Orbita otimiza a gestão contábil.", date: "Em breve" },
    { emoji: "🔔", tag: "Dica", title: "Ative as notificações e nunca perca um prazo", excerpt: "Veja como configurar push notifications para receber alertas de novos documentos e prazos.", date: "Em breve" },
    { emoji: "📱", tag: "Tutorial", title: "Guia completo do primeiro acesso ao Orbita", excerpt: "Recebeu o convite? Siga este guia para configurar sua conta e começar a usar o portal.", date: "Em breve" },
  ];
  return (
    <section className="sec" style={{ paddingTop: 90 }}>
      <Reveal><div className="sec-label">Blog</div></Reveal>
      <Reveal delay={0.1}><div className="sec-title">Conteúdo e novidades</div></Reveal>
      <Reveal delay={0.15}><div className="sec-desc">Artigos, tutoriais e atualizações sobre o Orbita.</div></Reveal>
      <Stagger className="blog-grid" baseDelay={0.05} increment={0.08}>
        {posts.map(p => (<div key={p.title} className="blog-card"><div className="blog-thumb">{p.emoji}</div><div className="blog-body"><span className="blog-tag">{p.tag}</span><h3>{p.title}</h3><p>{p.excerpt}</p><div className="blog-meta">{p.date}</div></div></div>))}
      </Stagger>
    </section>
  );
}

function Support() {
  const [open, setOpen] = useState(null);
  const faqs = [
    { q: "Como faço meu primeiro acesso?", a: "Você receberá um link por email enviado pelo seu escritório contábil. Basta clicar, criar sua senha pessoal e seu acesso estará ativo." },
    { q: "Esqueci minha senha, o que faço?", a: "Na tela de login, clique em 'Esqueci minha senha'. Um link de redefinição será enviado para o email cadastrado." },
    { q: "O app é gratuito?", a: "Sim. O Orbita é disponibilizado gratuitamente para todos os clientes do escritório contábil como parte do serviço." },
    { q: "Quais documentos posso acessar?", a: "Balancetes, DARFs, guias de impostos, certidões, holerites e comunicados. Todos os documentos enviados pelo escritório ficam disponíveis." },
    { q: "Meus dados estão seguros?", a: "Sim. Utilizamos criptografia, hospedagem em nuvem com backup automático e controle de acesso por senha individual." },
    { q: "Posso acessar pelo computador?", a: "Sim. O Orbita funciona no navegador do computador, tablet e celular. A experiência se adapta ao dispositivo." },
  ];
  return (
    <section className="sec" style={{ paddingTop: 90 }}>
      <Reveal><div className="sec-label">Suporte</div></Reveal>
      <Reveal delay={0.1}><div className="sec-title">Perguntas frequentes</div></Reveal>
      <div className="sup-layout">
        <Reveal delay={0.2}><div>
          {faqs.map((f, i) => (
            <div key={i} className={`faq-item ${open === i ? "faq-open" : ""}`} onClick={() => setOpen(open === i ? null : i)}>
              <div className="faq-q">{f.q}<span className={`faq-arr ${open === i ? "open" : ""}`}>+</span></div>
              <div className="faq-a-wrap" style={{ maxHeight: open === i ? 120 : 0 }}>
                <div className="faq-a">{f.a}</div>
              </div>
            </div>
          ))}
        </div></Reveal>
        <Reveal delay={0.3} direction="right"><div className="contact-box">
          <h3>Precisa de ajuda?</h3><p>Entre em contato com nossa equipe.</p>
          <input className="field" placeholder="Seu nome" /><input className="field" placeholder="Seu email" />
          <textarea className="field" placeholder="Descreva sua dúvida" />
          <button className="btn-p" style={{ width: "100%", marginTop: 4 }}>Enviar</button>
        </div></Reveal>
      </div>
    </section>
  );
}

function About() {
  return (
    <>
      <div className="about-hero">
        <Reveal><div className="sec-label">Sobre</div></Reveal>
        <Reveal delay={0.1}><div className="sec-title" style={{ margin: "0 auto" }}>Sobre o Orbita</div></Reveal>
        <Reveal delay={0.15}><p className="sec-desc" style={{ margin: "14px auto 0", textAlign: "center" }}>O portal contábil que conecta escritórios e empresas de forma digital, segura e sem burocracia.</p></Reveal>
      </div>
      <section className="sec" style={{ paddingTop: 20 }}>
        <Reveal><div className="sec-label">Nossos princípios</div></Reveal>
        <Stagger className="vals-grid" baseDelay={0.1} increment={0.1}>
          {[
            { title: "Simplicidade", desc: "Documentos contábeis acessíveis com poucos toques, sem complexidade desnecessária." },
            { title: "Segurança", desc: "Criptografia, controle de acesso e backup automático protegem cada arquivo." },
            { title: "Transparência", desc: "Rastreio de visualização e logs completos para total visibilidade entre as partes." },
            { title: "Agilidade", desc: "Documentos disponíveis em tempo real, notificações instantâneas e zero papel." },
          ].map(v => (<div key={v.title} className="val-card"><h3>{v.title}</h3><p>{v.desc}</p></div>))}
        </Stagger>
        <Reveal delay={0.2}><div style={{ marginTop: 64 }}>
          <div className="sec-label">Nossa missão</div>
          <div className="sec-title">Tecnologia a serviço da contabilidade</div>
          <p className="sec-desc" style={{ marginTop: 16 }}>O Orbita nasceu da necessidade de modernizar a entrega de documentos contábeis. Empresas precisavam de acesso rápido, seguro e organizado — sem depender de emails ou pastas físicas. Criamos uma plataforma que atende à realidade do dia a dia entre escritórios contábeis e seus clientes.</p>
        </div></Reveal>
      </section>
    </>
  );
}

/* ── MAIN ── */
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&family=Inter:wght@300;400;450;500;600;700&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  :root {
    --bg: #050810; --bg-card: rgba(80,140,255,0.04); --bg-card-hover: rgba(80,140,255,0.08);
    --border: rgba(80,140,255,0.08); --border-hover: rgba(80,140,255,0.18);
    --accent: #4e9fff; --accent2: #7c5cfc; --text: #d8e0f0; --text-sub: #607088; --text-muted: #3a4760;
    --gradient: linear-gradient(135deg, #4e9fff, #7c5cfc);
    --gradient-bg: linear-gradient(135deg, rgba(78,159,255,0.05), rgba(124,92,252,0.03));
    --r: 12px; --font-h: 'Space Grotesk', sans-serif; --font-b: 'Inter', sans-serif;
  }
  body { background: var(--bg); color: var(--text); font-family: var(--font-b); }
  .wrap { min-height: 100vh; background: var(--bg); overflow-x: hidden; }
  .stars { position: fixed; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 0; }

  /* NAV */
  nav { position: sticky; top: 0; z-index: 100; display: flex; align-items: center; justify-content: space-between;
    padding: 0 40px; height: 60px; background: rgba(5,8,16,0.8); backdrop-filter: blur(24px);
    border-bottom: 1px solid var(--border); animation: navSlide 0.6s ease; }
  @keyframes navSlide { from { transform: translateY(-100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
  .logo { font-family: var(--font-h); font-weight: 700; font-size: 20px; color: var(--accent); cursor: pointer;
    display: flex; align-items: center; gap: 8px; transition: transform 0.3s; }
  .logo:hover { transform: scale(1.03); }
  .logo-icon { display: flex; align-items: center; }
  .nav-links { display: flex; gap: 4px; }
  .nl { padding: 7px 14px; border-radius: 7px; font-size: 13px; font-weight: 450; color: var(--text-sub);
    cursor: pointer; border: none; background: none; font-family: var(--font-b); transition: all 0.3s; position: relative; }
  .nl:hover { color: var(--text); background: var(--bg-card); }
  .nl.active { color: var(--accent); background: var(--bg-card); }
  .nl::after { content: ''; position: absolute; bottom: 2px; left: 50%; width: 0; height: 2px;
    background: var(--gradient); transition: all 0.3s; transform: translateX(-50%); border-radius: 1px; }
  .nl.active::after { width: 60%; }
  .nav-cta { padding: 8px 20px; border-radius: 7px; font-size: 13px; font-weight: 600;
    background: var(--gradient); color: #fff; border: none; cursor: pointer; font-family: var(--font-b);
    transition: all 0.3s; }
  .nav-cta:hover { transform: translateY(-2px); box-shadow: 0 6px 24px rgba(78,159,255,0.3); }

  /* HERO */
  .hero { position: relative; padding: 60px 40px 80px; display: flex; flex-direction: column; align-items: center;
    text-align: center; min-height: 90vh; justify-content: center; }
  .orbit-system { position: relative; width: 420px; height: 420px; margin-bottom: 48px; transition: transform 0.1s ease-out; }
  .orbit-center { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
    width: 140px; height: 140px; display: flex; align-items: center; justify-content: center; z-index: 5;
    filter: drop-shadow(0 0 40px rgba(78,159,255,0.3)) drop-shadow(0 0 80px rgba(78,159,255,0.1));
    animation: centerGlow 4s ease-in-out infinite; }
  @keyframes centerGlow {
    0%, 100% { filter: drop-shadow(0 0 40px rgba(78,159,255,0.3)) drop-shadow(0 0 80px rgba(78,159,255,0.1)); }
    50% { filter: drop-shadow(0 0 60px rgba(78,159,255,0.45)) drop-shadow(0 0 100px rgba(78,159,255,0.15)); } }
  .orbit-ring { position: absolute; top: 50%; left: 50%; border-radius: 50%; border: 1px solid rgba(78,159,255,0.08); }
  .orbit-ring-1 { width: 200px; height: 200px; margin: -100px 0 0 -100px; border-color: rgba(78,159,255,0.1); }
  .orbit-ring-2 { width: 300px; height: 300px; margin: -150px 0 0 -150px; border-color: rgba(78,159,255,0.07); }
  .orbit-ring-3 { width: 400px; height: 400px; margin: -200px 0 0 -200px; border-color: rgba(78,159,255,0.04); }
  .orbit-item { position: absolute; top: 50%; left: 50%; width: 44px; height: 44px; margin: -22px 0 0 -22px; z-index: 4; cursor: default; }
  .orbit-item-inner { width: 100%; height: 100%; border-radius: 50%; background: rgba(78,159,255,0.08);
    border: 1px solid rgba(78,159,255,0.15); backdrop-filter: blur(4px);
    display: flex; align-items: center; justify-content: center; font-size: 18px; transition: all 0.3s; }
  .orbit-item:hover .orbit-item-inner { transform: scale(1.3); background: rgba(78,159,255,0.15);
    border-color: rgba(78,159,255,0.4); box-shadow: 0 0 20px rgba(78,159,255,0.3); }
  .orbit-item .oi-label { position: absolute; bottom: -24px; left: 50%; transform: translateX(-50%);
    font-size: 10px; color: var(--text-sub); white-space: nowrap; font-family: var(--font-b); font-weight: 500;
    opacity: 0; transition: opacity 0.3s; pointer-events: none; }
  .orbit-item:hover .oi-label { opacity: 1; }

  .hero-tag { display: inline-flex; align-items: center; gap: 8px; padding: 5px 16px; border-radius: 50px;
    background: var(--bg-card); border: 1px solid var(--border); font-size: 12px; color: var(--text-sub); margin-bottom: 24px; }
  .pulse-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--accent); position: relative; }
  .pulse-dot::after { content: ''; position: absolute; inset: -3px; border-radius: 50%; border: 1px solid var(--accent);
    animation: dotPulse 2s ease-out infinite; }
  @keyframes dotPulse { 0% { transform: scale(1); opacity: 0.6; } 100% { transform: scale(2.5); opacity: 0; } }
  .hero h1 { font-family: var(--font-h); font-size: clamp(34px, 5vw, 60px); font-weight: 800; line-height: 1.08;
    max-width: 660px; letter-spacing: -1.5px; }
  .hero h1 em { font-style: normal; background: var(--gradient); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
  .hero > div > p, .hero p { margin-top: 20px; font-size: 16px; line-height: 1.6; color: var(--text-sub); max-width: 440px; }
  .hero-btns { display: flex; gap: 12px; margin-top: 32px; flex-wrap: wrap; justify-content: center; }

  /* SCROLL HINT */
  .scroll-hint { margin-top: 48px; display: flex; justify-content: center; }
  .scroll-arrow { width: 24px; height: 24px; border-right: 2px solid var(--text-muted); border-bottom: 2px solid var(--text-muted);
    transform: rotate(45deg); animation: scrollBounce 2s ease-in-out infinite; opacity: 0.5; }
  @keyframes scrollBounce { 0%, 100% { transform: rotate(45deg) translate(0); } 50% { transform: rotate(45deg) translate(5px, 5px); } }

  /* BTNS */
  .btn-p { padding: 13px 30px; border-radius: 9px; font-size: 14px; font-weight: 600;
    background: var(--gradient); color: #fff; border: none; cursor: pointer; font-family: var(--font-b);
    transition: all 0.3s; position: relative; overflow: hidden; }
  .btn-p::before { content: ''; position: absolute; inset: 0; background: linear-gradient(rgba(255,255,255,0),rgba(255,255,255,0.1));
    opacity: 0; transition: opacity 0.3s; }
  .btn-p:hover::before { opacity: 1; }
  .btn-p:hover { transform: translateY(-2px); box-shadow: 0 6px 30px rgba(78,159,255,0.35); }
  .btn-p:active { transform: translateY(0); }
  .btn-s { padding: 13px 30px; border-radius: 9px; font-size: 14px; font-weight: 500;
    background: var(--bg-card); color: var(--text); border: 1px solid var(--border); cursor: pointer;
    font-family: var(--font-b); transition: all 0.3s; }
  .btn-s:hover { border-color: var(--border-hover); background: var(--bg-card-hover); transform: translateY(-2px); }

  /* SECTIONS */
  .sec { padding: 90px 40px; max-width: 1060px; margin: 0 auto; position: relative; z-index: 1; }
  .sec-label { font-size: 11.5px; font-weight: 600; text-transform: uppercase; color: var(--accent); margin-bottom: 10px;
    font-family: var(--font-h); letter-spacing: 1.5px; }
  .sec-title { font-family: var(--font-h); font-size: clamp(26px, 3.5vw, 38px); font-weight: 700;
    letter-spacing: -0.5px; line-height: 1.15; max-width: 520px; }
  .sec-desc { margin-top: 14px; font-size: 15px; line-height: 1.6; color: var(--text-sub); max-width: 480px; }

  /* TRUST */
  .trust-bar { display: flex; justify-content: center; gap: 48px; padding: 0 40px 60px; flex-wrap: wrap;
    position: relative; z-index: 1; }
  .trust-item { text-align: center; }
  .trust-num { font-family: var(--font-h); font-size: 32px; font-weight: 700;
    background: var(--gradient); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
  .trust-label { font-size: 13px; color: var(--text-sub); margin-top: 4px; }

  /* FEATURE CARDS */
  .f-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 14px; margin-top: 48px; }
  .steps-grid { grid-template-columns: repeat(3, 1fr); }
  .f-card { padding: 30px; border-radius: var(--r); background: var(--bg-card); border: 1px solid var(--border);
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); position: relative; overflow: hidden; }
  .f-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
    background: var(--gradient); transform: scaleX(0); transform-origin: left; transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1); }
  .f-card:hover::before { transform: scaleX(1); }
  .f-card:hover { border-color: var(--border-hover); background: var(--bg-card-hover); transform: translateY(-6px);
    box-shadow: 0 12px 40px rgba(78,159,255,0.06); }
  .f-icon { width: 42px; height: 42px; border-radius: 10px; display: flex; align-items: center; justify-content: center;
    font-size: 19px; margin-bottom: 18px; background: rgba(78,159,255,0.07); border: 1px solid var(--border);
    transition: transform 0.3s; }
  .f-card:hover .f-icon { transform: scale(1.1) rotate(-3deg); }
  .f-card h3 { font-family: var(--font-h); font-size: 16px; font-weight: 600; margin-bottom: 8px; }
  .f-card p { font-size: 13.5px; line-height: 1.55; color: var(--text-sub); }

  /* SECURITY */
  .sec-strip { display: flex; gap: 10px; margin-top: 48px; flex-wrap: wrap; }
  .sec-pill { display: flex; align-items: center; gap: 8px; padding: 10px 20px; border-radius: 50px;
    background: var(--bg-card); border: 1px solid var(--border); font-size: 13px; color: var(--text);
    transition: all 0.3s; cursor: default; }
  .sec-pill:hover { border-color: var(--border-hover); background: var(--bg-card-hover); transform: translateY(-3px);
    box-shadow: 0 6px 20px rgba(78,159,255,0.06); }

  /* DOWNLOAD */
  .dl-hero { text-align: center; padding: 90px 40px 50px; position: relative; z-index: 1; }
  .dl-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 14px;
    max-width: 840px; margin: 40px auto 0; padding: 0 40px; position: relative; z-index: 1; }
  .dl-card { padding: 32px 24px; border-radius: var(--r); background: var(--bg-card); border: 1px solid var(--border);
    text-align: center; transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); }
  .dl-card:hover { border-color: var(--border-hover); transform: translateY(-6px); box-shadow: 0 12px 40px rgba(78,159,255,0.08); }
  .dl-card .dl-ico { font-size: 36px; margin-bottom: 14px; transition: transform 0.4s; }
  .dl-card:hover .dl-ico { transform: scale(1.15) rotate(-5deg); }
  .dl-card h3 { font-family: var(--font-h); font-size: 17px; font-weight: 600; margin-bottom: 6px; }
  .dl-card p { font-size: 12.5px; color: var(--text-sub); margin-bottom: 18px; }
  .dl-card .btn-p { width: 100%; padding: 11px; font-size: 13px; }

  /* BLOG */
  .blog-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(290px, 1fr)); gap: 16px; margin-top: 44px; }
  .blog-card { border-radius: var(--r); overflow: hidden; background: var(--bg-card); border: 1px solid var(--border);
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); cursor: pointer; }
  .blog-card:hover { border-color: var(--border-hover); transform: translateY(-6px); box-shadow: 0 12px 40px rgba(78,159,255,0.06); }
  .blog-thumb { height: 160px; display: flex; align-items: center; justify-content: center;
    background: var(--gradient-bg); font-size: 36px; transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1); }
  .blog-card:hover .blog-thumb { transform: scale(1.08); }
  .blog-body { padding: 22px; }
  .blog-tag { display: inline-block; padding: 3px 9px; border-radius: 4px; font-size: 10.5px; font-weight: 600;
    background: rgba(78,159,255,0.1); color: var(--accent); margin-bottom: 10px; }
  .blog-card h3 { font-family: var(--font-h); font-size: 15px; font-weight: 600; line-height: 1.35; margin-bottom: 7px; }
  .blog-card p { font-size: 13px; color: var(--text-sub); line-height: 1.5; }
  .blog-meta { margin-top: 14px; font-size: 11.5px; color: var(--text-muted); }

  /* SUPPORT */
  .sup-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 44px; margin-top: 48px; }
  .faq-item { padding: 18px 0; border-bottom: 1px solid var(--border); cursor: pointer; transition: all 0.3s; }
  .faq-item:hover { padding-left: 8px; }
  .faq-open { border-color: var(--border-hover); }
  .faq-q { display: flex; justify-content: space-between; align-items: center; font-size: 14px; font-weight: 500; }
  .faq-arr { font-size: 16px; color: var(--text-muted); transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); }
  .faq-arr.open { transform: rotate(45deg); color: var(--accent); }
  .faq-a-wrap { overflow: hidden; transition: max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1); }
  .faq-a { padding-top: 10px; font-size: 13.5px; line-height: 1.6; color: var(--text-sub); }
  .contact-box { padding: 32px; border-radius: var(--r); background: var(--bg-card); border: 1px solid var(--border); height: fit-content; }
  .contact-box h3 { font-family: var(--font-h); font-size: 18px; font-weight: 600; margin-bottom: 6px; }
  .contact-box > p { font-size: 13.5px; color: var(--text-sub); margin-bottom: 20px; line-height: 1.5; }
  .field { width: 100%; padding: 11px 14px; border-radius: 7px; background: var(--bg); border: 1px solid var(--border);
    color: var(--text); font-size: 13.5px; font-family: var(--font-b); margin-bottom: 10px; outline: none;
    transition: all 0.3s; }
  .field:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(78,159,255,0.1); transform: translateY(-1px); }
  .field::placeholder { color: var(--text-muted); }
  textarea.field { min-height: 90px; resize: vertical; }

  /* ABOUT */
  .about-hero { text-align: center; padding: 90px 40px 30px; position: relative; z-index: 1; }
  .vals-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 14px; margin-top: 44px; }
  .val-card { padding: 26px; border-radius: var(--r); background: var(--bg-card); border: 1px solid var(--border);
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); position: relative; overflow: hidden; }
  .val-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
    background: var(--gradient); transform: scaleX(0); transform-origin: left; transition: transform 0.5s; }
  .val-card:hover::before { transform: scaleX(1); }
  .val-card:hover { border-color: var(--border-hover); transform: translateY(-4px); box-shadow: 0 10px 30px rgba(78,159,255,0.06); }
  .val-card h3 { font-family: var(--font-h); font-size: 15px; font-weight: 600; margin-bottom: 8px; }
  .val-card p { font-size: 13px; color: var(--text-sub); line-height: 1.55; }

  /* CTA */
  .cta { margin: 20px 40px 70px; padding: 56px 44px; border-radius: 18px; text-align: center; position: relative;
    overflow: hidden; z-index: 1; background: var(--gradient-bg); border: 1px solid var(--border); }
  .cta h2 { font-family: var(--font-h); font-size: clamp(22px, 3vw, 32px); font-weight: 700; position: relative; }
  .cta p { margin-top: 12px; font-size: 14px; color: var(--text-sub); position: relative; }
  .cta .btn-p { margin-top: 24px; position: relative; }

  /* FOOTER */
  footer { border-top: 1px solid var(--border); padding: 48px 40px 28px; position: relative; z-index: 1; }
  .ft-grid { max-width: 1060px; margin: 0 auto; display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 36px; }
  .ft-brand p { font-size: 13px; color: var(--text-sub); line-height: 1.55; margin-top: 10px; max-width: 260px; }
  .ft-col h4 { font-size: 11px; font-weight: 600; color: var(--text-muted); margin-bottom: 14px; letter-spacing: 1px; font-family: var(--font-h); }
  .ft-col a { display: block; font-size: 13px; color: var(--text-sub); text-decoration: none; padding: 3px 0;
    cursor: pointer; transition: all 0.3s; }
  .ft-col a:hover { color: var(--text); padding-left: 4px; }
  .ft-bottom { max-width: 1060px; margin: 36px auto 0; padding-top: 20px; border-top: 1px solid var(--border);
    display: flex; justify-content: space-between; font-size: 12px; color: var(--text-muted); flex-wrap: wrap; gap: 8px; }

  /* PHONE MOCKUP */
  .showcase { margin-top: 48px; display: flex; flex-direction: column; align-items: center; }
  .showcase-tabs { display: flex; gap: 6px; margin-bottom: 32px; background: var(--bg-card); border: 1px solid var(--border);
    border-radius: 10px; padding: 4px; }
  .showcase-tab { padding: 8px 18px; border-radius: 7px; border: none; background: none; color: var(--text-sub);
    font-size: 13px; font-weight: 500; font-family: var(--font-b); cursor: pointer; transition: all 0.3s; }
  .showcase-tab.active { background: var(--gradient); color: #fff; }
  .showcase-tab:hover:not(.active) { color: var(--text); }
  .showcase-phone-wrap { display: flex; justify-content: center; }

  .phone-frame { width: 280px; border-radius: 32px; background: #0c1020; border: 2px solid rgba(78,159,255,0.12);
    padding: 12px; position: relative; box-shadow: 0 20px 60px rgba(0,0,0,0.5), 0 0 40px rgba(78,159,255,0.05);
    transition: all 0.5s cubic-bezier(0.4,0,0.2,1); }
  .phone-active { border-color: rgba(78,159,255,0.2); box-shadow: 0 20px 60px rgba(0,0,0,0.5), 0 0 60px rgba(78,159,255,0.08); }
  .phone-notch { width: 80px; height: 6px; background: #0c1020; border-radius: 0 0 10px 10px; margin: 0 auto 8px;
    border: 1px solid rgba(78,159,255,0.08); border-top: none; }
  .phone-screen { background: #080c18; border-radius: 20px; min-height: 480px; padding: 16px; overflow: hidden; }
  .phone-bar { display: flex; justify-content: center; padding: 8px 0 4px; }
  .phone-bar-line { width: 100px; height: 4px; border-radius: 2px; background: rgba(78,159,255,0.15); }

  /* SCREEN SHARED */
  .scr-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
  .scr-greet { font-family: var(--font-h); font-size: 16px; font-weight: 700; color: var(--text); }
  .scr-bell { font-size: 16px; position: relative; }
  .scr-badge { position: absolute; top: -6px; right: -8px; background: #ef4444; color: #fff; font-size: 9px;
    font-weight: 700; width: 15px; height: 15px; border-radius: 50%; display: flex; align-items: center;
    justify-content: center; font-family: var(--font-b); }
  .scr-search { padding: 8px 12px; border-radius: 8px; background: rgba(78,159,255,0.06); border: 1px solid var(--border);
    font-size: 11.5px; color: var(--text-muted); margin-bottom: 12px; }
  .scr-tabs { display: flex; gap: 4px; margin-bottom: 14px; }
  .scr-tab { padding: 5px 12px; border-radius: 6px; font-size: 11px; font-weight: 500; color: var(--text-sub);
    background: rgba(78,159,255,0.04); font-family: var(--font-b); }
  .scr-tab.active { background: var(--gradient); color: #fff; }

  /* ROW */
  .scr-row { display: flex; align-items: center; gap: 10px; padding: 10px 0; border-bottom: 1px solid rgba(78,159,255,0.05); }
  .scr-row-icon { font-size: 16px; }
  .scr-row-info { flex: 1; display: flex; flex-direction: column; }
  .scr-row-name { font-size: 12px; font-weight: 500; color: var(--text); }
  .scr-row-date { font-size: 10px; color: var(--text-muted); margin-top: 2px; }
  .scr-row-tag { font-size: 9px; font-weight: 600; padding: 2px 7px; border-radius: 4px; font-family: var(--font-b); }
  .tag-new { background: rgba(78,159,255,0.15); color: var(--accent); }
  .tag-read { background: rgba(255,255,255,0.05); color: var(--text-muted); }

  /* HOLERITE */
  .scr-holerite-card { background: var(--gradient); border-radius: 14px; padding: 18px; margin-bottom: 16px; }
  .scr-h-label { font-size: 10px; color: rgba(255,255,255,0.7); margin-bottom: 4px; }
  .scr-h-value { font-family: var(--font-h); font-size: 26px; font-weight: 700; color: #fff; }
  .scr-h-period { font-size: 10px; color: rgba(255,255,255,0.6); margin-top: 2px; }
  .scr-h-btn { margin-top: 12px; background: rgba(255,255,255,0.15); border-radius: 8px; padding: 7px;
    text-align: center; font-size: 11px; font-weight: 600; color: #fff; }
  .scr-h-title { font-size: 13px; font-weight: 600; color: var(--text); margin-bottom: 8px; font-family: var(--font-h); }

  /* NOTIFICATIONS */
  .scr-notif-count { font-size: 11px; color: var(--accent); margin-bottom: 12px; font-weight: 500; }
  .scr-notif { display: flex; align-items: flex-start; gap: 10px; padding: 10px 0; border-bottom: 1px solid rgba(78,159,255,0.05); }
  .scr-notif-unread { background: rgba(78,159,255,0.03); margin: 0 -16px; padding: 10px 16px; }
  .scr-notif-icon { font-size: 16px; margin-top: 2px; }
  .scr-notif-body { flex: 1; }
  .scr-notif-text { font-size: 11.5px; color: var(--text); line-height: 1.4; display: block; }
  .scr-notif-time { font-size: 9.5px; color: var(--text-muted); margin-top: 3px; display: block; }
  .scr-notif-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--accent); margin-top: 6px; flex-shrink: 0; }

  /* PROFILE */
  .scr-profile-top { text-align: center; margin-bottom: 16px; }
  .scr-avatar { width: 56px; height: 56px; border-radius: 50%; background: var(--gradient); display: flex;
    align-items: center; justify-content: center; font-size: 18px; font-weight: 700; color: #fff;
    margin: 0 auto 10px; font-family: var(--font-h); }
  .scr-profile-name { font-family: var(--font-h); font-size: 15px; font-weight: 700; color: var(--text); }
  .scr-profile-cnpj { font-size: 10px; color: var(--text-muted); margin-top: 2px; }
  .scr-profile-stats { display: flex; justify-content: center; gap: 20px; margin-bottom: 18px;
    padding: 12px; background: rgba(78,159,255,0.04); border-radius: 10px; border: 1px solid var(--border); }
  .scr-stat { text-align: center; }
  .scr-stat-n { font-family: var(--font-h); font-size: 18px; font-weight: 700; color: var(--accent); }
  .scr-stat-l { font-size: 9px; color: var(--text-muted); margin-top: 2px; }
  .scr-profile-menu { display: flex; flex-direction: column; gap: 2px; }
  .scr-p-item { padding: 10px 0; font-size: 12px; color: var(--text-sub); border-bottom: 1px solid rgba(78,159,255,0.05); }
  .scr-p-logout { color: #ef4444; border: none; }

  @media (max-width: 768px) {
    nav { padding: 0 20px; } .nav-links { display: none; }
    .hero { padding-left: 20px; padding-right: 20px; }
    .orbit-system { width: 300px; height: 300px; }
    .orbit-ring-1 { width: 150px; height: 150px; margin: -75px 0 0 -75px; }
    .orbit-ring-2 { width: 220px; height: 220px; margin: -110px 0 0 -110px; }
    .orbit-ring-3 { width: 290px; height: 290px; margin: -145px 0 0 -145px; }
    .orbit-center { width: 100px; height: 100px; }
    .sec, .dl-hero, .about-hero { padding-left: 20px; padding-right: 20px; }
    .trust-bar { gap: 28px; } .sup-layout { grid-template-columns: 1fr; }
    .ft-grid { grid-template-columns: 1fr 1fr; } .dl-cards { padding: 0 20px; }
    .cta { margin-left: 20px; margin-right: 20px; } .steps-grid { grid-template-columns: 1fr; }
  }
`;

export default function OrbitaSite() {
  const [page, setPage] = useState("home");
  const goTo = (p) => { setPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const Page = () => {
    switch (page) {
      case "home": return <Home goTo={goTo} />;
      case "features": return <Features />;
      case "download": return <Download goTo={goTo} />;
      case "blog": return <Blog />;
      case "support": return <Support />;
      case "about": return <About />;
      default: return <Home goTo={goTo} />;
    }
  };
  return (
    <>
      <style>{css}</style>
      <div className="wrap">
        <Stars />
        <nav>
          <div className="logo" onClick={() => goTo("home")}><span className="logo-icon"><LogoIcon size={28} /></span> orbita</div>
          <div className="nav-links">
            {Object.entries(PAGES).map(([k, v]) => (<button key={k} className={`nl ${page === k ? "active" : ""}`} onClick={() => goTo(k)}>{v}</button>))}
          </div>
          <button className="nav-cta" onClick={() => goTo("download")}>Baixar app</button>
        </nav>
        <Page />
        <footer>
          <Reveal><div className="ft-grid">
            <div className="ft-brand"><div className="logo" style={{ cursor: "default" }}><span className="logo-icon"><LogoIcon size={28} /></span> orbita</div><p>O portal contábil inteligente. Documentos, holerites e comunicados — tudo num só lugar.</p></div>
            <div className="ft-col"><h4>Produto</h4><a onClick={() => goTo("features")}>Recursos</a><a onClick={() => goTo("download")}>Download</a><a onClick={() => goTo("blog")}>Blog</a></div>
            <div className="ft-col"><h4>Empresa</h4><a onClick={() => goTo("about")}>Sobre</a><a>Carreiras</a><a>Contato</a></div>
            <div className="ft-col"><h4>Legal</h4><a onClick={() => goTo("support")}>Suporte</a><a>Privacidade</a><a>Termos de Uso</a></div>
          </div></Reveal>
          <div className="ft-bottom"><span>© 2026 Orbita. Todos os direitos reservados.</span><span>Feito para escritórios contábeis</span></div>
        </footer>
      </div>
    </>
  );
}
