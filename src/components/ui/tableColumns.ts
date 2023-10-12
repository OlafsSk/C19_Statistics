//Defenition of table columns
export interface Column {
  title: string
  dataField?: string
}

export const columns: Column[] = [
  { dataField: 'countriesAndTerritories', title: 'Valsts' },
  { dataField: 'cases', title: 'Gadījumu skaits' },
  { dataField: 'deaths', title: 'Nāves gadījumu skaits' },
  { dataField: 'totalCases', title: 'Gadījumu skaits kopā' },
  { dataField: 'totalDeaths', title: 'Nāves gadījumu skaits kopā' },
  { dataField: 'casesPer1000', title: 'Gadījumu skaits uz 1000 iedzīvotājiem' },
  { dataField: 'deathsPer1000', title: 'Nāves gadījumu skaits uz 1000 iedzīvotājiem' }
]