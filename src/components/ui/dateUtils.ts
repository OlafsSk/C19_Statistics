export function findOldestAndNewestDates(data: any[]) {
  
  const dateArray: string[] = []

  // Collection and population of all valid "dateRep" records in an "dateArray"
  data.forEach((record: any) => {
    if (record.dateRep) {
      dateArray.push(record.dateRep)
    }
  })

  // Find the oldest and newest dates from the "dateArray"
  const oldestDate = dateArray.length > 0 ? dateArray.reduce((a, b) => (a < b ? a : b)) : null
  const newestDate = dateArray.length > 0 ? dateArray.reduce((a, b) => (a > b ? a : b)) : null

  return { oldestDate, newestDate }
}