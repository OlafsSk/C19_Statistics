import React, { useState, useEffect } from 'react'

// DatePicker component with props: setDate, disabledDates, initialValue
function DatePicker({ setDate, disabledDates, initialValue }: any) {
  // State to manage the selected date
  const [selectedDate, setSelectedDate] = useState(initialValue)

  // Function to handle date change
  function handleDateChange(event: React.ChangeEvent<HTMLInputElement>) {
    const newDate = event.target.value
    setSelectedDate(newDate)
    setDate(newDate)
  }

  // Effect to update the selected date when the initialValue changes
  useEffect(() => {
    setSelectedDate(initialValue)
  }, [initialValue])

  // Render the input element for date picking
  return (
    <>
      <input
        className="border-solid border-black border-2"
        type="date"
        onChange={handleDateChange}
        min={disabledDates[0]} // Minimum selectable date
        max={disabledDates[1]} // Maximum selectable date
        value={selectedDate} // Controlled value
      />
    </>
  )
}

export default DatePicker