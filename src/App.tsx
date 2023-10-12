import { useState, useEffect } from 'react'
import DatePicker from './components/ui/datepicker'
import Chart, { ChartData } from './components/ui/lineChart'
import { findOldestAndNewestDates } from './components/ui/dateUtils'
import { parseISO, parse, format, isValid } from 'date-fns'
import { Container, Nav, Tab } from 'react-bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css'
import Table, { Row } from './components/ui/dataTable'
import { columns } from './components/ui/tableColumns'
import './App.css'

function App() {
  // State variables
  const [data, setData] = useState<any[]>([])
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [oldestDate, setOldestDate] = useState<string | null>(null)
  const [newestDate, setNewestDate] = useState<string | null>(null)
  const [summaryData, setSummaryData] = useState<any[]>([])
  const [filteredChartData, setFilteredChartData] = useState<ChartData[]>([])

  // Function to fetch data
  const fetchData = async () => {
    try {
      const response = await fetch('https://opendata.ecdc.europa.eu/covid19/casedistribution/json/')
      const res = await response.json()

      // Format and set data
      const formattedData = res.records.map((entry: any) => {
        const { dateRep } = entry

        try {
          let originalDate

          // Check if the dateRep is in 'dd/MM/yyyy' format
          if (/\d{2}\/\d{2}\/\d{4}/.test(dateRep)) {
            originalDate = parse(dateRep, 'dd/MM/yyyy', new Date())
          } else {
            originalDate = parseISO(dateRep)
          }

          // Check if the date is valid
          if (!isValid(originalDate)) {
            console.error('Invalid date for entry:', dateRep, 'in entry:', entry)
            return { ...entry, dateRep: null }
          }

          // Format date to 'yyyy-MM-dd'
          const formattedDate = format(originalDate, 'yyyy-MM-dd')
          return { ...entry, dateRep: formattedDate }
        } catch (error) {
          console.error('Error parsing date for entry:', entry, 'Error:', error)
          console.log('Raw dateRep value:', dateRep)
          return { ...entry, dateRep: null }
        }
      })

      // Set data and find oldest and newest dates
      setData(formattedData)
      const { oldestDate, newestDate } = findOldestAndNewestDates(formattedData)
      setOldestDate(oldestDate)
      setNewestDate(newestDate)

      // Set default values for "startDate" and "endDate"
      setStartDate(oldestDate || '')
      setEndDate(newestDate || '')
    } catch (error) {
      console.error('Kļūda datu iegūšanā:', error)
    }
  }

  // Fetch data when the component mounts
  useEffect(() => {
    fetchData()
  }, [])

  // Calculate total cases and total deaths for each country within the selected period
  useEffect(() => {
    const countryTotals: Record<string, { cases: number, deaths: number }> = {}

    const filteredData = data.filter((row) => {
      const date = parse(row.dateRep, 'yyyy-MM-dd', new Date())
      return date >= parse(startDate, 'yyyy-MM-dd', new Date()) && date <= parse(endDate, 'yyyy-MM-dd', new Date())
    })

    filteredData.forEach((row) => {
      const { countriesAndTerritories, cases, deaths } = row
      if (!countryTotals[countriesAndTerritories]) {
        countryTotals[countriesAndTerritories] = { cases: 0, deaths: 0 }
      }
      countryTotals[countriesAndTerritories].cases += cases
      countryTotals[countriesAndTerritories].deaths += deaths
    })

    // Create a summary row for each country
    const summaryRows = Object.keys(countryTotals).map((country) => ({
      countriesAndTerritories: country,
      cases: countryTotals[country].cases,
      deaths: countryTotals[country].deaths,
    }))

    setSummaryData(summaryRows)
  }, [data, startDate, endDate])

  // Handle filter change for the DataTable
  const handleFilterChange = (filteredData: Row[]) => {
    const transformedData: ChartData[] = filteredData.map((row) => ({
      dateRep: row.dateRep,
      cases: row.cases,
      deaths: row.deaths,
      countriesAndTerritories: row.countriesAndTerritories,
    }))
  
    // Pass the transformed data to the chart component
    setFilteredChartData(transformedData)
  }

  return (
    <Container className="py-4">
      <p className="py-10">
        Periods no{' '}
        <DatePicker
          setDate={setStartDate}
          disabledDates={[oldestDate, newestDate]}
          initialValue={oldestDate || ''}
        />
        {' '}
        līdz{' '}
        <DatePicker
          setDate={setEndDate}
          disabledDates={[oldestDate, newestDate]}
          initialValue={newestDate || ''}
        />
      </p>
      <Tab.Container defaultActiveKey="Table">
        <Nav variant="pills tBlue">
          <Nav.Item>
            <Nav.Link eventKey="Table">Tabula</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="Graph">Grafiks</Nav.Link>
          </Nav.Item>
        </Nav>
        <Tab.Content>
            <Tab.Pane eventKey="Table">
              <Container className="py-4 backGroundColor">
                <Table
                  data={[...data, ...summaryData]}
                  columns={columns}
                  itemsPerPage={20}
                  startDate={startDate}
                  endDate={endDate}
                  onFilterChange={handleFilterChange}
                />
              </Container>
            </Tab.Pane>
            <Tab.Pane eventKey="Graph">
              <Container className="py-4 backGroundColor">
                <Chart data={filteredChartData} startDate={startDate} endDate={endDate} />
              </Container>
            </Tab.Pane>
        </Tab.Content>
      </Tab.Container>
    </Container>
  )
}

export default App