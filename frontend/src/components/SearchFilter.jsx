import React, { useState, useEffect } from 'react';
import { fetchCategories } from '../services/api';
import './SearchFilter.css';

function SearchFilter({ onFilterChange }) {
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    // Debounce search input (300ms)
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    // Notify parent of filter changes
    if (onFilterChange) {
      const filters = {};
      if (debouncedSearch) filters.search = debouncedSearch;
      if (category) filters.category = category;
      onFilterChange(filters);
    }
  }, [debouncedSearch, category, onFilterChange]);

  async function loadCategories() {
    try {
      const data = await fetchCategories();
      setCategories(data);
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  }

  function handleClearFilters() {
    setSearch('');
    setCategory('');
    setDebouncedSearch('');
  }

  const hasActiveFilters = search || category;

  return (
    <div className="search-filter">
      <div className="filter-controls">
        <div className="search-input-wrapper">
          <input
            type="text"
            placeholder="Search locations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
        </div>

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="category-select"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>

        {hasActiveFilters && (
          <button onClick={handleClearFilters} className="clear-button">
            Clear Filters
          </button>
        )}
      </div>
    </div>
  );
}

export default SearchFilter;
