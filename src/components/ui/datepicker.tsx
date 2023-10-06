import React, { useState, useEffect } from 'react';

function DatePicker({ setDate, disabledDates, initialValue }: any) {
  const [selectedDate, setSelectedDate] = useState(initialValue);

  function handleDateChange(event: React.ChangeEvent<HTMLInputElement>) {
    const newDate = event.target.value;
    setSelectedDate(newDate);
    setDate(newDate);
  }

  useEffect(() => {
    setSelectedDate(initialValue);
  }, [initialValue]);

  return (
    <>
      <input
        className="border-solid border-black border-2"
        type="date"
        onChange={handleDateChange}
        min={disabledDates[0]}
        max={disabledDates[1]}
        value={selectedDate}
      />
    </>
  );
}

export default DatePicker;