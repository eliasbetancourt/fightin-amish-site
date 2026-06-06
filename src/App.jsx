import { useState, useEffect, useRef } from "react";

// Returns the current window width and updates on resize (debounced).
function useWindowWidth() {
  const [width, setWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1200
  );

  useEffect(() => {
    let timeout;
    const handleResize = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => setWidth(window.innerWidth), 150);
    };
    window.addEventListener("resize", handleResize);
    return () => {
      clearTimeout(timeout);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return width;
}

const COLORS = {
  gold: "#C5A55A",
  goldLight: "#D4BC7C",
  goldPale: "#F5EDD5",
  goldDark: "#8B7338",
  black: "#1A1A1A",
  blackSoft: "#2A2A2A",
  cream: "#FAF6EC",
  creamDark: "#EDE5D0",
  white: "#FFFFFF",
  brown: "#6B4E2E",
  brownLight: "#8B6E3E",
};

function AnimatedCounter({ target, duration = 2000, prefix = "$", suffix = "" }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const start = Date.now();
          const tick = () => {
            const elapsed = Date.now() - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.round(target * eased));
            if (progress < 1) requestAnimationFrame(tick);
          };
          tick();
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);

  return (
    <span ref={ref}>
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  );
}

function ProgressBar({ current, goal }) {
  const pct = Math.min((current / goal) * 100, 100);
  return (
    <div style={{ width: "100%", background: "rgba(197,165,90,0.15)", borderRadius: 12, height: 28, overflow: "hidden", position: "relative" }}>
      <div
        style={{
          width: `${pct}%`,
          height: "100%",
          background: `linear-gradient(90deg, ${COLORS.gold}, ${COLORS.goldLight})`,
          borderRadius: 12,
          transition: "width 1.5s cubic-bezier(0.4,0,0.2,1)",
          position: "relative",
        }}
      >
        <div style={{
          position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
          fontSize: 13, fontWeight: 700, color: COLORS.black, letterSpacing: "0.02em",
        }}>
          {Math.round(pct)}%
        </div>
      </div>
    </div>
  );
}

const NAV_ITEMS = ["About", "Fundraising", "Sponsors", "Kits", "Contact"];

function Navbar({ activeSection }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const width = useWindowWidth();
  const isMobile = width < 481;
  // Derived: the overlay is only ever open on mobile.
  const overlayOpen = menuOpen && isMobile;

  // Lock body scroll while the overlay is open.
  useEffect(() => {
    document.body.style.overflow = overlayOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [overlayOpen]);

  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000,
      background: "rgba(26,26,26,0.95)", backdropFilter: "blur(12px)",
      borderBottom: `1px solid rgba(197,165,90,0.25)`,
      padding: isMobile ? "0 16px" : "0 24px",
    }}>
      <div style={{
        maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center",
        justifyContent: "space-between", height: 64,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: "50%", background: COLORS.gold,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 800, fontSize: 16, color: COLORS.black, fontFamily: "'Playfair Display', Georgia, serif",
            flexShrink: 0,
          }}>FA</div>
          <span style={{ color: COLORS.gold, fontWeight: 700, fontSize: isMobile ? 14 : 16, letterSpacing: "0.04em", fontFamily: "'Playfair Display', Georgia, serif", whiteSpace: "nowrap" }}>
            THE FIGHTIN' AMISH
          </span>
        </div>

        {isMobile ? (
          <button
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((o) => !o)}
            style={{
              background: "transparent", border: "none", cursor: "pointer",
              width: 44, height: 44, display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center", gap: 5, padding: 0,
              zIndex: 1002, position: "relative",
            }}
          >
            <span style={{
              display: "block", width: 24, height: 2, background: COLORS.gold, borderRadius: 2,
              transition: "transform 0.25s, opacity 0.25s",
              transform: menuOpen ? "translateY(7px) rotate(45deg)" : "none",
            }} />
            <span style={{
              display: "block", width: 24, height: 2, background: COLORS.gold, borderRadius: 2,
              transition: "opacity 0.25s",
              opacity: menuOpen ? 0 : 1,
            }} />
            <span style={{
              display: "block", width: 24, height: 2, background: COLORS.gold, borderRadius: 2,
              transition: "transform 0.25s, opacity 0.25s",
              transform: menuOpen ? "translateY(-7px) rotate(-45deg)" : "none",
            }} />
          </button>
        ) : (
          <div style={{ display: "flex", gap: 28, alignItems: "center" }}>
            {NAV_ITEMS.map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                style={{
                  color: activeSection === item.toLowerCase() ? COLORS.gold : "rgba(255,255,255,0.7)",
                  textDecoration: "none", fontSize: 13, fontWeight: 600,
                  letterSpacing: "0.06em", textTransform: "uppercase",
                  transition: "color 0.2s",
                  borderBottom: activeSection === item.toLowerCase() ? `2px solid ${COLORS.gold}` : "2px solid transparent",
                  paddingBottom: 2,
                }}
              >
                {item}
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Full-screen mobile overlay */}
      {isMobile && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(26,26,26,0.98)", backdropFilter: "blur(12px)",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", gap: 8,
          zIndex: 1001,
          opacity: overlayOpen ? 1 : 0,
          pointerEvents: overlayOpen ? "auto" : "none",
          transition: "opacity 0.25s ease",
        }}>
          {NAV_ITEMS.map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              onClick={() => setMenuOpen(false)}
              style={{
                color: activeSection === item.toLowerCase() ? COLORS.gold : "rgba(255,255,255,0.85)",
                textDecoration: "none", fontSize: 22, fontWeight: 700,
                letterSpacing: "0.06em", textTransform: "uppercase",
                fontFamily: "'Playfair Display', Georgia, serif",
                padding: "14px 24px", minHeight: 44, display: "flex", alignItems: "center",
              }}
            >
              {item}
            </a>
          ))}
        </div>
      )}
    </nav>
  );
}

function HeroSection() {
  const width = useWindowWidth();
  const isMobile = width < 481;

  return (
    <section style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", textAlign: "center",
      background: `radial-gradient(ellipse at 50% 30%, rgba(197,165,90,0.12) 0%, transparent 60%), ${COLORS.black}`,
      padding: isMobile ? "104px 16px 64px" : "120px 24px 80px",
      position: "relative", overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
        background: `repeating-linear-gradient(0deg, transparent, transparent 60px, rgba(197,165,90,0.03) 60px, rgba(197,165,90,0.03) 61px)`,
        pointerEvents: "none",
      }} />

      <div style={{
        width: isMobile ? 88 : 120, height: isMobile ? 88 : 120, borderRadius: "50%",
        border: `3px solid ${COLORS.gold}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        marginBottom: isMobile ? 24 : 32, background: "rgba(197,165,90,0.08)",
        boxShadow: `0 0 60px rgba(197,165,90,0.15)`, flexShrink: 0,
      }}>
        <span style={{ fontSize: isMobile ? 36 : 48, fontWeight: 800, color: COLORS.gold, fontFamily: "'Playfair Display', Georgia, serif" }}>FA</span>
      </div>

      <div style={{
        fontSize: isMobile ? 12 : 14, color: COLORS.gold, letterSpacing: "0.2em", textTransform: "uppercase",
        fontWeight: 600, marginBottom: 16,
      }}>
        Lancaster County, Pennsylvania
      </div>

      <h1 style={{
        fontSize: "clamp(36px, 9vw, 72px)", fontWeight: 800, color: COLORS.white,
        lineHeight: 1.05, margin: "0 0 20px", fontFamily: "'Playfair Display', Georgia, serif",
        maxWidth: 700,
      }}>
        The Fightin'<br />
        <span style={{ color: COLORS.gold }}>Amish</span>
      </h1>

      <p style={{
        fontSize: isMobile ? 15 : 18, color: "rgba(255,255,255,0.6)", maxWidth: 520,
        lineHeight: 1.7, margin: "0 0 40px",
      }}>
        A Lancaster County soccer team chasing the <strong style={{ color: COLORS.gold }}>$1 million prize</strong> at
        The Soccer Tournament 2027 — the world's premier 7v7 championship.
      </p>

      <div style={{
        display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center",
        flexDirection: isMobile ? "column" : "row",
        width: isMobile ? "100%" : "auto",
      }}>
        <a href="#contact" style={{
          background: COLORS.gold, color: COLORS.black, padding: "15px 36px",
          borderRadius: 8, fontWeight: 700, fontSize: 15, textDecoration: "none",
          letterSpacing: "0.03em", transition: "transform 0.2s, box-shadow 0.2s",
          boxShadow: `0 4px 20px rgba(197,165,90,0.3)`,
          textAlign: "center", width: isMobile ? "100%" : "auto",
          minHeight: 44, boxSizing: "border-box",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          Become a sponsor
        </a>
        <a href="#about" style={{
          border: `2px solid rgba(197,165,90,0.4)`, color: COLORS.goldLight,
          padding: "15px 36px", borderRadius: 8, fontWeight: 600, fontSize: 15,
          textDecoration: "none", letterSpacing: "0.03em",
          background: "transparent",
          textAlign: "center", width: isMobile ? "100%" : "auto",
          minHeight: 44, boxSizing: "border-box",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          Learn more
        </a>
      </div>

      <div style={{
        display: isMobile ? "grid" : "flex",
        gridTemplateColumns: isMobile ? "1fr 1fr" : undefined,
        gap: isMobile ? 28 : 48, marginTop: isMobile ? 48 : 64,
        flexWrap: isMobile ? "wrap" : "nowrap", justifyContent: "center",
        width: isMobile ? "100%" : "auto",
        maxWidth: isMobile ? 360 : "none",
      }}>
        {[
          { label: "Prize pool", value: "$1M" },
          { label: "Format", value: "7v7" },
          { label: "Teams", value: "48" },
          { label: "Location", value: "Cary, NC" },
        ].map((s) => (
          <div key={s.label} style={{ textAlign: "center", flexShrink: 0 }}>
            <div style={{ fontSize: isMobile ? 24 : 28, fontWeight: 800, color: COLORS.gold, fontFamily: "'Playfair Display', Georgia, serif", whiteSpace: "nowrap" }}>{s.value}</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", textTransform: "uppercase", letterSpacing: "0.1em", marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function AboutSection() {
  const width = useWindowWidth();
  const isMobile = width < 481;
  const isTablet = width < 769;

  return (
    <section id="about" style={{
      padding: isMobile ? "48px 16px" : "100px 24px", background: COLORS.cream,
    }}>
      <div style={{ width: "100%", maxWidth: 900, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: isMobile ? 36 : 56 }}>
          <div style={{ fontSize: 13, color: COLORS.gold, letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 700, marginBottom: 12 }}>
            Our story
          </div>
          <h2 style={{ fontSize: isMobile ? 26 : 38, fontWeight: 800, color: COLORS.black, margin: 0, fontFamily: "'Playfair Display', Georgia, serif" }}>
            Built different. Built <span style={{ color: COLORS.goldDark }}>Amish</span>.
          </h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: isTablet ? "1fr" : "1fr 1fr", gap: isMobile ? 20 : 32 }}>
          {[
            {
              title: "The mission",
              text: "We're assembling a team of elite players from Lancaster County and beyond to compete in TST 2027 — the 7v7 Soccer World Championship with a $1 million winner-take-all prize. We need $80,000 in sponsorship by September to secure our spot.",
              icon: "⚽",
            },
            {
              title: "The brand",
              text: "The Fightin' Amish represents Lancaster County's heritage — hard work, craftsmanship, and community. Our wood-grain kits and Amish horse mascot celebrate the region that built us. This is more than a soccer team — it's a movement.",
              icon: "🏗️",
            },
            {
              title: "The tournament",
              text: "TST features 48 men's teams in a World Cup-style format at WakeMed Soccer Park in Cary, NC. Past teams include celebrity-backed squads from Gerard Piqué, Sergio Agüero, J. Cole's Dreamville, Wrexham, Club América, and more. It airs on NBC Sports.",
              icon: "🏆",
            },
            {
              title: "The opportunity",
              text: "Sponsors get massive visibility — TST drew nearly 58,000 fans in 2026 and millions of views on NBC/Peacock. Your brand on our kits, social media, and the national broadcast. Be part of the story from day one.",
              icon: "📈",
            },
          ].map((item) => (
            <div
              key={item.title}
              style={{
                background: COLORS.white, borderRadius: 12,
                padding: "32px 28px", border: `1px solid ${COLORS.creamDark}`,
              }}
            >
              <div style={{ fontSize: 28, marginBottom: 12 }}>{item.icon}</div>
              <h3 style={{
                fontSize: 18, fontWeight: 700, color: COLORS.black, margin: "0 0 10px",
                fontFamily: "'Playfair Display', Georgia, serif",
              }}>{item.title}</h3>
              <p style={{ fontSize: 14, lineHeight: 1.7, color: "rgba(26,26,26,0.7)", margin: 0 }}>
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FundraisingSection() {
  const width = useWindowWidth();
  const isMobile = width < 481;
  const raised = 5000;
  const goal = 80000;

  const tiers = [
    { name: "Barn raiser", amount: "$500 – $2,499", perks: "Logo on website, social media shoutout, team updates", color: "#8B6E3E" },
    { name: "Hitching post", amount: "$2,500 – $9,999", perks: "Kit sleeve patch, website logo, social posts, event access", color: COLORS.gold },
    { name: "Cornerstone", amount: "$10,000 – $24,999", perks: "Kit front logo, all Hitching Post perks, video features, NBC broadcast visibility", color: COLORS.goldDark },
    { name: "Founding partner", amount: "$25,000+", perks: "Primary kit sponsor, naming rights, all perks, VIP TST access, revenue share discussion", color: COLORS.black },
  ];

  return (
    <section id="fundraising" style={{
      padding: isMobile ? "48px 16px" : "100px 24px", background: COLORS.black,
    }}>
      <div style={{ width: "100%", maxWidth: 900, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: isMobile ? 36 : 56 }}>
          <div style={{ fontSize: 13, color: COLORS.gold, letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 700, marginBottom: 12 }}>
            Fundraising
          </div>
          <h2 style={{ fontSize: isMobile ? 26 : 38, fontWeight: 800, color: COLORS.white, margin: "0 0 16px", fontFamily: "'Playfair Display', Georgia, serif" }}>
            Road to <span style={{ color: COLORS.gold }}>$80,000</span>
          </h2>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: isMobile ? 15 : 16, maxWidth: 500, margin: "0 auto" }}>
            We need to raise $80K before September to lock in our TST 2027 application. Every dollar gets us closer.
          </p>
        </div>

        <div style={{
          background: COLORS.blackSoft, borderRadius: 16,
          padding: isMobile ? "28px 20px" : "40px 36px",
          border: `1px solid rgba(197,165,90,0.2)`, marginBottom: isMobile ? 32 : 48,
        }}>
          <div style={{
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            justifyContent: "space-between",
            alignItems: isMobile ? "flex-start" : "flex-end",
            gap: isMobile ? 12 : 0,
            marginBottom: 16,
          }}>
            <div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>Raised</div>
              <div style={{ fontSize: isMobile ? 36 : 42, fontWeight: 800, color: COLORS.gold, fontFamily: "'Playfair Display', Georgia, serif" }}>
                <AnimatedCounter target={raised} />
              </div>
            </div>
            <div style={{ textAlign: isMobile ? "left" : "right" }}>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>Goal</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: "rgba(255,255,255,0.6)" }}>$80,000</div>
            </div>
          </div>
          <ProgressBar current={raised} goal={goal} />
          <div style={{ marginTop: 12, fontSize: 13, color: "rgba(255,255,255,0.35)", textAlign: "center" }}>
            Application deadline: September 2026
          </div>
        </div>

        <h3 style={{ fontSize: 20, fontWeight: 700, color: COLORS.white, textAlign: "center", marginBottom: 28, fontFamily: "'Playfair Display', Georgia, serif" }}>
          Sponsorship tiers
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 20 }}>
          {tiers.map((tier, i) => (
            <div
              key={tier.name}
              style={{
                background: i === 3 ? `linear-gradient(135deg, rgba(197,165,90,0.15), rgba(197,165,90,0.05))` : "rgba(255,255,255,0.04)",
                borderRadius: 12, padding: "28px 24px",
                border: i === 3 ? `2px solid ${COLORS.gold}` : "1px solid rgba(255,255,255,0.08)",
                position: "relative", overflow: "hidden",
              }}
            >
              {i === 3 && (
                <div style={{
                  position: "absolute", top: 12, right: -28, background: COLORS.gold, color: COLORS.black,
                  fontSize: 10, fontWeight: 800, padding: "4px 36px", transform: "rotate(45deg)",
                  letterSpacing: "0.05em",
                }}>
                  TOP TIER
                </div>
              )}
              <div style={{
                width: 10, height: 10, borderRadius: "50%", background: tier.color,
                marginBottom: 12, boxShadow: `0 0 12px ${tier.color}40`,
              }} />
              <h4 style={{
                fontSize: 16, fontWeight: 700, color: COLORS.white, margin: "0 0 4px",
                fontFamily: "'Playfair Display', Georgia, serif", textTransform: "capitalize",
              }}>{tier.name}</h4>
              <div style={{ fontSize: 20, fontWeight: 800, color: COLORS.gold, margin: "4px 0 12px" }}>
                {tier.amount}
              </div>
              <p style={{ fontSize: 13, lineHeight: 1.6, color: "rgba(255,255,255,0.5)", margin: 0 }}>
                {tier.perks}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SponsorsSection() {
  const width = useWindowWidth();
  const isMobile = width < 481;
  const sponsors = [
    {
      name: "Country Lane Gazebos",
      url: "gazebo.com",
      description: "Amish-crafted gazebos, pergolas & pavilions. Family-owned since 1994, Lancaster County, PA.",
      tier: "Founding partner",
      tagline: "Official presenting sponsor",
    },
    {
      name: "Barn Burner Tools",
      url: "",
      description: "Quality tools for the hardworking. Proudly supporting Lancaster County athletics.",
      tier: "Cornerstone",
      tagline: "Kit sponsor",
    },
  ];

  return (
    <section id="sponsors" style={{
      padding: isMobile ? "48px 16px" : "100px 24px", background: COLORS.cream,
    }}>
      <div style={{ width: "100%", maxWidth: 900, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: isMobile ? 36 : 56 }}>
          <div style={{ fontSize: 13, color: COLORS.gold, letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 700, marginBottom: 12 }}>
            Our partners
          </div>
          <h2 style={{ fontSize: isMobile ? 26 : 38, fontWeight: 800, color: COLORS.black, margin: "0 0 16px", fontFamily: "'Playfair Display', Georgia, serif" }}>
            Sponsors & <span style={{ color: COLORS.goldDark }}>partners</span>
          </h2>
          <p style={{ color: "rgba(26,26,26,0.55)", fontSize: isMobile ? 15 : 16, maxWidth: 500, margin: "0 auto" }}>
            These brands believe in the Fightin' Amish mission and are helping us get to TST 2027.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 24, marginBottom: isMobile ? 32 : 48 }}>
          {sponsors.map((s) => (
            <div
              key={s.name}
              style={{
                background: COLORS.white, borderRadius: 16, padding: "36px 28px",
                border: `1px solid ${COLORS.creamDark}`, textAlign: "center",
                position: "relative",
              }}
            >
              <div style={{
                display: "inline-block", background: COLORS.goldPale, color: COLORS.goldDark,
                fontSize: 11, fontWeight: 700, padding: "4px 14px", borderRadius: 20,
                textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 16,
              }}>{s.tagline}</div>
              <h3 style={{
                fontSize: 22, fontWeight: 800, color: COLORS.black, margin: "0 0 6px",
                fontFamily: "'Playfair Display', Georgia, serif",
              }}>{s.name}</h3>
              {s.url && (
                <div style={{ fontSize: 13, color: COLORS.gold, marginBottom: 12 }}>{s.url}</div>
              )}
              <p style={{ fontSize: 14, lineHeight: 1.6, color: "rgba(26,26,26,0.6)", margin: "0 0 16px" }}>
                {s.description}
              </p>
              <div style={{
                fontSize: 12, color: COLORS.goldDark, fontWeight: 700,
                textTransform: "uppercase", letterSpacing: "0.08em",
                padding: "6px 16px", border: `1px solid ${COLORS.gold}`, borderRadius: 6,
                display: "inline-block",
              }}>{s.tier}</div>
            </div>
          ))}
        </div>

        <div style={{
          background: `linear-gradient(135deg, ${COLORS.goldPale}, ${COLORS.creamDark})`,
          borderRadius: 16, padding: isMobile ? "28px 20px" : "40px 36px", textAlign: "center",
          border: `2px dashed ${COLORS.gold}`,
        }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>🤝</div>
          <h3 style={{
            fontSize: isMobile ? 20 : 22, fontWeight: 800, color: COLORS.black, margin: "0 0 10px",
            fontFamily: "'Playfair Display', Georgia, serif",
          }}>Your brand here</h3>
          <p style={{ fontSize: 15, color: "rgba(26,26,26,0.6)", maxWidth: 400, margin: "0 auto 20px", lineHeight: 1.6 }}>
            Join our roster of sponsors and get your brand in front of millions on NBC Sports.
            Sponsorship starts at $500.
          </p>
          <a href="#contact" style={{
            background: COLORS.gold, color: COLORS.black, padding: "13px 32px",
            borderRadius: 8, fontWeight: 700, fontSize: 14, textDecoration: "none",
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            minHeight: 44, boxSizing: "border-box",
          }}>
            Get in touch
          </a>
        </div>
      </div>
    </section>
  );
}

function KitsSection() {
  const [activeKit, setActiveKit] = useState(0);
  const width = useWindowWidth();
  const isMobile = width < 481;
  const kits = [
    { name: "Home", desc: "Gold & black — classic Lancaster", bg: `linear-gradient(135deg, ${COLORS.goldLight}, ${COLORS.gold})` },
    { name: "Away", desc: "Black & gold — night edition", bg: `linear-gradient(135deg, ${COLORS.blackSoft}, ${COLORS.black})` },
    { name: "Third", desc: "Wood grain — the signature look", bg: `linear-gradient(135deg, ${COLORS.brown}, ${COLORS.brownLight})` },
  ];

  return (
    <section id="kits" style={{
      padding: isMobile ? "48px 16px" : "100px 24px", background: COLORS.black,
    }}>
      <div style={{ width: "100%", maxWidth: 900, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: isMobile ? 36 : 56 }}>
          <div style={{ fontSize: 13, color: COLORS.gold, letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 700, marginBottom: 12 }}>
            Our kits
          </div>
          <h2 style={{ fontSize: isMobile ? 26 : 38, fontWeight: 800, color: COLORS.white, margin: "0 0 16px", fontFamily: "'Playfair Display', Georgia, serif" }}>
            Wear the <span style={{ color: COLORS.gold }}>tradition</span>
          </h2>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: isMobile ? 15 : 16, maxWidth: 500, margin: "0 auto" }}>
            Three kits inspired by Lancaster County heritage — from Amish craftsmanship to barn wood grain.
          </p>
        </div>

        <div style={{ display: "flex", gap: isMobile ? 8 : 16, justifyContent: "center", marginBottom: 40 }}>
          {kits.map((kit, i) => (
            <button
              key={kit.name}
              onClick={() => setActiveKit(i)}
              style={{
                padding: isMobile ? "10px 16px" : "10px 28px", borderRadius: 8, fontWeight: 700, fontSize: 14,
                cursor: "pointer", transition: "all 0.2s", border: "none",
                letterSpacing: "0.04em", minHeight: 44,
                background: activeKit === i ? COLORS.gold : "rgba(255,255,255,0.08)",
                color: activeKit === i ? COLORS.black : "rgba(255,255,255,0.6)",
              }}
            >
              {kit.name}
            </button>
          ))}
        </div>

        <div style={{
          background: kits[activeKit].bg,
          borderRadius: 20, padding: isMobile ? "40px 24px" : "60px 40px", textAlign: "center",
          minHeight: 280, display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          transition: "background 0.4s",
          border: `1px solid rgba(197,165,90,0.3)`,
        }}>
          <div style={{
            width: 100, height: 100, borderRadius: "50%",
            background: "rgba(255,255,255,0.15)", display: "flex",
            alignItems: "center", justifyContent: "center", marginBottom: 24,
            border: "2px solid rgba(255,255,255,0.2)",
          }}>
            <span style={{ fontSize: 42, fontWeight: 800, color: COLORS.white, fontFamily: "'Playfair Display', Georgia, serif" }}>FA</span>
          </div>
          <h3 style={{ fontSize: 28, fontWeight: 800, color: COLORS.white, margin: "0 0 8px", fontFamily: "'Playfair Display', Georgia, serif" }}>
            {kits[activeKit].name} kit
          </h3>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.7)", margin: 0 }}>
            {kits[activeKit].desc}
          </p>
          <div style={{
            marginTop: 24, fontSize: 12, color: "rgba(255,255,255,0.4)",
            textTransform: "uppercase", letterSpacing: "0.1em",
          }}>
            Sponsor logos featured on chest, sleeve & shorts
          </div>
        </div>
      </div>
    </section>
  );
}

// Field length limits (defense-in-depth: enforced in handler + maxLength attr).
const FIELD_MAX = { name: 100, email: 150, company: 150, message: 1000 };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Remove any HTML tags / angle-bracket content before it ever reaches state.
function stripHtml(value) {
  return value.replace(/<[^>]*>?/g, "");
}

function ContactSection() {
  const [formData, setFormData] = useState({ name: "", email: "", company: "", message: "", tier: "barn-raiser" });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const width = useWindowWidth();
  const isMobile = width < 481;

  const handleChange = (field) => (e) => {
    let value = e.target.value;
    if (field !== "tier") {
      value = stripHtml(value).slice(0, FIELD_MAX[field]);
    }
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = () => {
    const e = {};
    const name = formData.name.trim();
    const email = formData.email.trim();
    if (!name) e.name = "Please enter your name.";
    else if (name.length > FIELD_MAX.name) e.name = `Keep this under ${FIELD_MAX.name} characters.`;
    if (!email) e.email = "Please enter your email.";
    else if (!EMAIL_RE.test(email)) e.email = "Please enter a valid email address.";
    else if (email.length > FIELD_MAX.email) e.email = `Keep this under ${FIELD_MAX.email} characters.`;
    if (formData.company.length > FIELD_MAX.company) e.company = `Keep this under ${FIELD_MAX.company} characters.`;
    if (formData.message.length > FIELD_MAX.message) e.message = `Keep this under ${FIELD_MAX.message} characters.`;
    return e;
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    const found = validate();
    if (Object.keys(found).length > 0) {
      setErrors(found);
      return;
    }
    setErrors({});
    setError("");

    // NOTE: use a distinct local name (`params`) — naming this `formData`
    // would shadow the component state and read undefined off URLSearchParams.
    const params = new URLSearchParams();
    params.append("form-name", "sponsor-inquiry");
    params.append("bot-field", "");
    params.append("name", formData.name);
    params.append("email", formData.email);
    params.append("company", formData.company);
    params.append("tier", formData.tier);
    params.append("message", formData.message);

    try {
      const response = await fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params.toString(),
      });
      if (response.ok) {
        setSubmitted(true);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    }
  };

  const inputStyle = (field) => ({
    width: "100%", padding: "12px 14px", borderRadius: 8, fontSize: 16,
    border: `1px solid ${errors[field] ? "#B00020" : COLORS.creamDark}`, outline: "none",
    background: COLORS.cream, boxSizing: "border-box", minHeight: 44,
  });

  const errorTextStyle = { color: "#B00020", fontSize: 12, fontWeight: 600, marginTop: 6, display: "block" };

  return (
    <section id="contact" style={{
      padding: isMobile ? "48px 16px" : "100px 24px", background: COLORS.cream,
    }}>
      <div style={{ width: "100%", maxWidth: 700, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: isMobile ? 36 : 48 }}>
          <div style={{ fontSize: 13, color: COLORS.gold, letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 700, marginBottom: 12 }}>
            Get involved
          </div>
          <h2 style={{ fontSize: isMobile ? 26 : 38, fontWeight: 800, color: COLORS.black, margin: "0 0 16px", fontFamily: "'Playfair Display', Georgia, serif" }}>
            Become a <span style={{ color: COLORS.goldDark }}>sponsor</span>
          </h2>
          <p style={{ color: "rgba(26,26,26,0.55)", fontSize: isMobile ? 15 : 16, maxWidth: 460, margin: "0 auto" }}>
            Interested in sponsoring The Fightin' Amish? Fill out the form and we'll be in touch within 24 hours.
          </p>
        </div>

        {submitted ? (
          <div style={{
            background: COLORS.white, borderRadius: 16, padding: isMobile ? "40px 24px" : "60px 40px",
            textAlign: "center", border: `2px solid ${COLORS.gold}`,
          }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
            <h3 style={{ fontSize: 24, fontWeight: 800, color: COLORS.black, fontFamily: "'Playfair Display', Georgia, serif" }}>
              Thank you!
            </h3>
            <p style={{ color: "rgba(26,26,26,0.6)", marginTop: 8 }}>
              We'll reach out within 24 hours to discuss partnership opportunities.
            </p>
          </div>
        ) : (
          <form
            name="sponsor-inquiry"
            method="POST"
            data-netlify="true"
            data-netlify-honeypot="bot-field"
            onSubmit={handleSubmit}
            noValidate
            style={{
              background: COLORS.white, borderRadius: 16, padding: isMobile ? "28px 20px" : "40px 36px",
              border: `1px solid ${COLORS.creamDark}`,
            }}
          >
            {/* Netlify needs this hidden field to map the JS-submitted POST to the form. */}
            <input type="hidden" name="form-name" value="sponsor-inquiry" />
            {/* Honeypot: real users never see or fill this; bots that do are dropped. */}
            <p style={{ display: "none" }}>
              <label>
                Don&apos;t fill this out if you&apos;re human:
                <input name="bot-field" tabIndex={-1} autoComplete="off" />
              </label>
            </p>

            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 16, marginBottom: 16 }}>
              <div>
                <label htmlFor="name" style={{ fontSize: 13, fontWeight: 600, color: COLORS.black, display: "block", marginBottom: 6 }}>
                  Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange("name")}
                  maxLength={FIELD_MAX.name}
                  placeholder="Your name"
                  aria-invalid={!!errors.name}
                  style={inputStyle("name")}
                />
                {errors.name && <span role="alert" style={errorTextStyle}>{errors.name}</span>}
              </div>
              <div>
                <label htmlFor="email" style={{ fontSize: 13, fontWeight: 600, color: COLORS.black, display: "block", marginBottom: 6 }}>
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange("email")}
                  maxLength={FIELD_MAX.email}
                  placeholder="you@company.com"
                  aria-invalid={!!errors.email}
                  style={inputStyle("email")}
                />
                {errors.email && <span role="alert" style={errorTextStyle}>{errors.email}</span>}
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label htmlFor="company" style={{ fontSize: 13, fontWeight: 600, color: COLORS.black, display: "block", marginBottom: 6 }}>
                Company / brand
              </label>
              <input
                id="company"
                name="company"
                type="text"
                value={formData.company}
                onChange={handleChange("company")}
                maxLength={FIELD_MAX.company}
                placeholder="Your company name"
                aria-invalid={!!errors.company}
                style={inputStyle("company")}
              />
              {errors.company && <span role="alert" style={errorTextStyle}>{errors.company}</span>}
            </div>

            <div style={{ marginBottom: 16 }}>
              <label htmlFor="tier" style={{ fontSize: 13, fontWeight: 600, color: COLORS.black, display: "block", marginBottom: 6 }}>
                Sponsorship tier interest
              </label>
              <select
                id="tier"
                name="tier"
                value={formData.tier}
                onChange={handleChange("tier")}
                style={{ ...inputStyle("tier"), cursor: "pointer" }}
              >
                <option value="barn-raiser">Barn Raiser ($500 – $2,499)</option>
                <option value="hitching-post">Hitching Post ($2,500 – $9,999)</option>
                <option value="cornerstone">Cornerstone ($10,000 – $24,999)</option>
                <option value="founding-partner">Founding Partner ($25,000+)</option>
              </select>
            </div>

            <div style={{ marginBottom: 24 }}>
              <label htmlFor="message" style={{ fontSize: 13, fontWeight: 600, color: COLORS.black, display: "block", marginBottom: 6 }}>
                Message
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange("message")}
                maxLength={FIELD_MAX.message}
                rows={4}
                placeholder="Tell us about your brand and how you'd like to partner..."
                aria-invalid={!!errors.message}
                style={{ ...inputStyle("message"), minHeight: 110, resize: "vertical", fontFamily: "inherit" }}
              />
              {errors.message && <span role="alert" style={errorTextStyle}>{errors.message}</span>}
            </div>

            {error && (
              <div role="alert" style={{ ...errorTextStyle, marginBottom: 16, fontSize: 13 }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              style={{
                width: "100%", padding: "15px", borderRadius: 8, border: "none",
                background: COLORS.gold, color: COLORS.black, fontWeight: 700,
                fontSize: 15, cursor: "pointer", letterSpacing: "0.03em", minHeight: 44,
              }}
            >
              Submit inquiry
            </button>
          </form>
        )}
      </div>
    </section>
  );
}

function Footer() {
  const width = useWindowWidth();
  const isMobile = width < 481;
  return (
    <footer style={{
      background: COLORS.black, padding: isMobile ? "36px 16px 28px" : "48px 24px 32px",
      borderTop: `1px solid rgba(197,165,90,0.2)`,
    }}>
      <div style={{ width: "100%", maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 20,
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: "50%", background: COLORS.gold,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 800, fontSize: 14, color: COLORS.black, fontFamily: "'Playfair Display', Georgia, serif",
          }}>FA</div>
          <span style={{ color: COLORS.gold, fontWeight: 700, fontSize: 14, letterSpacing: "0.04em", fontFamily: "'Playfair Display', Georgia, serif" }}>
            THE FIGHTIN' AMISH
          </span>
        </div>

        <div style={{ display: "flex", gap: isMobile ? 16 : 32, justifyContent: "center", flexWrap: "wrap", marginBottom: 24 }}>
          {["Twitter/X", "Instagram", "TikTok", "YouTube"].map((s) => (
            <span key={s} style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", cursor: "pointer", padding: "8px 4px" }}>{s}</span>
          ))}
        </div>

        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.25)" }}>
          Lancaster County, PA — TST 2027 · Built with grit, not electricity.
        </div>
      </div>
    </footer>
  );
}

export default function FightinAmishWebsite() {
  const [activeSection, setActiveSection] = useState("about");

  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;800&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const sections = NAV_ITEMS.map((n) => n.toLowerCase());
      for (const id of sections.reverse()) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top < 200) {
          setActiveSection(id);
          break;
        }
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div style={{ fontFamily: "'Inter', -apple-system, sans-serif", margin: 0, padding: 0, background: COLORS.cream, overflowX: "hidden", maxWidth: "100vw" }}>
      <Navbar activeSection={activeSection} />
      <HeroSection />
      <AboutSection />
      <FundraisingSection />
      <SponsorsSection />
      <KitsSection />
      <ContactSection />
      <Footer />
    </div>
  );
}
