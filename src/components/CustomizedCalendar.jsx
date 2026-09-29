import React, { useState, useMemo, useEffect } from 'react';
import '../css/CustomizedCalendar.css';

// --- Time Helpers ---
const timeToMinutes = (timeStr) => {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
};

const minutesToTime = (totalMinutes) => {
  const h = Math.floor(totalMinutes / 60).toString().padStart(2, '0');
  const m = (totalMinutes % 60).toString().padStart(2, '0');
  return `${h}:${m}:00`;
};

const formatDateString = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export default function AppointmentDateTimePicker({
  availabilityData = { dates: [] },
  unavailableDates = [],
  onChange = () => {},
  valueData = '',
  valueOra = '',
  slotDuration = 30
}) {

  const [currentMonth, setCurrentMonth] = useState(() => {
    return valueData ? new Date(`${valueData}T00:00:00`) : new Date();
  });
  const [selectedDateStr, setSelectedDateStr] = useState(valueData);
  const [selectedTimeStr, setSelectedTimeStr] = useState(
    valueOra ? `${valueOra}:00` : ''
  );

  useEffect(() => {
    setSelectedDateStr(valueData || '');
  }, [valueData]);

  useEffect(() => {
    setSelectedTimeStr(valueOra ? `${valueOra}:00` : '');
  }, [valueOra]);

  const getBackendDayOfWeek = (dateObj) => {
    const jsDay = dateObj.getDay();
    return jsDay === 0 ? 7 : jsDay;
  };

  const getRuleForDate = (dateObj) => {
    if (!availabilityData?.dates || !Array.isArray(availabilityData.dates)) return null;
    const dateStr = formatDateString(dateObj);
    const dayOfWeek = getBackendDayOfWeek(dateObj);

    for (const range of availabilityData.dates) {
      if (dateStr >= range.start_date && dateStr <= range.end_date) {
        const detail = range.availabilityDetails?.find(
          (d) => d.day_of_week === dayOfWeek
        );
        if (detail) return detail;
      }
    }
    return null;
  };

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    let startDayOfWeek = firstDayOfMonth.getDay() - 1; // Mon = 0
    if (startDayOfWeek === -1) startDayOfWeek = 6;

    const days = [];
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null);
    }

    for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
      const d = new Date(year, month, day);
      const isAvailable = !!getRuleForDate(d);
      days.push({
        dateObj: d,
        dateStr: formatDateString(d),
        dayNumber: day,
        isAvailable
      });
    }

    return days;
  }, [currentMonth, availabilityData]);


  const availableSlots = useMemo(() => {
    if (!selectedDateStr) return [];

    const dateObj = new Date(`${selectedDateStr}T00:00:00`);
    const rule = getRuleForDate(dateObj);

    if (!rule) return [];

    const startMin = timeToMinutes(rule.start_time);
    const endMin = timeToMinutes(rule.end_time);
    const pauseStartMin = timeToMinutes(rule.pause_start);
    const pauseEndMin = timeToMinutes(rule.pause_end);

    const slots = [];

    for (
      let current = startMin;
      current + slotDuration <= endMin;
      current += 5
    ) {
      const slotEnd = current + slotDuration;

      const overlapsPause =
        !(slotEnd <= pauseStartMin || current >= pauseEndMin);

      if (!overlapsPause) {
        const time = minutesToTime(current);

        const isUnavailable = unavailableDates.some((unavailable) => {
          return unavailable === `${selectedDateStr}T${time}`;
        });

        slots.push({
          time,
          unavailable: isUnavailable
        });
      }
    }

    return slots;
  }, [
    selectedDateStr,
    availabilityData,
    unavailableDates,
    slotDuration
  ]);

  // Handlers
  const handleDateSelect = (dateStr) => {
    setSelectedDateStr(dateStr);
    setSelectedTimeStr('');
    onChange({ data: dateStr, ora: '', dataCaktimit: '' });
  };

  const handleTimeSelect = (timeStr) => {
    setSelectedTimeStr(timeStr);
    const oraFormatted = timeStr.substring(0, 5);
    onChange({
      data: selectedDateStr,
      ora: oraFormatted,
      dataCaktimit: `${selectedDateStr}T${timeStr}`
    });
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const monthYearLabel = currentMonth.toLocaleString('sq-AL', { month: 'long', year: 'numeric' });

  // --- Display-only helpers (UI) ---
  const monthName = currentMonth.toLocaleString('sq-AL', { month: 'long' });
  const yearNumber = currentMonth.getFullYear();
  const todayStr = formatDateString(new Date());

  const selectedDateLabel = selectedDateStr
    ? new Date(`${selectedDateStr}T00:00:00`).toLocaleDateString('sq-AL', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
      })
    : '';

  const slotGroups = [
    { key: 'morning', label: 'Paradite', slots: [] },
    { key: 'afternoon', label: 'Pasdite', slots: [] },
    { key: 'evening', label: 'Mbrëmje', slots: [] }
  ];
  availableSlots.forEach((slot) => {
    const hour = parseInt(slot.time.substring(0, 2), 10);
    if (hour < 12) slotGroups[0].slots.push(slot);
    else if (hour < 17) slotGroups[1].slots.push(slot);
    else slotGroups[2].slots.push(slot);
  });

  return (
    <div className="pk-card">
      <div className="picker-body">

        {/* Calendar */}
        <div className="pk-calendar-section">
          <div className="picker-eyebrow">
            <i />
            <span>ZGJIDHNI DATËN</span>
          </div>

          <div className="pk-calendar-header">
            <button type="button" className="pk-nav-btn" onClick={handlePrevMonth} aria-label="Muaji i kaluar">‹</button>
            <span className="pk-month-title" aria-live="polite" aria-label={monthYearLabel}>
              {monthName} <em>{yearNumber}</em>
            </span>
            <button type="button" className="pk-nav-btn" onClick={handleNextMonth} aria-label="Muaji tjetër">›</button>
          </div>

          <div className="pk-weekdays-grid">
            <span>Hën</span><span>Mar</span><span>Mër</span><span>Enj</span><span>Pre</span><span>Sht</span><span>Die</span>
          </div>

          <div className="pk-days-grid">
            {calendarDays.map((day, idx) => {
              if (!day) return <div key={`empty-${idx}`} />;
              const isSelected = selectedDateStr === day.dateStr;
              const isToday = day.dateStr === todayStr;

              return (
                <button
                  key={day.dateStr}
                  type="button"
                  disabled={!day.isAvailable}
                  onClick={() => handleDateSelect(day.dateStr)}
                  aria-pressed={isSelected}
                  className={`pk-day-cell ${day.isAvailable ? 'available' : ''} ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''}`}
                >
                  {day.dayNumber}
                </button>
              );
            })}
          </div>

          <div className="calendar-legend">
            <span><i className="legend-dot available" />I lirë</span>
            <span><i className="legend-dot selected" />I zgjedhur</span>
          </div>
        </div>

        {/* Time slots */}
        <div className="pk-time-section">
          <div className="picker-eyebrow">
            <i />
            <span>ZGJIDHNI ORARIN</span>
          </div>

          <div className="pk-section-header">
            <span className="pk-section-title">Termini i <em>lirë</em></span>
            <span className="pk-section-subtitle">
              {selectedDateStr ? selectedDateLabel : 'Zgjidhni një datë në fillim'}
            </span>
          </div>

          {selectedDateStr ? (
            availableSlots.length > 0 ? (
              <div className="pk-time-vertical-scroll">
                {slotGroups
                  .filter((group) => group.slots.length > 0)
                  .map((group) => (
                    <div className="time-group" key={group.key}>
                      <span className="time-group-label">{group.label}</span>
                      <div className="time-grid">
                        {group.slots.map(({ time, unavailable }) => {
                          const displayTime = time.substring(0, 5);
                          const isSelected = selectedTimeStr === time;

                          return (
                            <button
                              key={time}
                              type="button"
                              disabled={unavailable}
                              aria-pressed={isSelected}
                              className={`pk-time-slot-btn ${isSelected ? 'selected' : ''} ${unavailable ? 'unavailable' : ''}`}
                              onClick={() => {
                                if (!unavailable) {
                                  handleTimeSelect(time);
                                }
                              }}
                            >
                              <span className="time-text">{displayTime}</span>

                              {unavailable && (
                                <span className="pk-unavailable-label">Zënë</span>
                              )}

                              {isSelected && !unavailable && (
                                <span className="pk-check-icon">✓</span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="pk-empty-state">
                <span className="empty-symbol">◌</span>
                S'ka termine të lira për këtë datë.
              </div>
            )
          ) : (
            <div className="pk-select-date-prompt">
              <span className="empty-symbol">◇</span>
              Klikoni një datë në kalendar për të parë oraret e lira.
            </div>
          )}
        </div>
      </div>

      {/* Summary */}
      <div className={`picker-summary ${selectedDateStr && selectedTimeStr ? 'ready' : ''}`}>
        <div className="summary-icon">{selectedDateStr && selectedTimeStr ? '✓' : '◇'}</div>
        <div className="summary-text">
          <span className="summary-label">Termini juaj</span>
          {selectedDateStr && selectedTimeStr ? (
            <strong>
              {selectedDateLabel}, ora {selectedTimeStr.substring(0, 5)}
            </strong>
          ) : (
            <strong className="muted">Zgjidhni datën dhe orarin</strong>
          )}
        </div>
      </div>
    </div>
  );
}