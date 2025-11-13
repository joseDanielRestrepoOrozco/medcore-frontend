import { useMemo, useState } from 'react';

const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();

const Agenda = () => {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  const firstDay = useMemo(() => new Date(year, month, 1).getDay(), [year, month]);
  const totalDays = useMemo(() => daysInMonth(year, month), [year, month]);

  const prev = () => {
    if (month === 0) { setMonth(11); setYear((y) => y - 1); } else setMonth((m) => m - 1);
  };
  const next = () => {
    if (month === 11) { setMonth(0); setYear((y) => y + 1); } else setMonth((m) => m + 1);
  };

  const monthNames = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  const weekDays = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];

  const days: Array<number | null> = [];
  for (let i = 0; i < (firstDay || 7) - 1; i++) days.push(null);
  for (let d = 1; d <= totalDays; d++) days.push(d);

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6">
      <div className="bg-white border rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <button onClick={prev} className="px-3 py-1 border rounded">⟨</button>
          <div className="font-semibold">{monthNames[month]} {year}</div>
          <button onClick={next} className="px-3 py-1 border rounded">⟩</button>
        </div>
        <div className="grid grid-cols-7 gap-2 text-center text-slate-600 mb-2">
          {weekDays.map((w) => (<div key={w} className="text-xs">{w}</div>))}
        </div>
        <div className="grid grid-cols-7 gap-2">
          {days.map((d, i) => (
            <div key={i} className={`h-20 rounded border ${d ? 'bg-slate-50' : 'bg-transparent border-dashed'}`}>
              {d && <div className="text-sm px-1 py-1">{d}</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Agenda;

