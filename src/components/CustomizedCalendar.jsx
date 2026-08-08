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
  slotDuration = 15
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

    let startDayOfWeek = firstDayOfMonth.getDay() - 1; // Align to Mon = 0
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

  // Generate categorized slots
  const groupedTimeSlots = useMemo(() => {
    if (!selectedDateStr) return { morning: [], afternoon: [], evening: [] };

    const dateObj = new Date(`${selectedDateStr}T00:00:00`);
    const rule = getRuleForDate(dateObj);
    if (!rule) return { morning: [], afternoon: [], evening: [] };

    const startMin = timeToMinutes(rule.start_time);
    const endMin = timeToMinutes(rule.end_time);
    const pauseStartMin = timeToMinutes(rule.pause_start);
    const pauseEndMin = timeToMinutes(rule.pause_end);

    const morning = [];
    const afternoon = [];
    const evening = [];

    for (let current = startMin; current + slotDuration <= endMin; current += slotDuration) {
      const slotEnd = current + slotDuration;
      const overlapsPause = !(slotEnd <= pauseStartMin || current >= pauseEndMin);

      if (!overlapsPause) {
        const timeStr = minutesToTime(current);
        const hour = Math.floor(current / 60);

        if (hour < 12) morning.push(timeStr);
        else if (hour < 17) afternoon.push(timeStr);
        else evening.push(timeStr);
      }
    }

    return { morning, afternoon, evening };
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
    <div className="picker-container">
      {/* Calendar Header */}
      <div className="calendar-header">
        <button type="button" className="nav-btn" onClick={handlePrevMonth} aria-label="Previous Month">‹</button>
        <span className="month-title">{monthYearLabel}</span>
        <button type="button" className="nav-btn" onClick={handleNextMonth} aria-label="Next Month">›</button>
      </div>

      {/* Weekday Labels */}
      <div className="weekdays-grid">
        <span>Hën</span><span>Mar</span><span>Mër</span><span>Enj</span><span>Prem</span><span>Sht</span><span>Di</span>
      </div>

      {/* Days Grid */}
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

      {/* Time Slots Area */}
      {selectedDateStr && (
        <div className="time-section">
          <span className="section-label">Zgjidhni Orën</span>

          {(groupedTimeSlots.morning.length > 0 ||
            groupedTimeSlots.afternoon.length > 0 ||
            groupedTimeSlots.evening.length > 0) ? (
            <>
              {groupedTimeSlots.morning.length > 0 && (
                <div className="period-group">
                  <span className="period-title">Mëngjes</span>
                  <div className="slots-grid">
                    {groupedTimeSlots.morning.map((time) => {
                      const displayTime = time.substring(0, 5);
                      const isSelected = selectedTimeStr === time;
                      return (
                        <button
                          key={time}
                          type="button"
                          className={`time-pill ${isSelected ? 'selected' : ''}`}
                          onClick={() => handleTimeSelect(time)}
                        >
                          {displayTime}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {groupedTimeSlots.afternoon.length > 0 && (
                <div className="period-group">
                  <span className="period-title">Pasdite</span>
                  <div className="slots-grid">
                    {groupedTimeSlots.afternoon.map((time) => {
                      const displayTime = time.substring(0, 5);
                      const isSelected = selectedTimeStr === time;
                      return (
                        <button
                          key={time}
                          type="button"
                          className={`time-pill ${isSelected ? 'selected' : ''}`}
                          onClick={() => handleTimeSelect(time)}
                        >
                          {displayTime}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {groupedTimeSlots.evening.length > 0 && (
                <div className="period-group">
                  <span className="period-title">Mbrëmje</span>
                  <div className="slots-grid">
                    {groupedTimeSlots.evening.map((time) => {
                      const displayTime = time.substring(0, 5);
                      const isSelected = selectedTimeStr === time;
                      return (
                        <button
                          key={time}
                          type="button"
                          className={`time-pill ${isSelected ? 'selected' : ''}`}
                          onClick={() => handleTimeSelect(time)}
                        >
                          {displayTime}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="empty-state">
              Nuk ka termine të lira për këtë datë.
            </div>
          )}
        </div>
      )}
    </div>
  );
}