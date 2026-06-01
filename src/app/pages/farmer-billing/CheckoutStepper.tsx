import { Check } from "lucide-react";
import {
  PRIMARY, PRIMARY_TINT,
  SUCCESS, SUCCESS_TINT,
  SURFACE_SUBTLE, TEXT_SOFT,
  BORDER,
} from "./tokens";

interface Props {
  step: 1 | 2 | 3 | 4;
}

const STEPS = [
  { label: "Cart" },
  { label: "Mobile" },
  { label: "Confirm" },
  { label: "Done" },
];

export function CheckoutStepper({ step }: Props) {
  return (
    <div className="flex items-start">
      {STEPS.map((s, i) => {
        const num   = i + 1;
        const done   = num < step;
        const active = num === step;

        return (
          <div key={s.label} className="flex items-start flex-1">
            {/* ── Step node (32 px per spec: stepper-dot) ───────────────── */}
            <div className="flex flex-col items-center gap-1" style={{ minWidth: 52 }}>
              <div
                className="flex items-center justify-center rounded-full transition-all"
                style={{
                  width: 32, height: 32,
                  // stepper-dot-complete / active / default
                  background: done ? SUCCESS_TINT : active ? PRIMARY : SURFACE_SUBTLE,
                  border: `2px solid ${done ? SUCCESS : active ? PRIMARY : BORDER}`,
                }}
              >
                {done ? (
                  <Check size={14} color={SUCCESS} />
                ) : (
                  <span style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: active ? "white" : TEXT_SOFT,
                  }}>
                    {num}
                  </span>
                )}
              </div>
              {/* label-sm: 10 px, 700, 0.08 em tracking, uppercase */}
              <span style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: active ? PRIMARY : done ? SUCCESS : TEXT_SOFT,
              }}>
                {s.label}
              </span>
            </div>

            {/* ── Connector track ────────────────────────────────────────── */}
            {i < STEPS.length - 1 && (
              <div style={{
                flex: 1,
                height: 2,
                marginTop: 15,
                background: done ? SUCCESS : BORDER,
                borderRadius: 1,
                transition: "background 0.3s",
              }} />
            )}
          </div>
        );
      })}
    </div>
  );
}
