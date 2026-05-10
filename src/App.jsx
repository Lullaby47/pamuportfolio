import { memo, useEffect, useMemo, useRef, useState } from "react"
import PortfolioPage from "./PortfolioPage"
import "./index.css"

const TAU = Math.sqrt(2) / 2
const NORMAL = { x: -TAU, y: TAU }
const SAMPLE_COUNT = 104
const TOOTH_COUNT = 116
const INTRO_DURATION = 4300
const PHASE_ONE_END = 0.85
const OVERLAY_HIDE_AT = 0.95
const PANEL_MIN = -320
const PANEL_MAX = 420
const PANEL_SIZE = PANEL_MAX - PANEL_MIN
const PANEL_EXIT_DISTANCE = 260
const BLACKOUT_HOLD_DURATION = 2000
const BLACKOUT_COLLAPSE_DURATION = 5000
const BLACKOUT_EXPAND_DURATION = 1500
const BLACKOUT_TOTAL_DURATION =
  BLACKOUT_HOLD_DURATION + BLACKOUT_COLLAPSE_DURATION + BLACKOUT_EXPAND_DURATION
const COVER_EMOJIS = [
  { emoji: "✨", x: 12, y: 12, size: 6.8, rotate: -18, opacity: 0.24, halo: 4.8 },
  { emoji: "🎀", x: 28, y: 19, size: 7.4, rotate: 14, opacity: 0.24, halo: 5.2 },
  { emoji: "🌷", x: 48, y: 12, size: 6.2, rotate: -10, opacity: 0.22, halo: 4.6 },
  { emoji: "💌", x: 72, y: 17, size: 6.5, rotate: 12, opacity: 0.22, halo: 4.8 },
  { emoji: "🫶", x: 87, y: 11, size: 6.8, rotate: -14, opacity: 0.24, halo: 4.9 },
  { emoji: "🌟", x: 18, y: 33, size: 7, rotate: 16, opacity: 0.2, halo: 5 },
  { emoji: "💻", x: 36, y: 30, size: 7.6, rotate: -8, opacity: 0.22, halo: 5.4 },
  { emoji: "📚", x: 58, y: 36, size: 7, rotate: 18, opacity: 0.22, halo: 5.1 },
  { emoji: "🎤", x: 83, y: 34, size: 7.4, rotate: -16, opacity: 0.23, halo: 5.3 },
  { emoji: "☕", x: 8, y: 56, size: 7.2, rotate: -12, opacity: 0.22, halo: 5.1 },
  { emoji: "💡", x: 27, y: 53, size: 6.4, rotate: 12, opacity: 0.2, halo: 4.6 },
  { emoji: "🦋", x: 46, y: 58, size: 7.8, rotate: -18, opacity: 0.2, halo: 5.6 },
  { emoji: "📝", x: 66, y: 53, size: 7, rotate: 10, opacity: 0.22, halo: 5 },
  { emoji: "🌸", x: 89, y: 61, size: 7.4, rotate: -10, opacity: 0.24, halo: 5.2 },
  { emoji: "💖", x: 17, y: 82, size: 6.8, rotate: 10, opacity: 0.2, halo: 4.9 },
  { emoji: "🎧", x: 39, y: 80, size: 7.2, rotate: -14, opacity: 0.2, halo: 5.1 },
  { emoji: "🎓", x: 63, y: 87, size: 7.2, rotate: 14, opacity: 0.22, halo: 5.1 },
  { emoji: "🌼", x: 84, y: 83, size: 6.6, rotate: -16, opacity: 0.2, halo: 4.8 },
]

function clamp(value, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value))
}

function easeInOutCubic(value) {
  return value < 0.5
    ? 4 * value * value * value
    : 1 - Math.pow(-2 * value + 2, 3) / 2
}

function easeOutCubic(value) {
  return 1 - Math.pow(1 - value, 3)
}

function getCenterPoint(t) {
  return { x: t * 100, y: t * 100 }
}

function getSpreadAt(t, progress) {
  if (t >= progress) {
    return 0
  }

  const distanceBehind = progress - t
  const trailGrowth = easeOutCubic(clamp(distanceBehind / 0.16))
  const settledWidth = 0.9 + 4 * easeOutCubic(progress)
  const softness = 0.88 + 0.12 * Math.cos(clamp(t / Math.max(progress, 0.001)) * Math.PI * 0.5)

  return settledWidth * trailGrowth * softness
}

function buildBoundaryPoints(side, zipProgress) {
  const sideSign = side === "lower" ? 1 : -1
  const points = []

  for (let index = 0; index <= SAMPLE_COUNT; index += 1) {
    const t = 1 - index / SAMPLE_COUNT
    const center = getCenterPoint(t)
    const spread = getSpreadAt(t, zipProgress)

    points.push({
      x: center.x + NORMAL.x * sideSign * spread,
      y: center.y + NORMAL.y * sideSign * spread,
    })
  }

  return points
}

function buildClipPath(side, zipProgress) {
  const boundary = buildBoundaryPoints(side, zipProgress)
  const boundaryCommands = boundary.map((point) => `L ${point.x.toFixed(3)} ${point.y.toFixed(3)}`)

  if (side === "upper") {
    return [
      `M ${PANEL_MIN} ${PANEL_MIN}`,
      `L ${PANEL_MAX} ${PANEL_MIN}`,
      `L ${PANEL_MAX} ${PANEL_MAX}`,
      ...boundaryCommands,
      "Z",
    ].join(" ")
  }

  return [
    `M ${PANEL_MIN} ${PANEL_MIN}`,
    `L ${PANEL_MIN} ${PANEL_MAX}`,
    `L ${PANEL_MAX} ${PANEL_MAX}`,
    ...boundaryCommands,
    "Z",
  ].join(" ")
}

function buildSlitPath(zipProgress) {
  if (zipProgress <= 0.001) {
    return ""
  }

  const upper = []
  const lower = []

  for (let index = 0; index <= SAMPLE_COUNT; index += 1) {
    const t = zipProgress - (zipProgress * index) / SAMPLE_COUNT
    const center = getCenterPoint(t)
    const spread = getSpreadAt(t, zipProgress)

    upper.push(`${(center.x - NORMAL.x * spread).toFixed(3)} ${(center.y - NORMAL.y * spread).toFixed(3)}`)
    lower.push(`${(center.x + NORMAL.x * spread).toFixed(3)} ${(center.y + NORMAL.y * spread).toFixed(3)}`)
  }

  return [
    `M ${upper[0]}`,
    ...upper.slice(1).map((point) => `L ${point}`),
    ...lower.map((point) => `L ${point}`),
    "Z",
  ].join(" ")
}

const CoverEmojiLayer = memo(function CoverEmojiLayer() {
  return (
    <g className="cover-emoji-layer" aria-hidden="true">
      {COVER_EMOJIS.map((item, index) => (
        <g
          key={`${item.emoji}-${index}`}
          transform={`rotate(${item.rotate} ${item.x} ${item.y})`}
          style={{ opacity: item.opacity }}
        >
          <ellipse
            cx={item.x}
            cy={item.y - item.size * 0.12}
            rx={item.halo}
            ry={item.halo * 0.8}
            className="cover-emoji-backdrop"
          />
          <ellipse
            cx={item.x}
            cy={item.y - item.size * 0.16}
            rx={item.halo * 0.58}
            ry={item.halo * 0.46}
            className="cover-emoji-core"
          />
          <text x={item.x} y={item.y} fontSize={item.size} className="cover-emoji">
            {item.emoji}
          </text>
        </g>
      ))}
    </g>
  )
})

function App() {
  const [timelineProgress, setTimelineProgress] = useState(0)
  const [animationComplete, setAnimationComplete] = useState(false)
  const [introArmed, setIntroArmed] = useState(true)
  const [restartPhase, setRestartPhase] = useState("idle")
  const holdTimerRef = useRef(null)
  const collapseTimerRef = useRef(null)
  const finishTimerRef = useRef(null)

  useEffect(() => {
    if (!introArmed || animationComplete) {
      return undefined
    }

    let frameId = 0
    const start = performance.now()

    const animate = (now) => {
      const raw = clamp((now - start) / INTRO_DURATION)
      const eased = easeInOutCubic(raw)
      setTimelineProgress(eased)

      if (raw < 1) {
        frameId = requestAnimationFrame(animate)
      } else {
        setTimelineProgress(1)
        setAnimationComplete(true)
      }
    }

    frameId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frameId)
  }, [animationComplete, introArmed])

  useEffect(() => {
    return () => {
      if (holdTimerRef.current) clearTimeout(holdTimerRef.current)
      if (collapseTimerRef.current) clearTimeout(collapseTimerRef.current)
      if (finishTimerRef.current) clearTimeout(finishTimerRef.current)
    }
  }, [])

  const handleRestartIntro = () => {
    if (restartPhase !== "idle" || !animationComplete) {
      return
    }

    setRestartPhase("holding")

    holdTimerRef.current = setTimeout(() => {
      setRestartPhase("collapsing")
    }, BLACKOUT_HOLD_DURATION)

    collapseTimerRef.current = setTimeout(() => {
      setRestartPhase("expanding")
    }, BLACKOUT_HOLD_DURATION + BLACKOUT_COLLAPSE_DURATION)

    finishTimerRef.current = setTimeout(() => {
      setTimelineProgress(0)
      setAnimationComplete(false)
      setIntroArmed(false)
      setRestartPhase("idle")
    }, BLACKOUT_TOTAL_DURATION)
  }

  const handleStartIntro = () => {
    if (!introArmed && restartPhase === "idle") {
      setTimelineProgress(0)
      setAnimationComplete(false)
      setIntroArmed(true)
    }
  }

  const isRestarting = restartPhase !== "idle"

  const zipProgress = clamp(timelineProgress / PHASE_ONE_END)
  const panelExitProgress = clamp((timelineProgress - PHASE_ONE_END) / (1 - PHASE_ONE_END))
  const phaseTwoActive = timelineProgress >= PHASE_ONE_END
  const zipperVisible = !phaseTwoActive
  const overlayVisible = timelineProgress < OVERLAY_HIDE_AT
  const slider = getCenterPoint(zipProgress)
  const settledZipProgress = phaseTwoActive ? 1 : zipProgress

  const upperClipPath = useMemo(() => buildClipPath("upper", settledZipProgress), [settledZipProgress])
  const lowerClipPath = useMemo(() => buildClipPath("lower", settledZipProgress), [settledZipProgress])
  const slitPath = useMemo(() => buildSlitPath(settledZipProgress), [settledZipProgress])

  const exitEase = easeInOutCubic(panelExitProgress)
  const upperTranslate = {
    x: -NORMAL.x * PANEL_EXIT_DISTANCE * exitEase,
    y: -NORMAL.y * PANEL_EXIT_DISTANCE * exitEase,
  }
  const lowerTranslate = {
    x: NORMAL.x * PANEL_EXIT_DISTANCE * exitEase,
    y: NORMAL.y * PANEL_EXIT_DISTANCE * exitEase,
  }

  const teeth = useMemo(
    () =>
      Array.from({ length: TOOTH_COUNT }, (_, index) => {
        const t = index / (TOOTH_COUNT - 1)
        const center = getCenterPoint(t)
        const spread = getSpreadAt(t, settledZipProgress)
        const openShift = spread * 0.18
        const ahead = t >= settledZipProgress
        const interlock = ahead ? 0.08 : 0

        const upperX = center.x - NORMAL.x * (openShift + interlock)
        const upperY = center.y - NORMAL.y * (openShift + interlock)
        const lowerX = center.x + NORMAL.x * (openShift + interlock)
        const lowerY = center.y + NORMAL.y * (openShift + interlock)

        return (
          <g key={t}>
            <g transform={`translate(${upperX} ${upperY}) rotate(45)`}>
              <path
                d="
                  M -0.24 -0.4
                  L 0.16 -0.4
                  L 0.28 -0.14
                  L 0.08 0.18
                  L -0.14 0.18
                  L -0.3 -0.12
                  Z
                "
                className="zip-tooth"
              />
              <path d="M -0.12 -0.1 L 0.12 -0.1" className="zip-tooth-shine" />
            </g>

            <g transform={`translate(${lowerX} ${lowerY}) rotate(225)`}>
              <path
                d="
                  M -0.24 -0.4
                  L 0.16 -0.4
                  L 0.28 -0.14
                  L 0.08 0.18
                  L -0.14 0.18
                  L -0.3 -0.12
                  Z
                "
                className="zip-tooth"
              />
              <path d="M -0.12 -0.1 L 0.12 -0.1" className="zip-tooth-shine" />
            </g>
          </g>
        )
      }),
    [settledZipProgress],
  )

  return (
    <div className="page-shell">
      <PortfolioPage
        isVisible={!overlayVisible || isRestarting}
        isRestarting={isRestarting}
        restartPhase={restartPhase}
        onProfileDoubleClick={handleRestartIntro}
      />

      {!animationComplete && overlayVisible ? (
        <svg
          className={`zipper-scene${!introArmed ? " zipper-scene-idle" : ""}`}
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden="true"
          onClick={handleStartIntro}
        >
          <defs>
            <linearGradient id="fabricBase" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8a7088" />
              <stop offset="45%" stopColor="#5d465f" />
              <stop offset="100%" stopColor="#332637" />
            </linearGradient>

            <linearGradient id="fabricHighlight" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(255,238,246,0.24)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0)" />
            </linearGradient>

            <linearGradient id="fabricSheenUpper" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(255,235,243,0.18)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0)" />
            </linearGradient>

            <linearGradient id="fabricSheenLower" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(243,219,231,0.16)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0)" />
            </linearGradient>

            <linearGradient id="metalFill" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fff7f4" />
              <stop offset="26%" stopColor="#efc9be" />
              <stop offset="58%" stopColor="#b48b84" />
              <stop offset="100%" stopColor="#f7ddd5" />
            </linearGradient>

            <pattern id="fabricPattern" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <rect width="8" height="8" fill="transparent" />
              <path d="M 0 4 L 8 4" stroke="rgba(255,236,244,0.08)" strokeWidth="0.6" />
            </pattern>

            <filter id="fabricShadow" x="-40%" y="-40%" width="180%" height="180%">
              <feDropShadow dx="0.35" dy="0.35" stdDeviation="0.7" floodColor="#000000" floodOpacity="0.42" />
            </filter>

            <filter id="pullerShadow" x="-80%" y="-80%" width="260%" height="260%">
              <feDropShadow dx="0.45" dy="0.52" stdDeviation="0.75" floodColor="#000000" floodOpacity="0.52" />
            </filter>

            <clipPath id="upperPanelClip" clipPathUnits="userSpaceOnUse">
              <path d={upperClipPath} />
            </clipPath>

            <clipPath id="lowerPanelClip" clipPathUnits="userSpaceOnUse">
              <path d={lowerClipPath} />
            </clipPath>
          </defs>

          {slitPath ? <path d={slitPath} className="zipper-gap" /> : null}

          <g
            clipPath="url(#upperPanelClip)"
            transform={`translate(${upperTranslate.x.toFixed(3)} ${upperTranslate.y.toFixed(3)})`}
          >
            <g filter="url(#fabricShadow)">
              <rect x={PANEL_MIN} y={PANEL_MIN} width={PANEL_SIZE} height={PANEL_SIZE} className="fabric-panel" />
              <rect x={PANEL_MIN} y={PANEL_MIN} width={PANEL_SIZE} height={PANEL_SIZE} fill="url(#fabricPattern)" opacity="0.34" />
              <CoverEmojiLayer />
              <rect x={PANEL_MIN} y={PANEL_MIN} width={PANEL_SIZE} height={PANEL_SIZE} className="fabric-grain" />
              <rect
                x={PANEL_MIN}
                y={PANEL_MIN}
                width={PANEL_SIZE}
                height={PANEL_SIZE}
                className="fabric-sheen fabric-sheen-upper"
              />
            </g>

          </g>

          <g
            clipPath="url(#lowerPanelClip)"
            transform={`translate(${lowerTranslate.x.toFixed(3)} ${lowerTranslate.y.toFixed(3)})`}
            filter="url(#fabricShadow)"
          >
            <rect x={PANEL_MIN} y={PANEL_MIN} width={PANEL_SIZE} height={PANEL_SIZE} className="fabric-panel" />
            <rect x={PANEL_MIN} y={PANEL_MIN} width={PANEL_SIZE} height={PANEL_SIZE} fill="url(#fabricPattern)" opacity="0.34" />
            <CoverEmojiLayer />
            <rect x={PANEL_MIN} y={PANEL_MIN} width={PANEL_SIZE} height={PANEL_SIZE} className="fabric-grain" />
            <rect
              x={PANEL_MIN}
              y={PANEL_MIN}
              width={PANEL_SIZE}
              height={PANEL_SIZE}
              className="fabric-sheen fabric-sheen-lower"
            />
          </g>

          {zipperVisible ? (
            <>
              <path d="M 0 0 L 100 100" className="zip-track" />
              <path d="M 0 0 L 100 100" className="zip-track-inner" />
              <g className="zipper-teeth">{teeth}</g>
              <g transform={`translate(${slider.x} ${slider.y}) rotate(45)`} filter="url(#pullerShadow)">
                <path
                  d="
                    M -0.7 -1.3
                    L 0.7 -1.3
                    L 0.98 -0.22
                    L 0.28 1.14
                    L -0.28 1.14
                    L -0.98 -0.22
                    Z
                  "
                  className="puller-body"
                />
                <path
                  d="
                    M -0.26 -0.66
                    L 0.26 -0.66
                    L 0.16 0.2
                    L -0.16 0.2
                    Z
                  "
                  className="puller-core"
                />
                <ellipse cx="0" cy="1.9" rx="1.02" ry="1.46" className="puller-loop" />
                <ellipse cx="0" cy="1.9" rx="0.46" ry="0.72" className="puller-loop-cutout" />
              </g>
            </>
          ) : null}
        </svg>
      ) : null}

    </div>
  )
}

export default App
