import { useCallback, useEffect, useRef, useState } from "react";
import type { MutableRefObject, Ref } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import { AnimatePresence, motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { MathUtils } from "three";
import type { Group, Mesh, MeshStandardMaterial } from "three";

export type SectionId = "top" | "about" | "architecture" | "work" | "contact";

interface Props {
  theme: "dark" | "light";
  section: SectionId;
  thinking: boolean;
}

type Pos = "welcome" | "docked" | "off" | "peekin";
type Act = "idle" | "surprised" | "running";
type Pointer = { x: number; y: number };

const GLOW = "#34d399";
const MATTE = { roughness: 0.8, metalness: 0.05 } as const;
const SECTION_ORDER: SectionId[] = ["top", "about", "architecture", "work", "contact"];

const WELCOME_LINE = "Welcome! Glad you stopped by. Let me show you around...";
const SECTION_LINES: Partial<Record<SectionId, string>> = {
  about: "Real numbers from shipped work. Take a look.",
  architecture: "This is the stack behind the interfaces.",
  work: "Click any project to inspect the architecture!",
  contact: "Ready to build something great together?",
};
const CLICK_LINES = ["Whoa! Catch me if you can! 💨", "Hey, that tickles! Running away!", "Too slow! 😄"];
const RETURN_LINE = "Okay, the coast is clear. 😅";

type Axis = "x" | "y" | "z";
function rot(o: Group | null, axis: Axis, target: number, lambda: number, dt: number) {
  if (o) o.rotation[axis] = MathUtils.damp(o.rotation[axis], target, lambda, dt);
}

/* ------------------------------ 3D parts ------------------------------ */

interface LimbProps {
  side: 1 | -1;
  upper: Ref<Group>;
  lower: Ref<Group>;
  body: string;
  trim: string;
}

function Arm({ side, upper, lower, body, trim }: LimbProps) {
  return (
    <group ref={upper} position={[side * 0.78, 0.36, 0]}>
      <mesh>
        <sphereGeometry args={[0.17, 24, 24]} />
        <meshStandardMaterial color={trim} {...MATTE} />
      </mesh>
      <RoundedBox args={[0.17, 0.42, 0.17]} radius={0.07} position={[0, -0.26, 0]}>
        <meshStandardMaterial color={body} {...MATTE} />
      </RoundedBox>
      <group ref={lower} position={[0, -0.48, 0]}>
        <mesh>
          <sphereGeometry args={[0.095, 16, 16]} />
          <meshStandardMaterial color={trim} {...MATTE} />
        </mesh>
        <RoundedBox args={[0.15, 0.36, 0.15]} radius={0.06} position={[0, -0.2, 0]}>
          <meshStandardMaterial color={body} {...MATTE} />
        </RoundedBox>
        <group position={[0, -0.44, 0]}>
          <mesh>
            <sphereGeometry args={[0.13, 24, 24]} />
            <meshStandardMaterial color={body} {...MATTE} />
          </mesh>
          <mesh position={[-side * 0.1, 0.03, 0.07]} scale={[1, 1.3, 1]}>
            <sphereGeometry args={[0.05, 12, 12]} />
            <meshStandardMaterial color={body} {...MATTE} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

function Leg({ side, upper, lower, body, trim }: LimbProps) {
  return (
    <group ref={upper} position={[side * 0.25, -0.78, 0]}>
      <RoundedBox args={[0.2, 0.34, 0.22]} radius={0.08} position={[0, -0.17, 0]}>
        <meshStandardMaterial color={trim} {...MATTE} />
      </RoundedBox>
      <group ref={lower} position={[0, -0.34, 0]}>
        <RoundedBox args={[0.18, 0.3, 0.2]} radius={0.07} position={[0, -0.15, 0]}>
          <meshStandardMaterial color={body} {...MATTE} />
        </RoundedBox>
        <RoundedBox args={[0.26, 0.12, 0.38]} radius={0.05} position={[0, -0.33, 0.07]}>
          <meshStandardMaterial color={trim} {...MATTE} />
        </RoundedBox>
        <mesh position={[0, -0.4, 0.07]}>
          <cylinderGeometry args={[0.11, 0.11, 0.01, 24]} />
          <meshStandardMaterial color={GLOW} emissive={GLOW} emissiveIntensity={2} />
        </mesh>
      </group>
    </group>
  );
}

/* ------------------------------ Robot ------------------------------ */

interface RobotProps {
  theme: "dark" | "light";
  pos: Pos;
  act: Act;
  speaking: boolean;
  thinking: boolean;
  sectionIndex: number;
  pointer: MutableRefObject<Pointer>;
}

function Robot({ theme, pos, act, speaking, thinking, sectionIndex, pointer }: RobotProps) {
  const clock = useThree((s) => s.clock);
  const root = useRef<Group>(null);
  const bob = useRef<Group>(null);
  const head = useRef<Group>(null);
  const eyes = useRef<Group>(null);
  const armR = useRef<Group>(null);
  const foreR = useRef<Group>(null);
  const armL = useRef<Group>(null);
  const foreL = useRef<Group>(null);
  const legR = useRef<Group>(null);
  const shinR = useRef<Group>(null);
  const legL = useRef<Group>(null);
  const shinL = useRef<Group>(null);
  const smile = useRef<Group>(null);
  const mouthO = useRef<Mesh>(null);
  const wave = useRef<Group>(null);
  const bars = useRef<Mesh[]>([]);
  const coreMat = useRef<MeshStandardMaterial>(null);
  const start = useRef<number | null>(null);
  const jumpStart = useRef(0);

  const body = theme === "dark" ? "#e7e5e4" : "#1d1d22";
  const trim = theme === "dark" ? "#9a9aa3" : "#4b4b55";

  useEffect(() => {
    if (act === "surprised") jumpStart.current = clock.elapsedTime;
  }, [act, clock]);

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    const d = Math.min(dt, 0.05);
    if (start.current === null) start.current = t;
    const tg = t - start.current;

    const running = act === "running";
    const surprised = act === "surprised";
    const welcome = pos === "welcome";
    const peekin = pos === "peekin";
    const ph = t * 16;
    const sw = Math.sin(ph);

    const waving = welcome && tg > 1.1 && tg < 4.4;
    const bow = welcome && tg > 0.9 && tg < 2.7 ? Math.sin(((tg - 0.9) / 1.8) * Math.PI) * 0.5 : 0;

    const ax = welcome ? 0 : 0.8;
    const ay = welcome ? -0.5 : -0.7;
    const dx = pointer.current.x - ax;
    const dy = pointer.current.y - ay;

    // body orientation
    if (root.current) {
      const target = running ? Math.PI / 2 : peekin ? -0.5 : welcome ? 0 : -0.2 + MathUtils.clamp(dx * 0.15, -0.3, 0.15);
      root.current.rotation.y = MathUtils.damp(root.current.rotation.y, target, running ? 12 : 5, d);
    }

    // float, jump, run bounce, lean
    if (bob.current) {
      const dj = t - jumpStart.current;
      const jump = surprised && dj < 0.4 ? Math.sin((dj / 0.4) * Math.PI) * 0.4 : 0;
      bob.current.position.y = Math.sin(t * 1.4) * 0.07 + jump + (running ? Math.abs(sw) * 0.14 : 0);
      rot(bob.current, "x", running ? 0.35 : bow * 0.35, 8, d);
    }

    // head
    if (head.current) {
      const sectionPitch = (0.5 - sectionIndex / (SECTION_ORDER.length - 1)) * 0.2;
      const nod = thinking ? Math.sin(t * 5) * 0.12 : 0;
      const talk = speaking ? Math.sin(t * 9) * 0.035 : 0;
      let yaw = MathUtils.clamp(dx * 0.5, -0.8, 0.8) - (welcome ? 0 : 0.1);
      let pitch = -dy * 0.2 + sectionPitch + nod + talk + bow;
      if (peekin) yaw = Math.sin(t * 2.4) * 0.75;
      if (running) {
        yaw = 0;
        pitch = 0.05;
      }
      if (surprised) pitch -= 0.15;
      const tilt = welcome ? bow * 0.35 : 0;
      rot(head.current, "y", yaw, 6, d);
      rot(head.current, "x", pitch, 8, d);
      rot(head.current, "z", tilt, 6, d);
    }

    // eyes: blink, happy squint, surprise widen, gaze
    if (eyes.current) {
      const blink = t % 4.2 > 4.05;
      const squint = welcome || speaking;
      let sx = 1;
      let sy = 1;
      if (surprised) {
        sx = 1.35;
        sy = 1.5;
      } else if (blink) sy = 0.08;
      else if (squint) {
        sx = 1.1;
        sy = 0.5;
      } else if (thinking) sy = 0.75 + Math.sin(t * 5) * 0.2;
      eyes.current.scale.x = MathUtils.damp(eyes.current.scale.x, sx, 30, d);
      eyes.current.scale.y = MathUtils.damp(eyes.current.scale.y, sy, 30, d);
      eyes.current.position.x = MathUtils.damp(eyes.current.position.x, MathUtils.clamp(dx * 0.1, -0.1, 0.1), 8, d);
      eyes.current.position.y = MathUtils.damp(eyes.current.position.y, 0.06 + MathUtils.clamp(dy * 0.03, -0.03, 0.03), 8, d);
    }

    // LED mouth variants
    if (smile.current) smile.current.visible = !surprised && !speaking;
    if (mouthO.current) mouthO.current.visible = surprised;
    if (wave.current) wave.current.visible = speaking && !surprised;
    if (speaking) {
      bars.current.forEach((b, i) => {
        if (b) b.scale.y = 0.4 + Math.abs(Math.sin(t * 12 + i * 1.3)) * 2.4;
      });
    }

    // arms
    rot(armR.current, "x", running ? -sw * 1.1 : 0, 25, d);
    rot(armR.current, "z", waving ? 2.5 + Math.sin(t * 12) * 0.3 : running ? 0.18 : 0.14 + Math.sin(t * 1.4) * 0.03, 10, d);
    rot(foreR.current, "x", running ? -0.9 : -0.1, 15, d);
    rot(foreR.current, "z", waving ? Math.sin(t * 12) * 0.5 : 0, 15, d);
    rot(armL.current, "x", running ? sw * 1.1 : 0, 25, d);
    rot(armL.current, "z", running ? -0.18 : -0.14 - Math.sin(t * 1.4) * 0.03, 10, d);
    rot(foreL.current, "x", running ? -0.9 : -0.1, 15, d);

    // legs
    rot(legR.current, "x", running ? sw * 0.9 : Math.sin(t * 1.4) * 0.05, 25, d);
    rot(legL.current, "x", running ? -sw * 0.9 : -Math.sin(t * 1.4) * 0.05, 25, d);
    rot(shinR.current, "x", running ? Math.max(0, Math.sin(ph + 1.3)) * 1.3 : 0.05, 25, d);
    rot(shinL.current, "x", running ? Math.max(0, Math.sin(ph + 1.3 + Math.PI)) * 1.3 : 0.05, 25, d);

    if (coreMat.current) coreMat.current.emissiveIntensity = 1.8 + Math.sin(t * 2.2) * 0.6 + (speaking ? 0.6 : 0);
  });

  return (
    <group ref={root}>
      <group ref={bob}>
        {/* torso */}
        <RoundedBox args={[1.1, 1.1, 0.72]} radius={0.3} smoothness={4}>
          <meshStandardMaterial color={body} {...MATTE} />
        </RoundedBox>
        <group position={[0, 0.05, 0.37]}>
          <mesh>
            <torusGeometry args={[0.14, 0.022, 12, 32]} />
            <meshStandardMaterial color={trim} {...MATTE} />
          </mesh>
          <mesh>
            <sphereGeometry args={[0.07, 24, 24]} />
            <meshStandardMaterial ref={coreMat} color={GLOW} emissive={GLOW} emissiveIntensity={2} />
          </mesh>
        </group>
        <RoundedBox args={[0.82, 0.3, 0.55]} radius={0.12} position={[0, -0.64, 0]}>
          <meshStandardMaterial color={trim} {...MATTE} />
        </RoundedBox>
        <mesh position={[0, 0.6, 0]}>
          <cylinderGeometry args={[0.13, 0.17, 0.2, 24]} />
          <meshStandardMaterial color={trim} {...MATTE} />
        </mesh>

        <Arm side={1} upper={armR} lower={foreR} body={body} trim={trim} />
        <Arm side={-1} upper={armL} lower={foreL} body={body} trim={trim} />
        <Leg side={1} upper={legR} lower={shinR} body={body} trim={trim} />
        <Leg side={-1} upper={legL} lower={shinL} body={body} trim={trim} />

        {/* head */}
        <group ref={head} position={[0, 0.85, 0]}>
          <RoundedBox args={[1.05, 0.82, 0.86]} radius={0.3} smoothness={4} position={[0, 0.42, 0]}>
            <meshStandardMaterial color={body} {...MATTE} />
          </RoundedBox>

          {([-1, 1] as const).map((s) => (
            <group key={`ear${s}`} position={[s * 0.57, 0.42, 0]}>
              <mesh rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.15, 0.15, 0.12, 24]} />
                <meshStandardMaterial color={trim} {...MATTE} />
              </mesh>
              <mesh position={[s * 0.07, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.08, 0.08, 0.03, 24]} />
                <meshStandardMaterial color={GLOW} emissive={GLOW} emissiveIntensity={1.6} />
              </mesh>
            </group>
          ))}

          {([-1, 1] as const).map((s) => (
            <group key={`ant${s}`} position={[s * 0.2, 0.82, 0]} rotation={[0, 0, -s * 0.25]}>
              <mesh position={[0, 0.17, 0]}>
                <cylinderGeometry args={[0.014, 0.014, 0.34, 12]} />
                <meshStandardMaterial color={trim} {...MATTE} />
              </mesh>
              <mesh position={[0, 0.36, 0]}>
                <sphereGeometry args={[0.05, 16, 16]} />
                <meshStandardMaterial color={GLOW} emissive={GLOW} emissiveIntensity={s === 1 ? 2.4 : 1.2} />
              </mesh>
            </group>
          ))}

          {/* visor: eyes and LED mouth are children of this group */}
          <group position={[0, 0.44, 0.4]}>
            <RoundedBox args={[0.88, 0.52, 0.08]} radius={0.18} smoothness={4}>
              <meshStandardMaterial color="#09090b" roughness={0.15} metalness={0.7} />
            </RoundedBox>

            <group ref={eyes} position={[0, 0.06, 0.05]}>
              {([-1, 1] as const).map((s) => (
                <mesh key={`eye${s}`} position={[s * 0.2, 0, 0]} scale={[1, 1, 0.45]}>
                  <sphereGeometry args={[0.085, 24, 24]} />
                  <meshStandardMaterial color={GLOW} emissive={GLOW} emissiveIntensity={2.6} />
                </mesh>
              ))}
            </group>

            <group position={[0, -0.14, 0.05]}>
              <group ref={smile}>
                <mesh position={[0, 0.06, 0]} rotation={[0, 0, Math.PI]}>
                  <torusGeometry args={[0.1, 0.016, 8, 28, Math.PI]} />
                  <meshStandardMaterial color={GLOW} emissive={GLOW} emissiveIntensity={2.4} />
                </mesh>
              </group>
              <mesh ref={mouthO} visible={false}>
                <torusGeometry args={[0.055, 0.015, 8, 24]} />
                <meshStandardMaterial color={GLOW} emissive={GLOW} emissiveIntensity={2.6} />
              </mesh>
              <group ref={wave} visible={false}>
                {[0, 1, 2, 3, 4].map((i) => (
                  <mesh
                    key={`bar${i}`}
                    ref={(m) => {
                      if (m) bars.current[i] = m;
                    }}
                    position={[(i - 2) * 0.065, 0, 0]}
                  >
                    <boxGeometry args={[0.035, 0.04, 0.02]} />
                    <meshStandardMaterial color={GLOW} emissive={GLOW} emissiveIntensity={2.6} />
                  </mesh>
                ))}
              </group>
            </group>
          </group>
        </group>
      </group>
    </group>
  );
}

/* ------------------------------ Speech bubble ------------------------------ */

function SpeechBubble({ text }: { text: string }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    setCount(0);
    const id = window.setInterval(() => {
      setCount((c) => {
        if (c >= text.length) {
          window.clearInterval(id);
          return c;
        }
        return c + 1;
      });
    }, 26);
    return () => window.clearInterval(id);
  }, [text]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 6, scale: 0.96 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className="relative rounded-2xl border border-[var(--line)] bg-[var(--glass)] px-4 py-2.5 text-sm leading-snug text-[var(--fg)] shadow-xl backdrop-blur-xl"
    >
      <span>{text.slice(0, count)}</span>
      <span className="invisible">{text.slice(count)}</span>
      <span className="absolute -bottom-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 border-b border-r border-[var(--line)] bg-[var(--glass)]" />
    </motion.div>
  );
}

/* ------------------------------ Companion ------------------------------ */

export default function RobotCompanion({ theme, section, thinking }: Props) {
  const reduced = useReducedMotion();
  const [vw, setVw] = useState(() => (typeof window === "undefined" ? 1280 : window.innerWidth));
  const [pos, setPosState] = useState<Pos>(reduced ? "docked" : "welcome");
  const [act, setAct] = useState<Act>("idle");
  const [busy, setBusyState] = useState(false);
  const [bubble, setBubble] = useState<{ id: number; text: string } | null>(null);

  const pointer = useRef<Pointer>({ x: 0.8, y: -0.7 });
  const posRef = useRef<Pos>(reduced ? "docked" : "welcome");
  const busyRef = useRef(false);
  const bubbleOn = useRef(false);
  const bubbleId = useRef(0);
  const bubbleTimer = useRef<number | null>(null);
  const timers = useRef<number[]>([]);
  const visited = useRef<Set<SectionId>>(new Set());
  const lastThink = useRef(0);
  const clicks = useRef(0);

  const small = vw < 768;
  const size = small ? { w: 180, h: 260 } : { w: 240, h: 340 };
  const welcomeX = -(vw / 2 - size.w / 2 - 24);

  const { scrollYProgress } = useScroll();
  const floatY = useSpring(useTransform(scrollYProgress, [0, 1], [0, -80]), { stiffness: 60, damping: 20 });

  const go = useCallback((p: Pos) => {
    posRef.current = p;
    setPosState(p);
  }, []);
  const setBusy = useCallback((b: boolean) => {
    busyRef.current = b;
    setBusyState(b);
  }, []);
  const later = useCallback((ms: number, fn: () => void) => {
    timers.current.push(window.setTimeout(fn, ms));
  }, []);

  const say = useCallback((text: string | null, ms = 3500) => {
    if (bubbleTimer.current !== null) window.clearTimeout(bubbleTimer.current);
    bubbleTimer.current = null;
    if (text === null) {
      bubbleOn.current = false;
      setBubble(null);
      return;
    }
    bubbleOn.current = true;
    bubbleId.current += 1;
    setBubble({ id: bubbleId.current, text });
    bubbleTimer.current = window.setTimeout(() => {
      bubbleOn.current = false;
      setBubble(null);
    }, ms);
  }, []);

  const dockFromWelcome = useCallback(() => {
    if (posRef.current !== "welcome") return;
    go("docked");
    say(null);
  }, [go, say]);

  // viewport size + pointer tracking
  useEffect(() => {
    const onResize = () => setVw(window.innerWidth);
    const onMove = (e: PointerEvent) => {
      pointer.current = { x: (e.clientX / window.innerWidth) * 2 - 1, y: -((e.clientY / window.innerHeight) * 2 - 1) };
    };
    window.addEventListener("resize", onResize);
    window.addEventListener("pointermove", onMove);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  // grand host welcome
  useEffect(() => {
    if (reduced) return;
    const onScroll = () => {
      if (window.scrollY > 24) dockFromWelcome();
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    later(500, () => {
      if (posRef.current === "welcome") say(WELCOME_LINE, 4000);
    });
    later(4500, dockFromWelcome);
    return () => window.removeEventListener("scroll", onScroll);
  }, [reduced, later, say, dockFromWelcome]);

  useEffect(
    () => () => {
      timers.current.forEach((id) => window.clearTimeout(id));
      if (bubbleTimer.current !== null) window.clearTimeout(bubbleTimer.current);
    },
    []
  );

  // contextual lines when a section is reached for the first time
  useEffect(() => {
    if (posRef.current !== "docked" || busyRef.current) return;
    const line = SECTION_LINES[section];
    if (!line || visited.current.has(section)) return;
    visited.current.add(section);
    say(line);
  }, [section, say]);

  // hover / modal reaction
  useEffect(() => {
    if (!thinking) return;
    const now = Date.now();
    if (posRef.current !== "docked" || busyRef.current || bubbleOn.current || now - lastThink.current < 8000) return;
    lastThink.current = now;
    say("Analyzing case study...", 2500);
  }, [thinking, say]);

  // click: surprise, run away, shy return
  const onClick = () => {
    if (busyRef.current) return;
    const line = CLICK_LINES[clicks.current % CLICK_LINES.length];
    clicks.current += 1;
    if (reduced) {
      say(line, 2500);
      return;
    }
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
    setBusy(true);
    setAct("surprised");
    say(line, 2200);
    later(350, () => {
      setAct("running");
      go("off");
    });
    later(1450, () => setAct("idle"));
    later(2500, () => go("peekin"));
    later(4300, () => {
      go("docked");
      say(RETURN_LINE, 2500);
    });
    later(5200, () => setBusy(false));
  };

  const peek = (section === "work" || section === "contact") && !thinking && !bubble && pos === "docked" && act === "idle";

  const target =
    pos === "welcome"
      ? { x: welcomeX, y: -8, scale: 1.18 }
      : pos === "off"
        ? { x: size.w + 180, y: 0, scale: 1 }
        : pos === "peekin"
          ? { x: size.w * 0.6, y: 0, scale: 1 }
          : { x: peek ? size.w * 0.12 : 0, y: peek ? size.h * 0.66 : 0, scale: 1 };

  const transition =
    pos === "off"
      ? { type: "tween" as const, duration: 1.05, ease: "easeIn" as const }
      : pos === "peekin"
        ? { type: "tween" as const, duration: 0.8, ease: "easeOut" as const }
        : { type: "spring" as const, stiffness: 90, damping: 16 };

  const speaking = bubble !== null;

  return (
    <motion.div
      style={{ y: floatY, width: size.w, height: size.h }}
      className="pointer-events-none fixed bottom-6 right-6 z-[60]"
    >
      <motion.div
        className="relative h-full w-full"
        style={{ transformOrigin: "50% 100%" }}
        initial={reduced ? false : { x: welcomeX, y: size.h + 80, scale: 1.18 }}
        animate={target}
        transition={transition}
      >
        <div className="pointer-events-none absolute bottom-[calc(100%-8px)] left-1/2 w-max max-w-[220px] -translate-x-1/2 pb-2">
          <AnimatePresence mode="wait">{bubble && <SpeechBubble key={bubble.id} text={bubble.text} />}</AnimatePresence>
        </div>

        <Canvas
          camera={{ position: [0, 0.35, 7.5], fov: 32 }}
          gl={{ alpha: true, antialias: true }}
          dpr={[1, 2]}
          style={{ pointerEvents: "none" }}
        >
          <ambientLight intensity={0.85} />
          <directionalLight position={[3, 4, 5]} intensity={1.6} />
          <directionalLight position={[-4, 1, 2]} intensity={0.5} color="#8bffd0" />
          <Robot
            theme={theme}
            pos={pos}
            act={act}
            speaking={speaking}
            thinking={thinking}
            sectionIndex={SECTION_ORDER.indexOf(section)}
            pointer={pointer}
          />
        </Canvas>

        <button
          aria-label="Say hi to the robot"
          onClick={onClick}
          disabled={busy}
          className="pointer-events-auto absolute inset-x-[18%] inset-y-[8%] cursor-pointer rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-400 disabled:pointer-events-none"
        />
      </motion.div>
    </motion.div>
  );
}