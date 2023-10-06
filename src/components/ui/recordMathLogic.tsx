import { parse, format } from 'date-fns';

interface Record {
  dateRep: string;
  cases: number;
  countriesAndTerritories: string;
}

export function calculateTotalCasesByPeriod(data: Record[], startDate: string, endDate: string) {
  const startDateObj = parse(startDate, 'dd/MM/yyyy', new Date());
  const endDateObj = parse(endDate, 'dd/MM/yyyy', new Date());

  // Move this line to ensure filteredData is declared before using it
  const filteredData = data.filter((record) => {
    const recordDate = parse(record.dateRep, 'dd/MM/yyyy', new Date());
    return recordDate >= startDateObj && recordDate <= endDateObj;
  });

  const totalCasesByCountry: Record[] = [];

  filteredData.forEach((record) => {
    const existingRecordIndex = totalCasesByCountry.findIndex(
      (item) => item.countriesAndTerritories === record.countriesAndTerritories
    );

    if (existingRecordIndex !== -1) {
      // Add to existing record
      totalCasesByCountry[existingRecordIndex].cases += record.cases;
    } else {
      // Create a new record
      totalCasesByCountry.push({
        dateRep: format(endDateObj, 'dd/MM/yyyy'),
        cases: record.cases,
        countriesAndTerritories: record.countriesAndTerritories,
      });
    }
  });

  return totalCasesByCountry;
}

export function calculateTotalFullPeriodCases(data: Record[], startDate: string, endDate: string) {

}

export function calculateCasesPer1000ByPeriod(data: Record[], startDate: string, endDate: string) {
  
}