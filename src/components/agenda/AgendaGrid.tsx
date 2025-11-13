import React from 'react';

export type Block = {
  id: string;
  date: string; // YYYY-MM-DD
  start: string; // HH:mm
  end: string;   // HH:mm
  label?: string;
};

type Props = {
  weekDays: string[]; // array de fechas YYYY-MM-DD (7 días)
  timeSlots: string[]; // HH:mm en intervalos de 30 min
  available: string[]; // ISO strings de slots disponibles
  blocks: Block[]; // bloqueos por día
  className?: string;
};

// Grid semanal con badges de Disponible/Bloqueado, inspirado en el diseño de referencia
const AgendaGrid: React.FC<Props> = ({ weekDays, timeSlots, available, blocks, className }) => {
  return (
    <div className={"min-w-[980px] " + (className ?? "") }>
      {/* Encabezados de días */}
      <div className="grid grid-cols-8 gap-px text-sm text-slate-600 mb-2 border-l border-t border-slate-200 bg-slate-200">
        <div className="bg-white text-center py-2" />
        {weekDays.map((d) => {
          const dn = new Date(d);
          const day = dn.toLocaleDateString('es-CO', { weekday: 'short' });
          const num = dn.getDate();
          return (
            <div key={d} className="bg-white text-center py-2">
              <div className="uppercase text-xs text-slate-500">{day}</div>
              <div className="font-semibold">{num}</div>
            </div>
          );
        })}
      </div>

      {/* Grid por horas con “bloques” de color */}
      <div className="border-l border-slate-200">
        {timeSlots.map((t) => (
          <div key={t} className="grid grid-cols-8 gap-px mb-px bg-slate-200">
            <div className="bg-white text-[11px] text-slate-500 px-2 py-2 text-right w-16">{t}</div>
            {weekDays.map((d) => {
              const blocked = blocks.some((b) => b.date === d && t >= b.start && t < b.end);
              const avail = available.some((iso) => iso.startsWith(d) && (() => {
                const dt = new Date(iso);
                const hh = String(dt.getHours()).padStart(2, '0');
                const mm = String(dt.getMinutes()).padStart(2, '0');
                return `${hh}:${mm}` === t;
              })());
              return (
                <div key={d + t} className="relative min-h-[44px] bg-white">
                  {avail && (
                    <div className="absolute left-1 right-1 top-1 rounded-md bg-emerald-100 text-emerald-800 text-[11px] px-2 py-1">
                      Disponible
                    </div>
                  )}
                  {blocked && (
                    <div className="absolute left-1 right-1 top-1 rounded-md bg-amber-100 text-amber-800 text-[11px] px-2 py-1">
                      Bloqueado
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AgendaGrid;

