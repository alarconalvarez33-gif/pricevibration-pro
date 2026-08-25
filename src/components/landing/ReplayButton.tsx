'use client';

/**
 * Restarts the candle animations.
 *
 * Deliberately does not re-render the charts: the SVGs are server-rendered and
 * stay that way. This only kicks the CSS animations by dropping the class,
 * forcing a reflow, and putting it back.
 */
export default function ReplayButton() {
  function replay() {
    const nodes = document.querySelectorAll<SVGElement>('[data-candles] .cndl, [data-candles] .mark');
    nodes.forEach(node => {
      const cls = node.classList.contains('cndl') ? 'cndl' : 'mark';
      node.classList.remove(cls);
      // Reading offsetWidth forces the style recalculation that makes the
      // browser treat the re-added class as a fresh animation.
      void (node as unknown as HTMLElement).getBoundingClientRect().width;
      node.classList.add(cls);
    });
  }

  return (
    <button type="button" className="replay" onClick={replay}>
      ↻ Ver las animaciones de nuevo
    </button>
  );
}
