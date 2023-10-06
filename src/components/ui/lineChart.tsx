import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Dropdown, DropdownButton } from 'react-bootstrap';

interface ChartProps {
  data: {
    dateRep: string;
    cases: number;
    deaths: number;
    countriesAndTerritories: string;
  }[];
  startDate: string;
  endDate: string;
}

export default class Chart extends React.PureComponent<ChartProps, { activeOption: string; isOpen: boolean }> {
  constructor(props: ChartProps) {
    super(props);
    this.state = {
      activeOption: 'Visas valstis',
      isOpen: false, // Track dropdown open state
    };
  }

  handleOptionSelect = (option: string) => {
    this.setState({ activeOption: option, isOpen: false }); // Close the dropdown after selection
  };

  toggleDropdown = () => {
    const currentState = this.state.isOpen;
    this.setState({ isOpen: !currentState });
  };

  filterDataByDateRangeAndCountry = () => {
    const { data, startDate, endDate } = this.props;
    const { activeOption } = this.state;

    const filteredData = data.filter((entry) => {
      const entryDate = new Date(entry.dateRep).toISOString().split('T')[0];
      const isDateInRange = startDate <= entryDate && entryDate <= endDate;

      if (activeOption === 'Visas valstis') {
        return isDateInRange;
      } else {
        return isDateInRange && entry.countriesAndTerritories === activeOption;
      }
    });

    return filteredData.sort((a, b) => {
      const dateA = new Date(a.dateRep);
      const dateB = new Date(b.dateRep);
      return dateA.getTime() - dateB.getTime();
    });
  };

  render() {
    const { activeOption } = this.state;
    const { startDate, endDate } = this.props;

    const filteredData = this.filterDataByDateRangeAndCountry();

    const uniqueCountries = [...new Set(filteredData?.map((entry) => entry.countriesAndTerritories))];

    return (
      <div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <p style={{ margin: 5 }}>
            Valsts:
          </p>
              <DropdownButton
                variant="primary"
                title={`${activeOption}`}
                id="dropdown-basic-0"
              >
                <Dropdown.Item onClick={() => this.handleOptionSelect('Visas valstis')}>
                  Visas valstis
                </Dropdown.Item>
                <Dropdown.Divider />
                {uniqueCountries?.map((country, index) => (
                  <Dropdown.Item
                    key={index + 2}
                    onClick={() => this.handleOptionSelect(country)}
                  >
                    {country}
                  </Dropdown.Item>
                ))}
              </DropdownButton>
        </div>
        {/* ) : (
          ''
        )} */}
        <br />
        <ResponsiveContainer width="100%" aspect={2.5} className="bg-white border-2 border-black">
          {(() => {
            if (startDate === '' || endDate === '') {
              return <p className="text-center p-4">Lūdzu atzīmējiet sev vēlamo periodu un filtru datu attēlošanai</p>;
            } else if (filteredData.length > 0) {
              return (
                <LineChart
                  width={500}
                  height={300}
                  data={filteredData}
                  margin={{
                    top: 50,
                    right: 50,
                    left: 50,
                    bottom: 50,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" label={{ value: "Periods", dy: 10}}/>
                  <YAxis label={{ value: "Gadījumi", position: "insideLeft", angle: -90, dy: -10}} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="cases" stroke="#8884d8" activeDot={{ r: 8 }} name="Gadījumu skaits" />
                  <Line type="monotone" dataKey="deaths" stroke="#82ca9d" name="Nāves gadījumu skaits" />
                </LineChart>
              );
            } else {
              return <p className="text-center p-4">Atvainojiet, atzīmētajā periodā nav pietiekami dati</p>;
            }
          })()}
        </ResponsiveContainer>
      </div>
    );
  }
}