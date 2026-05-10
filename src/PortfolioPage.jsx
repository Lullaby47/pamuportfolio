import { memo, useRef } from "react"
import { motion } from "framer-motion"
import profileImage from "./assets/profile.jpg"
import "./portfolio.css"

const skills = [
  "Leadership",
  "Team Management",
  "Event Coordination",
  "Communication",
  "Team Collaboration",
  "Active Listening",
  "Bilingual: English and Nepali",
  "Adaptability",
]

const education = [
  {
    title: "Secondary Level Education (SEE)",
    place: "Kanjairowa National School",
    meta: "Completed 2023",
  },
  {
    title: "CAIE A Levels",
    place: "Kathmandu World School (KWS)",
    meta: "2023-2025",
    extra: "Subjects: Economics, Business, Computer Science, Psychology",
  },
]

const timeline = [
  {
    title: "Eco Club, Kanjairowa",
    period: "2018-2021",
    body:
      "Led and participated in environmental awareness and school-based conservation projects.",
  },
  {
    title: "Business Club, KWS",
    period: "2024",
    body: 'Event coordinator. Organized "Adharo", a local business support initiative.',
  },
  {
    title: "Member, Interact Club of Pragyan Academy",
    period: "2022-2023",
    body:
      "Volunteered in cleanliness campaigns and participated in orphanage visits.",
  },
  {
    title: "Member, Interact Club of Kathmandu World School",
    period: "2023-2024",
    body: "Volunteered and participated in school-level club activities.",
  },
  {
    title: "Vice President, Interact Club of Lalitpur",
    period: "2024-2025",
    body:
      'Chaired "Periods with Pride" and co-chaired the 8th annual themed event. Actively participated in district events, Rotary initiatives, and inter-club collaboration events.',
  },
  {
    title: "President, Interact Club of Lalitpur",
    period: "2025-2026",
    body:
      "Coordinated and executed 25+ service projects across multiple Rotary focus areas. Actively contributed to zonal and district-level programs and inter-club activities.",
  },
  {
    title: "Zonal Interact Representative, Zone 8",
    period: "2025-2026",
    body:
      "Interact District 3292. Coordinated zonal Interact activities and supported district-level communication and execution.",
  },
  {
    title: "Assistant Zonal Interact Representative",
    period: "2026",
    body:
      "Interact Zone 8, Lalitpur & Kirtipur. Assisted in zonal coordination and supported planning and execution of zonal activities.",
  },
]

const revealContainer = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.14,
      delayChildren: 0.04,
    },
  },
}

const revealUp = {
  hidden: { opacity: 0, y: 34, scale: 0.98 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] },
  },
}

const scrollReveal = {
  hidden: { opacity: 0, y: 42 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] },
  },
}

function SectionCard({ title, eyebrow, children, className = "", wrapperClassName = "" }) {
  return (
    <div className={wrapperClassName}>
      <motion.section
        className={`glass-card ${className}`}
        variants={scrollReveal}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.28 }}
      >
        {eyebrow ? <p className="section-eyebrow">{eyebrow}</p> : null}
        <h3 className="section-title">{title}</h3>
        {children}
      </motion.section>
    </div>
  )
}

function ContactItem({ label, value }) {
  return (
    <div className="detail-row">
      <span className="detail-label">{label}</span>
      <span className="detail-value">{value}</span>
    </div>
  )
}

function PortfolioPage({ isVisible, isRestarting, restartPhase, onProfileDoubleClick }) {
  const lastTapRef = useRef(0)

  const handleProfileTouchEnd = () => {
    const now = Date.now()

    if (now - lastTapRef.current < 320) {
      onProfileDoubleClick?.()
      lastTapRef.current = 0
      return
    }

    lastTapRef.current = now
  }

  return (
    <main
      className={`portfolio-page${isRestarting ? " is-restarting" : ""}${restartPhase ? ` restart-${restartPhase}` : ""}`}
    >
      <div className="bg-blob-1"></div>
      <div className="bg-blob-2"></div>
      <div className="bg-blob-3"></div>

      <motion.div
        className="portfolio-inner"
        variants={revealContainer}
        initial="hidden"
        animate={isVisible ? "show" : "hidden"}
      >
        <div className="collapse-piece piece-1">
          <motion.section className="hero-panel glass-card" variants={revealUp}>
            <motion.div className="hero-grid" variants={revealContainer}>
              <motion.div className="profile-orb-wrap" variants={revealUp}>
                <motion.div
                  className="profile-orb"
                  whileHover={{ y: -6, scale: 1.02 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="profile-glow"></div>
                  <img
                    src={profileImage}
                    alt="Pramoditti Pokharel"
                    className="profile-image"
                    loading="eager"
                    decoding="sync"
                    fetchPriority="high"
                    onDoubleClick={onProfileDoubleClick}
                    onTouchEnd={handleProfileTouchEnd}
                  />
                </motion.div>
              </motion.div>

              <motion.div className="hero-copy" variants={revealContainer}>
                <motion.div className="hero-kicker-wrap" variants={revealUp}>
                  <span className="hero-kicker-dot"></span>
                  <p className="hero-kicker">Student Leader • Interact District 3292</p>
                </motion.div>
                <motion.h1 className="hero-name" variants={revealUp}>
                  Pramoditti <span className="accent-text">Pokharel</span>
                </motion.h1>
                <motion.p className="hero-subtitle" variants={revealUp}>
                  Student | Interactor | Event Coordinator
                </motion.p>
                <motion.p className="hero-summary" variants={revealUp}>
                  A skilled and dedicated student and Interactor with experience in teamwork,
                  leadership, and coordination through club, zonal, and district-level interact
                  activities.
                </motion.p>
                <motion.div className="hero-actions" variants={revealUp}>
                  <a href="#contact" className="btn-primary">Get in touch</a>
                  <a href="#timeline" className="btn-secondary">View journey →</a>
                </motion.div>
              </motion.div>
            </motion.div>
          </motion.section>
        </div>

        <div className="collapse-piece piece-2">
          <motion.section className="about-feature glass-card" variants={revealUp}>
            <div className="feature-intro">
              <p className="section-eyebrow">About Me</p>
              <h2 className="feature-title">
                Calm leadership with real <span className="accent-text">execution energy</span>.
              </h2>
            </div>
            <p className="feature-copy">
              I enjoy building momentum in teams, coordinating people with clarity, and turning
              service-driven ideas into polished, meaningful events. My experience across club,
              zonal, and district spaces has shaped me into someone who leads with empathy,
              discipline, and follow-through.
            </p>
          </motion.section>
        </div>

        <section className="info-grid" id="contact">
          <SectionCard
            title="Contact"
            eyebrow="Reach Out"
            className="info-card contact-card"
            wrapperClassName="collapse-piece piece-3"
          >
            <div className="stack-list">
              <ContactItem label="Phone" value="+977 9768697483" />
              <ContactItem label="Email" value="pokharelpramoditti03@gmail.com" />
              <ContactItem label="Location" value="Sinamangal, Kathmandu" />
            </div>
          </SectionCard>

          <SectionCard
            title="Education"
            eyebrow="Academic Path"
            className="info-card education-card"
            wrapperClassName="collapse-piece piece-4"
          >
            <div className="stack-list">
              {education.map((item) => (
                <article key={item.title} className="mini-block">
                  <h4>{item.title}</h4>
                  <p className="mini-place">{item.place}</p>
                  <span className="mini-meta">{item.meta}</span>
                  {item.extra ? <small className="mini-extra">{item.extra}</small> : null}
                </article>
              ))}
            </div>
          </SectionCard>

          <SectionCard
            title="Skills"
            eyebrow="Strengths"
            className="info-card skills-card"
            wrapperClassName="collapse-piece piece-5"
          >
            <div className="chip-grid">
              {skills.map((skill, idx) => (
                <motion.span
                  key={skill}
                  className="skill-chip"
                  whileHover={{ y: -4, scale: 1.03 }}
                  transition={{ duration: 0.25 }}
                  style={{ transitionDelay: `${idx * 0.02}s` }}
                >
                  {skill}
                </motion.span>
              ))}
            </div>
          </SectionCard>
        </section>

        <div className="collapse-piece piece-6">
          <motion.section
            className="timeline-shell glass-card"
            variants={scrollReveal}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.18 }}
            id="timeline"
          >
            <p className="section-eyebrow">Leadership & Experience</p>
            <h3 className="section-title">A growing arc of responsibility, service, and execution.</h3>
            <div className="timeline-list">
              {timeline.map((item, index) => (
                <motion.article
                  key={`${item.title}-${item.period}`}
                  className="timeline-card"
                  initial={{ opacity: 0, y: 28 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.22 }}
                  transition={{ duration: 0.6, delay: index * 0.04, ease: [0.22, 1, 0.36, 1] }}
                  whileHover={{ y: -6, scale: 1.01 }}
                >
                  <div className="timeline-dot">
                    <div className="timeline-dot-inner"></div>
                  </div>
                  <div className="timeline-content">
                    <div className="timeline-header">
                      <h4>{item.title}</h4>
                      <span className="timeline-period">{item.period}</span>
                    </div>
                    <p>{item.body}</p>
                  </div>
                </motion.article>
              ))}
            </div>
          </motion.section>
        </div>

        <SectionCard
          title="References"
          eyebrow="Trusted Connection"
          className="references-card"
          wrapperClassName="collapse-piece piece-7"
        >
          <div className="reference-block">
            <div className="reference-icon">★</div>
            <div className="reference-content">
              <h4>Rtr. Abi Acharya</h4>
              <p>Interactor of the Year (23/24)</p>
              <p>ZIR at Interact District 3292 (23/24)</p>
              <p>Joint Secretary RACCVK (24/25)</p>
              <span className="reference-contact">Call: +977 9803655773</span>
            </div>
          </div>
        </SectionCard>

        <div className="collapse-piece piece-8">
          <footer className="portfolio-footer">
            <p>© {new Date().getFullYear()} Pramoditti Pokharel — Built with purpose and service</p>
          </footer>
        </div>
      </motion.div>
    </main>
  )
}

export default memo(PortfolioPage)
