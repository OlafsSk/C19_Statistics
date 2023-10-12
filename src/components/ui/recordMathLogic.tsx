import { parse, format } from 'date-fns'

interface Record {
  dateRep: string
  cases: number
  countriesAndTerritories: string
}

// Function to calculate total cases by country for a specific period
export function calculateTotalCasesByPeriod(data: Record[], startDate: string, endDate: string) {
  // Parse start and end dates
  const startDateObj = parse(startDate, 'dd/MM/yyyy', new Date())
  const endDateObj = parse(endDate, 'dd/MM/yyyy', new Date())

  // Filter data based on the selected period
  const filteredData = data.filter((record) => {
    const recordDate = parse(record.dateRep, 'dd/MM/yyyy', new Date())
    return recordDate >= startDateObj && recordDate <= endDateObj
  })

  // Array to store total cases by country
  const totalCasesByCountry: Record[] = []

  // Iterate through the filtered data to calculate total cases by country
  filteredData.forEach((record) => {
    const existingRecordIndex = totalCasesByCountry.findIndex(
      (item) => item.countriesAndTerritories === record.countriesAndTerritories
    )

    if (existingRecordIndex !== -1) {
      // Add to existing record if the country already exists in the array
      totalCasesByCountry[existingRecordIndex].cases += record.cases
    } else {
      // Create a new record if the country does not exist in the array
      totalCasesByCountry.push({
        dateRep: format(endDateObj, 'dd/MM/yyyy'), // Use endDateObj to represent the date for the record
        cases: record.cases,
        countriesAndTerritories: record.countriesAndTerritories,
      })
    }
  })

  return totalCasesByCountry
}

// Function to calculate total cases for the full selected period
export function calculateTotalFullPeriodCases(data: Record[], startDate: string, endDate: string) {

}

// Function to calculate cases per 1000 population for a specific period
export function calculateCasesPer1000ByPeriod(data: Record[], startDate: string, endDate: string) {

}