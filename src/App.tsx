import { useState, useEffect } from 'react';
import DatePicker from './components/ui/datepicker';
import Chart from './components/ui/lineChart';
import { findOldestAndNewestDates } from './components/ui/dateUtils';
import { parse, format } from 'date-fns';
import { Container, Nav, Tab } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import Table from './components/ui/dataTable';
import { columns } from './components/ui/tableColumns';
import './App.css'

function App() {
  const [data, setData] = useState<any[]>([])
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [oldestDate, setOldestDate] = useState<string | null>(null);
  const [newestDate, setNewestDate] = useState<string | null>(null);
  const [summaryData, setSummaryData] = useState<any[]>([]);

  // Function to fetch data
  const fetchData = async () => {
    try {
      const response = await fetch('https://opendata.ecdc.europa.eu/covid19/casedistribution/json/')
      const res = await response.json()

      // "dateRep" record format conversion
      const formattedData = res.records.map((entry: any) => {
        const originalDate = parse(entry.dateRep, 'dd/MM/yyyy', new Date());
        const formattedDate = format(originalDate, 'yyyy-MM-dd');

        return { ...entry, dateRep: formattedDate };
      });

      setData(formattedData);

      // Function to find the oldest and newest dates
      const { oldestDate, newestDate } = findOldestAndNewestDates(formattedData)
      setOldestDate(oldestDate);
      setNewestDate(newestDate);

      // Set default values for "startDate" and "endDate"
      setStartDate(oldestDate || '');
      setEndDate(newestDate || '');
    } catch (error) {
      console.error('Kļūda datu iegūšanā:', error);
    }
  };

  useEffect(() => {
    fetchData(); // Call the fetch function when the component mounts
  }, []);

  useEffect(() => {
    // Calculate total cases and total deaths for each country
    const countryTotals: Record<string, { cases: number; deaths: number }> = {};

    data.forEach((row) => {
      const { countriesAndTerritories, cases, deaths } = row;
      if (!countryTotals[countriesAndTerritories]) {
        countryTotals[countriesAndTerritories] = { cases: 0, deaths: 0 };
      }
      countryTotals[countriesAndTerritories].cases += cases;
      countryTotals[countriesAndTerritories].deaths += deaths;
    });

  // Create a summary row for each country
    const summaryRows = Object.keys(countryTotals).map((country) => ({
      countriesAndTerritories: country,
      cases: countryTotals[country].cases,
      deaths: countryTotals[country].deaths,
    }));

    setSummaryData(summaryRows);
  }, [data]);

  return (
    <Container className="py-4">
      <p className="py-10">
        Periods no{' '}
        <DatePicker
          setDate={setStartDate}
          disabledDates={[oldestDate, newestDate]}
          initialValue={oldestDate || ''}
        />
        {' '}līdz{' '}
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
                  />
              </Container>
            </Tab.Pane>
            <Tab.Pane eventKey="Graph">
              <Container className="py-4 backGroundColor">
                <Chart data={data} startDate={startDate} endDate={endDate} />
              </Container>
            </Tab.Pane>
        </Tab.Content>
      </Tab.Container>
    </Container>
  );
}

export default App;