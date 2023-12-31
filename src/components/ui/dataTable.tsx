import React, { useState, useEffect } from 'react'
import { Table as BootstrapTable, Pagination, Form, Button, Dropdown, DropdownButton } from 'react-bootstrap'
import '../../App.css'
import { BiSearch } from 'react-icons/bi'
import { Column } from './tableColumns'

export interface Row {
  countriesAndTerritories: string
  cases: number
  deaths: number
  [key: string]: any
}

interface TableProps {
  data: Row[]
  columns?: Column[]
  itemsPerPage: number
  startDate: string
  endDate: string
  onFilterChange: (filteredData: Row[]) => void
}

const Table: React.FC<TableProps> = (props) => {
  const {
    data,
    columns = [],
    itemsPerPage,
    startDate,
    endDate,
    onFilterChange,
  } = props

  // State variables
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [numericColumns, setNumericColumns] = useState<string[]>([])
  const [selectedColumn, setSelectedColumn] = useState<string | null>(null)
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [hasResults, setHasResults] = useState(true)
  const [minValue, setMinValue] = useState<number | null>(null)
  const [maxValue, setMaxValue] = useState<number | null>(null)
  const [filteredData, setFilteredData] = useState<Row[]>([])
  const [countryOptions, setCountryOptions] = useState<string[]>([])

  // Effect to update numeric columns when columns or data change
  useEffect(() => {
    const numericCols = columns
      .filter((column) => !isNaN(data[0]?.[column.dataField as keyof Row]))
      .map((column) => column.title)
    setNumericColumns(numericCols)
  }, [columns, data])

  // Handle column selection in the dropdown
  const handleColumnSelect = (selectedColumn: string) => {
    const matchingColumn = columns.find((column) => column.title === selectedColumn)
    const propertyName = matchingColumn ? matchingColumn.dataField || selectedColumn : selectedColumn
    setSelectedColumn(propertyName)
  }

  // Handle sorting
  const handleSort = (column: string) => {
    setSortColumn(column)
    setSortOrder((prevOrder) => (prevOrder === 'asc' ? 'desc' : 'asc'))
  }

  // Handle min value change
  const handleMinValueChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(event.target.value)
    setMinValue(isNaN(value) ? null : value)
  }

  // Handle max value change
  const handleMaxValueChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(event.target.value)
    setMaxValue(isNaN(value) ? null : value)
  }

  // Effect to filter data when filter criteria change
  useEffect(() => {
    const filtered = filterDataByDateRangeAndSearch()
    setHasResults(filtered.length > 0)
    setFilteredData(filtered)
  
    // Notify the parent component about the filtered data
    onFilterChange(filtered)
  }, [data, startDate, endDate, searchTerm, selectedColumn, sortColumn, sortOrder, minValue, maxValue, onFilterChange])

  // Function to filter data by date range and search term
  const filterDataByDateRangeAndSearch = () => {
    const filtered = data.filter((entry) => {
      const entryDate = new Date(entry.dateRep)
  
      // Check if entryDate is a valid date
      if (isNaN(entryDate.getTime())) {
        console.log('Invalid date for entry:', entry)
        return false
      }
  
      const isoDateString = entryDate.toISOString().split('T')[0]
      const dateInRange =
        (!startDate || startDate <= isoDateString) && (!endDate || isoDateString <= endDate)
  
      const matchesSearchTerm =
        searchTerm === '' ||
        entry.countriesAndTerritories.toLowerCase().includes(searchTerm.toLowerCase())
  
      if (selectedColumn) {
        const numericValue = entry[selectedColumn as keyof Row]
  
        if (typeof numericValue !== 'undefined') {
          // Update the numericInRange condition
          const numericInRange =
            (isNaN(minValue!) || minValue! <= numericValue) &&
            (maxValue === null || isNaN(maxValue) || numericValue <= maxValue)
  
          return dateInRange && matchesSearchTerm && numericInRange
        } else {
          console.log('Numeric Value is Undefined for Entry:', entry)
        }
      }
  
      return dateInRange && matchesSearchTerm
    })
  
    return filtered
  }

  // Clone the data array to avoid mutating the original data
  const sortedData = [...filteredData]

  // Sort the data based on the selected column and order
  if (sortColumn) {
    sortedData.sort((a, b) => {
      const valueA = a[sortColumn as keyof Row]
      const valueB = b[sortColumn as keyof Row]

      if (typeof valueA === 'string' && typeof valueB === 'string') {
        return sortOrder === 'asc' ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA)
      } else {
        return sortOrder === 'asc' ? (valueA as number) - (valueB as number) : (valueB as number) - (valueA as number)
      }
    })
  }

  // Calculate pagination variables
  const totalPages = Math.ceil(sortedData.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const slicedData = sortedData.slice(startIndex, endIndex)

  // Function to generate an array of page numbers for pagination
  const pageRange = () => {
    const pageNumbers = []
    let startPage = Math.max(1, currentPage - 2)
    let endPage = Math.min(totalPages, startPage + 4)

    if (startPage + 4 > totalPages) {
      startPage = Math.max(1, totalPages - 4)
      endPage = totalPages
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i)
    }

    return pageNumbers
  }

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  // Handle search
  const handleSearch = () => {
    setCurrentPage(1)
    const inputValue = document.getElementById('formSearch') as HTMLInputElement | null
    if (inputValue) {
      setSearchTerm(inputValue.value)
      // Filter unique country names based on search term
      const filteredCountries = [...new Set(data
        .filter((entry) => entry.countriesAndTerritories.toLowerCase().includes(inputValue.value.toLowerCase()))
        .map((entry) => entry.countriesAndTerritories))]
      setCountryOptions(filteredCountries)
    }
  }

  // Handle clearing filters
  const handleClearFilters = () => {
    setSearchTerm('')
    setSelectedColumn(null)

    const minValueInput = document.getElementById('minValue') as HTMLInputElement | null
    const maxValueInput = document.getElementById('maxValue') as HTMLInputElement | null

    if (minValueInput && maxValueInput) {
      minValueInput.value = ''
      maxValueInput.value = ''
    }

    const searchInput = document.getElementById('formSearch') as HTMLInputElement | null
    if (searchInput) {
      searchInput.value = ''
    }
  }

  return (
    <>
      <Form className="form">
        <Form.Group style={{ display: 'flex', justifyContent:'center' }}>
          <Form.Control
            className="search-form-input"
            type="text"
            placeholder="Meklēt pēc valsts nosaukuma"
            id="formSearch"
          />
          <Button variant="primary" onClick={handleSearch}>
            <BiSearch />
          </Button>
          <DropdownButton
            variant="primary"
            title={`${selectedColumn ? columns.find(col => col.dataField === selectedColumn)?.title : 'Filtrēt pēc lauka'}`}
            id="dropdown-basic-0"
            style={{ marginLeft: '50px', marginRight: '10px' }}
          >
            {numericColumns.map((column, index) => (
              <Dropdown.Item
                key={index}
                onClick={() => handleColumnSelect(column)}
              >
                {column}
              </Dropdown.Item>
            ))}
          </DropdownButton>
          <Form.Control
          className="filter-form-input"
          type="number"
          placeholder="vērtība no"
          style={{ marginRight: '10px' }}
          id="minValue"
          onChange={handleMinValueChange}
          value={minValue !== null ? minValue : ''}
        />
        <Form.Control
          className="filter-form-input filter-margin"
          type="number"
          placeholder="vērtība līdz"
          id="maxValue"
          onChange={handleMaxValueChange}
          value={maxValue !== null ? maxValue : ''}
        />
        </Form.Group>
        <br />
        <Button className="float" variant="primary" onClick={handleClearFilters}>
          Noņemt visus filtrus
        </Button>
      </Form>
      <br />
      <br />
      <br />
      {hasResults ? (
        <BootstrapTable striped bordered hover>
          <thead>
            <tr>
              {columns.map((column) => (
                <th
                  key={column.dataField}
                  className={`table-header-row ${sortColumn === column.dataField ? `sorted ${sortOrder}` : ''}`}
                  onClick={() => handleSort(column.dataField || '')}
                  style={{ cursor: 'pointer' }}
                >
                  {column.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {slicedData.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {columns.map((column) => (
                  <td key={column.dataField}>{row[column.dataField as keyof Row] ?? 'N/A'}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </BootstrapTable>
      ) : (
        <div style={{ textAlign: 'center' }}>
          Pēc jūsu kritērijiem nekas netika atrasts
        </div>
      )}
      <br />
      <br />
      <br />
      {totalPages > 1 && (
        <Pagination className="custom-pagination">
          <Pagination.Prev className="custom-pagination-controls"
            onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            {"<<"}
          </Pagination.Prev>
          {pageRange().map((pageNumber) => (
            <Pagination.Item
              key={pageNumber}
              active={pageNumber === currentPage}
              onClick={() => handlePageChange(pageNumber)}
            >
              {pageNumber}
            </Pagination.Item>
          ))}
          <Pagination.Next className="custom-pagination-controls"
            onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
          >
            {">>"}
          </Pagination.Next>
        </Pagination>
      )}
    </>
  )
}

export default Table