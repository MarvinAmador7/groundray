import { useEffect, useRef, useState } from "react";

// One in-view playback clock for the illustrative technical graphs.
// Callers pass a module-level timeline so its identity stays stable.
export function useGraphPlayback(times: readonly number[], duration: number) {
  const [stage, setStage] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [complete, setComplete] = useState(false);
  const [visible, setVisible] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const [reducedMotion, setReducedMotion] = useState<boolean | null>(null);
  const figureRef = useRef<HTMLElement>(null);
  const elapsedRef = useRef(0);
  const stageRef = useRef(0);
  const active =
    playing && visible && pageVisible && !complete && reducedMotion !== null;

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    function updatePreference() {
      setReducedMotion(preference.matches);
      if (preference.matches) {
        elapsedRef.current = duration;
        stageRef.current = times.length - 1;
        setStage(times.length - 1);
        setComplete(true);
        setPlaying(false);
      }
    }
    updatePreference();
    preference.addEventListener("change", updatePreference);
    return () => preference.removeEventListener("change", updatePreference);
  }, [duration, times]);

  useEffect(() => {
    // A figure taller than the screen (a chat on a phone) never reaches 45%
    // visible, so filling 40% of the screen also counts as in view.
    const observer = new IntersectionObserver(
      ([entry]) =>
        setVisible(
          entry.isIntersecting &&
            (entry.intersectionRatio >= 0.45 ||
              entry.intersectionRect.height >= window.innerHeight * 0.4),
        ),
      { threshold: [0, 0.1, 0.2, 0.3, 0.45, 0.6, 0.8, 1] },
    );
    if (figureRef.current) observer.observe(figureRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const updateVisibility = () => setPageVisible(!document.hidden);
    updateVisibility();
    document.addEventListener("visibilitychange", updateVisibility);
    return () =>
      document.removeEventListener("visibilitychange", updateVisibility);
  }, []);

  useEffect(() => {
    if (!active) return;
    let request = 0;
    let previous: number | null = null;
    function tick(now: number) {
      if (previous !== null) elapsedRef.current += now - previous;
      previous = now;
      if (elapsedRef.current >= duration) {
        stageRef.current = times.length - 1;
        setStage(times.length - 1);
        setComplete(true);
        setPlaying(false);
        return;
      }
      let next = 0;
      for (let i = 1; i < times.length; i++)
        if (elapsedRef.current >= times[i]) next = i;
      if (next !== stageRef.current) {
        stageRef.current = next;
        setStage(next);
      }
      request = requestAnimationFrame(tick);
    }
    request = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(request);
  }, [active, duration, times]);

  function replay() {
    elapsedRef.current = 0;
    stageRef.current = 0;
    setStage(0);
    setComplete(false);
    setPlaying(true);
  }

  return {
    stage,
    playing,
    complete,
    active,
    reducedMotion,
    figureRef,
    replay,
    pause: () => setPlaying(false),
    toggle: () => (complete ? replay() : setPlaying((value) => !value)),
  };
}
