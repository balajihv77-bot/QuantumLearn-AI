import React from 'react';
import { CircuitRepresentation } from '../../types/quantum';

interface CircuitDiagramViewerProps {
  circuit: CircuitRepresentation;
  className?: string;
}

export const CircuitDiagramViewer: React.FC<CircuitDiagramViewerProps> = ({
  circuit,
  className = ''
}) => {
  const { numQubits, qubitLabels, gates, notes } = circuit;

  // Compute number of steps in this circuit
  const maxStep = Math.max(...gates.map((g) => g.step), 4);
  const stepWidth = 64;
  const wireHeight = 56;
  const startX = 72;
  const startY = 32;
  const totalWidth = startX + (maxStep + 1) * stepWidth + 40;
  const totalHeight = startY + (numQubits - 1) * wireHeight + 40;

  return (
    <div className={`overflow-x-auto p-4 rounded-xl bg-slate-950/80 border border-slate-800 ${className}`}>
      <svg
        width={totalWidth}
        height={totalHeight}
        className="mx-auto block select-none"
        style={{ minWidth: '420px' }}
      >
        {/* Step indicator labels at the top */}
        {Array.from({ length: maxStep }).map((_, i) => (
          <text
            key={i}
            x={startX + (i + 1) * stepWidth}
            y={16}
            fill="#64748b"
            fontSize="10"
            fontFamily="monospace"
            textAnchor="middle"
          >
            t{i + 1}
          </text>
        ))}

        {/* Horizontal Qubit Wire Lines */}
        {Array.from({ length: numQubits }).map((_, qIdx) => {
          const y = startY + qIdx * wireHeight;
          const label = qubitLabels[qIdx] || `q[${qIdx}]`;

          return (
            <g key={qIdx}>
              {/* Qubit wire label */}
              <text
                x={startX - 12}
                y={y + 4}
                fill="#22d3ee"
                fontSize="12"
                fontFamily="monospace"
                fontWeight="bold"
                textAnchor="end"
              >
                {label}
              </text>

              {/* Wire line */}
              <line
                x1={startX}
                y1={y}
                x2={startX + (maxStep + 0.6) * stepWidth}
                y2={y}
                stroke="#334155"
                strokeWidth="2"
              />
            </g>
          );
        })}

        {/* Multi-qubit CNOT vertical connection lines */}
        {gates
          .filter((g) => g.isControl && g.targetQubit !== undefined)
          .map((ctrlGate, idx) => {
            const x = startX + ctrlGate.step * stepWidth;
            const y1 = startY + ctrlGate.qubit * wireHeight;
            const y2 = startY + ctrlGate.targetQubit! * wireHeight;

            return (
              <line
                key={idx}
                x1={x}
                y1={y1}
                x2={x}
                y2={y2}
                stroke="#06b6d4"
                strokeWidth="2"
              />
            );
          })}

        {/* Gates on wires */}
        {gates.map((gate, gIdx) => {
          const x = startX + gate.step * stepWidth;
          const y = startY + gate.qubit * wireHeight;

          // If control dot
          if (gate.isControl) {
            return (
              <g key={gIdx}>
                <circle cx={x} cy={y} r="5" fill="#22d3ee" />
              </g>
            );
          }

          // If target XOR symbol (CNOT target)
          if (gate.symbol === '⊕') {
            return (
              <g key={gIdx}>
                <circle cx={x} cy={y} r="12" fill="#0f172a" stroke="#22d3ee" strokeWidth="2" />
                <line x1={x - 8} y1={y} x2={x + 8} y2={y} stroke="#22d3ee" strokeWidth="2" />
                <line x1={x} y1={y - 8} x2={x} y2={y + 8} stroke="#22d3ee" strokeWidth="2" />
              </g>
            );
          }

          // Standard rectangular gate box
          const boxSize = 28;
          return (
            <g key={gIdx}>
              <rect
                x={x - boxSize / 2}
                y={y - boxSize / 2}
                width={boxSize}
                height={boxSize}
                rx="6"
                fill="#0284c7"
                stroke="#38bdf8"
                strokeWidth="1.5"
              />
              <text
                x={x}
                y={y + 4}
                fill="#ffffff"
                fontSize="11"
                fontFamily="monospace"
                fontWeight="bold"
                textAnchor="middle"
              >
                {gate.symbol}
              </text>
            </g>
          );
        })}
      </svg>

      {notes && (
        <div className="text-[11px] text-slate-400 font-mono text-center mt-3 pt-2 border-t border-slate-900">
          * {notes}
        </div>
      )}
    </div>
  );
};
