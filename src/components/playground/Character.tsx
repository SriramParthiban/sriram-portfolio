"use client";

/**
 * Pure markup — every transform is driven from Playground so the walk cycle
 * and the movement loop stay on one timeline rather than fighting over state.
 */
export default function Character() {
  return (
    <svg
      viewBox="-32 0 64 104"
      className="ch-svg h-[104px] w-[64px] overflow-visible md:h-[128px] md:w-[78px]"
      aria-hidden="true"
    >
      {/* Contact shadow, outside the flip group so it never mirrors. */}
      <ellipse
        className="ch-shadow"
        cx="0"
        cy="100"
        rx="19"
        ry="4"
        fill="var(--ember)"
        opacity="0.22"
      />

      <g className="ch-flip">
        <g className="ch-bob">
          {/* Back limbs first so the front pair reads as nearer. */}
          <rect
            className="ch-arm ch-arm-b"
            x="-3.5"
            y="36"
            width="7"
            height="27"
            rx="3.5"
            fill="var(--muted)"
          />
          <rect
            className="ch-leg ch-leg-b"
            x="-4"
            y="63"
            width="8"
            height="33"
            rx="4"
            fill="var(--muted)"
          />

          <rect
            className="ch-leg ch-leg-f"
            x="-4"
            y="63"
            width="8"
            height="33"
            rx="4"
            fill="var(--bone-dim)"
          />

          <rect
            className="ch-torso"
            x="-12"
            y="31"
            width="24"
            height="36"
            rx="10"
            fill="var(--bone)"
          />

          {/* Reactor core — pulses independently of the walk cycle. */}
          <circle
            className="ch-core"
            cx="0"
            cy="46"
            r="4"
            fill="var(--ember)"
          />

          <circle className="ch-head" cx="0" cy="19" r="14" fill="var(--bone)" />
          <rect
            className="ch-visor"
            x="-1"
            y="14"
            width="14"
            height="6"
            rx="3"
            fill="var(--ink)"
          />

          <rect
            className="ch-arm ch-arm-f"
            x="-3.5"
            y="36"
            width="7"
            height="27"
            rx="3.5"
            fill="var(--bone-dim)"
          />
        </g>
      </g>
    </svg>
  );
}
