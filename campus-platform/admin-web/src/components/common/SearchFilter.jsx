import { FiSearch } from "react-icons/fi";

function SearchFilter({
  search,
  setSearch,
  placeholder,
  filters = [],
  selected,
  setSelected,
}) {
  return (
    <div className="filters">
      <label className="search-box">
        <FiSearch />
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={placeholder}
        />
      </label>
      {filters.length > 0 && (
        <select
          value={selected}
          onChange={(event) => setSelected(event.target.value)}
        >
          {filters.map((filter) => (
            <option key={filter}>{filter}</option>
          ))}
        </select>
      )}
    </div>
  );
}
export default SearchFilter;