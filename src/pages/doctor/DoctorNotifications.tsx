const DoctorNotifications = () => {
  const items = [
    { id: 'n1', text: 'Paciente canceló cita de hoy a las 15:00', read: false },
    { id: 'n2', text: 'Nueva cita confirmada para mañana 10:30', read: true },
  ];

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-xl font-semibold mb-3">Notificaciones</h1>
      <div className="space-y-2">
        {items.map((n) => (
          <div key={n.id} className={`px-3 py-2 border rounded ${n.read ? 'bg-white' : 'bg-amber-50'}`}>
            <div className="text-sm">{n.text}</div>
            <div className="text-xs text-slate-500">{n.read ? 'Leída' : 'Nueva'}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DoctorNotifications;

