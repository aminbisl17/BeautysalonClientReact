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
  onChange = () => {},
  valueData = '',
  valueOra = '',
  slotDuration = 30 // Default 30 min salon slots
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

  // Generate simple available time slots list
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

    for (let current = startMin; current + slotDuration <= endMin; current += slotDuration) {
      const slotEnd = current + slotDuration;
      const overlapsPause = !(slotEnd <= pauseStartMin || current >= pauseEndMin);

      if (!overlapsPause) {
        slots.push(minutesToTime(current));
      }
    }

    return slots;
  }, [selectedDateStr, availabilityData, slotDuration]);

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

  return (
    <div className="picker-card">
      {/* Left Column: Calendar */}
      <div className="calendar-section">
        {/* Date Header & Month Switcher */}
        <div className="calendar-header">
          <button type="button" className="nav-btn" onClick={handlePrevMonth} aria-label="Previous Month">‹</button>
          <span className="month-title">{monthYearLabel}</span>
          <button type="button" className="nav-btn" onClick={handleNextMonth} aria-label="Next Month">›</button>
        </div>

        {/* Days Header */}
        <div className="weekdays-grid">
          <span>Hën</span><span>Mar</span><span>Mër</span><span>Enj</span><span>Prem</span><span>Sht</span><span>Di</span>
        </div>

        {/* Calendar Grid */}
        <div className="days-grid">
          {calendarDays.map((day, idx) => {
            if (!day) return <div key={`empty-${idx}`} />;
            const isSelected = selectedDateStr === day.dateStr;

            return (
              <button
                key={day.dateStr}
                type="button"
                disabled={!day.isAvailable}
                onClick={() => handleDateSelect(day.dateStr)}
                className={`day-cell ${day.isAvailable ? 'available' : ''} ${isSelected ? 'selected' : ''}`}
              >
                {day.dayNumber}
              </button>
            );
          })}
        </div>
      </div>

      {/* Right Column: Vertical Time Slot Scroll */}
      <div className="time-section">
        <div className="section-header">
          <span className="section-title">Termini i Lirë</span>
          <span className="section-subtitle">
            {selectedDateStr ? 'Zgjidhni orarin tuaj' : 'Zgjidhni një datë në fillim'}
          </span>
        </div>

        {selectedDateStr ? (
          availableSlots.length > 0 ? (
            <div className="time-vertical-scroll">
              {availableSlots.map((time) => {
                const displayTime = time.substring(0, 5);
                const isSelected = selectedTimeStr === time;
                return (
                  <button
                    key={time}
                    type="button"
                    className={`time-slot-btn ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleTimeSelect(time)}
                  >
                    <span>{displayTime}</span>
                    {isSelected && <span className="check-icon">✓</span>}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="empty-state">
              S'ka termine të lira për këtë datë.
            </div>
          )
        ) : (
          <div className="select-date-prompt">
            Klikoni një datë në kalendar për të parë oraret e lira.
          </div>
        )}
      </div>
    </div>
  );
}