import React, { useState, useMemo, useEffect } from 'react';
import { Search, Filter, Download, Calendar, Clock, MapPin, Navigation, Gauge, ChevronDown, X } from 'lucide-react';
import { getHistoryData } from '../../data/mockData';
import { getMockVessels } from '../../data/mockData'; // gunakan fungsi async
import { HistoryRecord, Vessel } from '../../types/vessel';

interface FilterState {
  vessels: string[];
  dateFrom: string;
  dateTo: string;
  speedMin: string;
  speedMax: string;
  searchText: string;
}

interface GroupingState {
  groupBy: 'none' | 'vessel' | 'date' | 'speed-range';
  sortBy: 'timestamp' | 'vessel' | 'speed' | 'heading';
  sortOrder: 'asc' | 'desc';
}

export default function DataHistory() {
  const [historyData] = useState<HistoryRecord[]>(getHistoryData());
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 100;

  const [filters, setFilters] = useState<FilterState>({
    vessels: [],
    dateFrom: '',
    dateTo: '',
    speedMin: '',
    speedMax: '',
    searchText: ''
  });

  const [grouping, setGrouping] = useState<GroupingState>({
    groupBy: 'none',
    sortBy: 'timestamp',
    sortOrder: 'desc'
  });

  const [vesselList, setVesselList] = useState<Vessel[]>([]);

  useEffect(() => {
    // Ambil data vessel dari backend
    getMockVessels().then(setVesselList);
  }, []);

  // Filter and sort data
  const filteredData = useMemo(() => {
    let filtered = historyData.filter(record => {
      // Vessel filter
      if (
        filters.vessels.length > 0 &&
        !filters.vessels.includes(String(record.vesselId))
      ) {
        return false;
      }

      // Date range filter
      if (filters.dateFrom) {
        const fromDate = new Date(filters.dateFrom);
        if (record.timestamp < fromDate) return false;
      }
      if (filters.dateTo) {
        const toDate = new Date(filters.dateTo);
        toDate.setHours(23, 59, 59, 999);
        if (record.timestamp > toDate) return false;
      }

      // Speed range filter
      if (filters.speedMin && record.speed < parseFloat(filters.speedMin)) {
        return false;
      }
      if (filters.speedMax && record.speed > parseFloat(filters.speedMax)) {
        return false;
      }

      // Search text filter
      if (filters.searchText) {
        const searchLower = filters.searchText.toLowerCase();
        return record.vesselName.toLowerCase().includes(searchLower) ||
               record.vesselId.toLowerCase().includes(searchLower);
      }

      return true;
    });

    // Sort data
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (grouping.sortBy) {
        case 'timestamp':
          comparison = a.timestamp.getTime() - b.timestamp.getTime();
          break;
        case 'vessel':
          comparison = a.vesselName.localeCompare(b.vesselName);
          break;
        case 'speed':
          comparison = a.speed - b.speed;
          break;
        case 'heading':
          comparison = a.heading - b.heading;
          break;
      }

      return grouping.sortOrder === 'desc' ? -comparison : comparison;
    });

    return filtered;
  }, [historyData, filters, grouping]);

  // Group data
  const groupedData = useMemo(() => {
    if (grouping.groupBy === 'none') {
      return { 'All Records': filteredData };
    }

    const groups: { [key: string]: HistoryRecord[] } = {};

    filteredData.forEach(record => {
      let groupKey = '';
      
      switch (grouping.groupBy) {
        case 'vessel':
          groupKey = record.vesselName;
          break;
        case 'date':
          groupKey = record.timestamp.toDateString();
          break;
        case 'speed-range':
          if (record.speed < 5) groupKey = '0-5 knots';
          else if (record.speed < 10) groupKey = '5-10 knots';
          else if (record.speed < 15) groupKey = '10-15 knots';
          else if (record.speed < 20) groupKey = '15-20 knots';
          else groupKey = '20+ knots';
          break;
      }

      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(record);
    });

    return groups;
  }, [filteredData, grouping.groupBy]);

  // Pagination
  const totalRecords = filteredData.length;
  const totalPages = Math.ceil(totalRecords / recordsPerPage);
  const startIndex = (currentPage - 1) * recordsPerPage;
  const endIndex = startIndex + recordsPerPage;

  const handleVesselFilterChange = (vesselId: string, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      vessels: checked
        ? [...prev.vessels, vesselId]
        : prev.vessels.filter(id => id !== vesselId)
    }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      vessels: [],
      dateFrom: '',
      dateTo: '',
      speedMin: '',
      speedMax: '',
      searchText: ''
    });
    setCurrentPage(1);
  };

  const exportData = () => {
    const csvContent = [
      ['Vessel ID', 'Vessel Name', 'Timestamp', 'Latitude', 'Longitude', 'Speed (kts)', 'Heading (°)', 'RPM Portside', 'RPM Starboard', 'RPM Center'],
      ...filteredData.map(record => [
        record.vesselId,
        record.vesselName,
        record.timestamp.toISOString(),
        record.latitude.toFixed(6),
        record.longitude.toFixed(6),
        record.speed.toFixed(1),
        record.heading.toString(),
        record.rpmPortside.toFixed(2),
        record.rpmStarboard.toFixed(2),
        record.rpmCenter.toFixed(2)
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vessel-history-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div>
      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center space-x-2 sm:space-x-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 rounded-lg text-sm transition-colors ${
              showFilters ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Filter size={16} />
            <span className="hidden sm:inline">Filters</span>
          </button>
          
          <div className="text-xs sm:text-sm text-gray-600">
            {totalRecords.toLocaleString()} records found
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={exportData}
            className="flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
          >
            <Download size={16} />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800">Filters & Grouping</h3>
            <button
              onClick={clearFilters}
              className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-800"
            >
              <X size={16} />
              <span>Clear All</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Vessel
              </label>
              <div className="relative">
                <Search size={16} className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  value={filters.searchText}
                  onChange={(e) => setFilters(prev => ({ ...prev, searchText: e.target.value }))}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="Search by vessel name or ID"
                />
              </div>
            </div>

            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date From
              </label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date To
              </label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            {/* Speed Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Min Speed (kts)
              </label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={filters.speedMin}
                onChange={(e) => setFilters(prev => ({ ...prev, speedMin: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Speed (kts)
              </label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={filters.speedMax}
                onChange={(e) => setFilters(prev => ({ ...prev, speedMax: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="25"
              />
            </div>

            {/* Group By */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Group By
              </label>
              <select
                value={grouping.groupBy}
                onChange={(e) => setGrouping(prev => ({ ...prev, groupBy: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="none">No Grouping</option>
                <option value="vessel">By Vessel</option>
                <option value="date">By Date</option>
                <option value="speed-range">By Speed Range</option>
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <select
                value={grouping.sortBy}
                onChange={(e) => setGrouping(prev => ({ ...prev, sortBy: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="timestamp">Timestamp</option>
                <option value="vessel">Vessel Name</option>
                <option value="speed">Speed</option>
                <option value="heading">Heading</option>
              </select>
            </div>

            {/* Sort Order */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort Order
              </label>
              <select
                value={grouping.sortOrder}
                onChange={(e) => setGrouping(prev => ({ ...prev, sortOrder: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>
            </div>
          </div>

          {/* Vessel Selection */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Vessels
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              {vesselList.map((vessel) => (
                <label key={vessel.id} className="flex items-center space-x-2 text-sm">
                  <input
                    type="checkbox"
                    checked={filters.vessels.includes(String(vessel.id))}
                    onChange={(e) => handleVesselFilterChange(String(vessel.id), e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-gray-700">{vessel.name}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Data Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {Object.entries(groupedData).map(([groupName, records]) => (
          <div key={groupName}>
            {grouping.groupBy !== 'none' && (
              <div className="bg-gray-50 px-4 sm:px-6 py-3 border-b border-gray-200">
                <h4 className="text-sm font-semibold text-gray-800 flex items-center">
                  <ChevronDown size={16} className="mr-2" />
                  {groupName} ({records.length} records)
                </h4>
              </div>
            )}
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                {(groupName === Object.keys(groupedData)[0] || grouping.groupBy === 'none') && (
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Vessel
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Timestamp
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                        Position
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Speed
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                        Heading
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                        RPM Data
                      </th>
                    </tr>
                  </thead>
                )}
                <tbody className="bg-white divide-y divide-gray-200">
                  {records.slice(
                    grouping.groupBy === 'none' ? startIndex : 0,
                    grouping.groupBy === 'none' ? endIndex : records.length
                  ).map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50">
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                        <div className="text-xs sm:text-sm font-medium text-gray-900">{record.vesselName}</div>
                        <div className="text-xs text-gray-500">{record.vesselType}</div>
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-xs sm:text-sm text-gray-900">
                          <Clock size={14} className="mr-1 text-gray-400" />
                          {record.timestamp.toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          {record.timestamp.toLocaleTimeString()}
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                        <div className="flex items-center text-xs sm:text-sm text-gray-900">
                          <MapPin size={14} className="mr-1 text-gray-400" />
                          {record.latitude.toFixed(4)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {record.longitude.toFixed(4)}
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-xs sm:text-sm font-medium text-gray-900">
                          <Gauge size={14} className="mr-1 text-blue-500" />
                          {record.speed.toFixed(1)} kts
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap hidden lg:table-cell">
                        <div className="flex items-center text-xs sm:text-sm text-gray-900">
                          <Navigation size={14} className="mr-1 text-green-500" />
                          {record.heading.toFixed(2)}°
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap hidden lg:table-cell">
                        <div className="text-xs space-y-1">
                          <div>P: {(record.rpmPortside ?? 0).toFixed(2)}</div>
                          <div>S: {(record.rpmStarboard ?? 0).toFixed(2)}</div>
                          <div>C: {(record.rpmCenter ?? 0).toFixed(2)}</div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {grouping.groupBy === 'none' && totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <div className="text-xs sm:text-sm text-gray-600">
            Showing {startIndex + 1} to {Math.min(endIndex, totalRecords)} of {totalRecords.toLocaleString()} records
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}