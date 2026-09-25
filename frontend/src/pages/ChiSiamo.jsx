import { useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'motion/react'

import { precaricaVetrina } from '../services/vetrina'

const EASE = [0.65, 0, 0.35, 1]

const TIMELINE = [
  {
    anno: '1886',
    titolo: 'Nasce l\u2019automobile',
    testo:
      'Karl Benz brevetta la Patent-Motorwagen: tre ruote, un motore a scoppio e un\u2019idea che avrebbe cambiato il mondo. Da quel giorno l\u2019uomo non ha più smesso di inseguire la velocità.',
  },
  {
    anno: '1927',
    titolo: 'L\u2019epopea delle corse',
    testo:
      'La prima Mille Miglia accende l\u2019Italia: mille miglia di strade aperte, coraggio e meccanica pura. È in quegli anni che l\u2019auto smette di essere un mezzo e diventa un sogno.',
  },
  {
    anno: '1962',
    titolo: 'La nostra officina',
    testo:
      'A Roma, Ettore Liotti apre una piccola officina meccanica a due passi da Via dei Condotti. Iniziò riparando motori; finì per innamorarsi delle gran turismo che i clienti gli affidavano. È lì che nasce la nostra storia.',
  },
  {
    anno: '1985',
    titolo: 'L\u2019arte del restauro',
    testo:
      'La seconda generazione trasforma l\u2019officina in un atelier del restauro: auto d\u2019epoca riportate alla vita bullone dopo bullone, con la stessa pazienza dei maestri carrozzieri di un tempo.',
  },
  {
    anno: '2004',
    titolo: 'Dal restauro alla vetrina',
    testo:
      'Apre il primo showroom SicLuxoryCars: poche auto, selezionate una a una. Il lusso, per noi, non è abbondanza — è la certezza che ogni vettura meriti di essere ammirata.',
  },
  {
    anno: 'Oggi',
    titolo: 'La velocità diventa digitale',
    testo:
      'Portiamo la vetrina in tasca: ogni auto raccontata, verificata e pronta al primo sguardo. La passione di Ettore, la precisione di sempre, il futuro davanti.',
  },
]

const METODO = [
  {
    numero: '01',
    titolo: 'Selezione',
    testo:
      'Scartiamo il 95% delle auto che valutiamo. Entrano in vetrina solo esemplari con storia documentata, chilometraggio certificato e carattere.',
  },
  {
    numero: '02',
    titolo: 'Verifica',
    testo:
      'Ogni vettura supera 120 controlli meccanici ed estetici nella nostra officina. Nulla passa inosservato: dalla compressione dei cilindri alla profondità della vernice.',
  },
  {
    numero: '03',
    titolo: 'Preparazione',
    testo:
      'Detailing professionale, tagliando completo e fotografia dedicata. Quando un\u2019auto arriva in vetrina, è già pronta per il suo prossimo proprietario.',
  },
  {
    numero: '04',
    titolo: 'Consegna',
    testo:
      'Concierge dedicato, passaggio di proprietà gestito da noi e consegna a domicilio in tutta Italia. Tu devi solo girare la chiave.',
  },
]

const TEAM = [
  {
    nome: 'Marco Liotti',
    ruolo: 'Amministratore Delegato',
    bio: 'Terza generazione della famiglia. Cresciuto tra i banchi dell\u2019officina del nonno, oggi guida SicLuxoryCars con la stessa regola di sempre: mai un\u2019auto di cui non andremmo orgogliosi.',
    iniziali: 'ML',
  },
  {
    nome: 'Giulia Santoro',
    ruolo: 'Direttrice Acquisti',
    bio: 'Ex valutatrice d\u2019aste internazionali, è lei che decide quali auto meritano la vetrina. Si dice riconosca un motore truccato dal rumore allo starter.',
    iniziali: 'GS',
  },
  {
    nome: 'Davide Ferrante',
    ruolo: 'Capo Officina',
    bio: 'Trent\u2019anni tra motori V8 e V12. Coordina i 120 controlli di ogni vettura e firma personalmente il rapporto tecnico che accompagna ogni vendita.',
    iniziali: 'DF',
  },
  {
    nome: 'Elena Vasta',
    ruolo: 'Customer Experience',
    bio: 'Dal primo messaggio alla consegna a domicilio, Elena segue ogni cliente come un concierge d\u2019albergo. Il suo obiettivo: zero pensieri, solo la gioia dell\u2019acquisto.',
    iniziali: 'EV',
  },
  {
    nome: 'Luca Di Mauro',
    ruolo: 'Pilota Collaudatore',
    bio: 'Ex pilota di gran turismo, collauda personalmente ogni auto prima della messa in vendita. Se dice che «tiene», puoi fidarti.',
    iniziali: 'LD',
  },
  {
    nome: 'Sara Messina',
    ruolo: 'Comunicazione',
    bio: 'Racconta le nostre auto come storie, non come annunci. Cura fotografie, testi e l\u2019esperienza digitale che stai vivendo in questo momento.',
    iniziali: 'SM',
  },
]

function Reveal({ children, className = '', delay = 0 }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.7, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  )
}

function TimelineItem({ item, index }) {
  return (
    <Reveal className={`timeline-item ${index % 2 === 0 ? 'timeline-item-left' : 'timeline-item-right'}`}>
      <div className="timeline-card">
        <span className="timeline-anno">{item.anno}</span>
        <h3 className="timeline-titolo">{item.titolo}</h3>
        <p className="timeline-testo">{item.testo}</p>
      </div>
    </Reveal>
  )
}

function ChiSiamo() {
  const heroRef = useRef(null)
  const timelineRef = useRef(null)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const introPostLogin = searchParams.has('intro')

  useEffect(() => {
    if (introPostLogin) precaricaVetrina()
  }, [introPostLogin])

  const { scrollYProgress: pageProgress } = useScroll()

  const { scrollYProgress: heroProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  })
  const heroY = useTransform(heroProgress, [0, 1], [0, 160])
  const heroOpacity = useTransform(heroProgress, [0, 0.8], [1, 0])
  const heroScale = useTransform(heroProgress, [0, 1], [1, 0.92])

  const { scrollYProgress: timelineProgress } = useScroll({
    target: timelineRef,
    offset: ['start 75%', 'end 60%'],
  })
  const lineScale = useTransform(timelineProgress, [0, 1], [0, 1])

  return (
    <div className="chi-siamo">
      <motion.div className="scroll-progress" style={{ scaleX: pageProgress }} />

      {introPostLogin && (
        <motion.button
          type="button"
          className="cs-intro-close"
          aria-label="Chiudi e vai alla vetrina"
          onClick={() => navigate('/')}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, ease: EASE, delay: 0.4 }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <line x1="2" y1="2" x2="14" y2="14" />
            <line x1="14" y1="2" x2="2" y2="14" />
          </svg>
        </motion.button>
      )}

      <section ref={heroRef} className="cs-hero">
        <motion.div className="cs-hero-inner" style={{ y: heroY, opacity: heroOpacity, scale: heroScale }}>
          <p className="cs-hero-kicker">Dal 1962, a tutta velocità</p>
          <h2 className="cs-hero-title">
            Lusso.
            <br />
            Motori.
            <br />
            <span className="cs-hero-accent">Velocità.</span>
          </h2>
          <p className="cs-hero-sub">
            Tre generazioni di passione romana per le auto che fanno battere il cuore.
          </p>
        </motion.div>
        <motion.div
          className="cs-scroll-hint"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        >
          <span>Scorri</span>
          <svg width="16" height="24" viewBox="0 0 16 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <line x1="8" y1="2" x2="8" y2="20" />
            <polyline points="2,14 8,21 14,14" />
          </svg>
        </motion.div>
      </section>

      <section className="cs-section">
        <Reveal className="cs-section-head">
          <p className="cs-kicker">La storia</p>
          <h2 className="cs-title">Dai primi motori alla nostra vetrina</h2>
        </Reveal>
        <div ref={timelineRef} className="timeline">
          <motion.div className="timeline-line" style={{ scaleY: lineScale }} />
          {TIMELINE.map((item, i) => (
            <TimelineItem key={item.anno} item={item} index={i} />
          ))}
        </div>
      </section>

      <section className="cs-section cs-section-dark">
        <Reveal className="cs-section-head">
          <p className="cs-kicker">Come lavoriamo</p>
          <h2 className="cs-title">Il nostro metodo</h2>
          <p className="cs-lead">
            Ogni auto in vetrina ha superato un percorso che non ammette scorciatoie. Quattro passi, sempre gli stessi, dal 1962.
          </p>
        </Reveal>
        <div className="metodo-grid">
          {METODO.map((passo, i) => (
            <Reveal key={passo.numero} className="metodo-card" delay={i * 0.08}>
              <span className="metodo-numero">{passo.numero}</span>
              <h3 className="metodo-titolo">{passo.titolo}</h3>
              <p className="metodo-testo">{passo.testo}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="cs-section">
        <Reveal className="cs-section-head">
          <p className="cs-kicker">Le persone</p>
          <h2 className="cs-title">Il nostro team</h2>
          <p className="cs-lead">
            Dietro ogni vettura c\u2019è una squadra che la conosce a memoria. Ecco chi incontrerai.
          </p>
        </Reveal>
        <div className="team-grid">
          {TEAM.map((membro, i) => (
            <Reveal key={membro.nome} className="team-card" delay={(i % 3) * 0.08}>
              <div className="team-avatar">{membro.iniziali}</div>
              <h3 className="team-nome">{membro.nome}</h3>
              <p className="team-ruolo">{membro.ruolo}</p>
              <p className="team-bio">{membro.bio}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="cs-quote-section">
        <Reveal>
          <blockquote className="cs-quote">
            «Un\u2019auto non si vende. Si affida a chi saprà amarla come noi.»
          </blockquote>
          <p className="cs-quote-autore">— Ettore Liotti, fondatore</p>
        </Reveal>
      </section>
    </div>
  )
}

export default ChiSiamo
