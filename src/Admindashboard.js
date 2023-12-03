import React, { useState, useEffect } from "react";
import { useMemo } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Admindashboard.css";

const Admindashboard = () => {
  const [data, setData] = useState([]);
  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [edit, setEdit] = useState({});
  const [isDynamicSearch, setIsDynamicSearch] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const result = await axios(
        "https://geektrust.s3-ap-southeast-1.amazonaws.com/adminui-problem/members.json"
      );
      setData(result.data);
    };
    fetchData();
  }, []);

  // Function to set the query for filtering data
  const filterData = (searchQuery) => {
    setQuery(searchQuery);
  };

  const handleSearchEnter = (e) => {
    if (e.key === "Enter" && !isDynamicSearch) {
      filterData(e.target.value);
    }
  };

  const handleSearch = (e) => {
    if (isDynamicSearch) {
      setQuery(e.target.value);
    }
  };

  const toggleDynamicSearch = () => {
    setIsDynamicSearch(!isDynamicSearch);
    if (isDynamicSearch) {
      // When turning off dynamic search, apply the current query.
      filterData(query);
    }
  };

  const handleDelete = (id) => {
    setData(data.filter((item) => item.id !== id));
  };

  const handleEdit = (id) => {
    const user = data.find((user) => user.id === id);
    setEdit({ ...user });
  };

  // Function to save the edited row
  const handleSave = (id) => {
    setData(data.map((item) => (item.id === id ? { ...edit } : item)));
    setEdit({});
  };

  // Function to handle row selection
  const handleSelectRow = (id) => {
    const newSelectedRows = new Set(selectedRows);
    if (selectedRows.has(id)) {
      newSelectedRows.delete(id);
    } else {
      newSelectedRows.add(id);
    }
    setSelectedRows(newSelectedRows);
  };

  // Function to delete selected rows
  const handleDeleteSelected = () => {
    setData(data.filter((item) => !selectedRows.has(item.id)));
    setSelectedRows(new Set());
  };

  const filteredData = useMemo(() => {
    return query
      ? data.filter((item) =>
          Object.values(item).some((value) =>
            value.toString().toLowerCase().includes(query.toLowerCase())
          )
        )
      : data;
  }, [data, query]);

  const perPage = 10;
  // Calculating the total number of pages for pagination
  const pages = Math.ceil(filteredData.length / perPage);
  const currentData = useMemo(() => {
    const start = (currentPage - 1) * perPage;
    return filteredData.slice(start, start + perPage);
  }, [currentPage, filteredData]);

  // Effect to reset the current page when the query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [query]);

  return (
    <div className="container mt-3">
      <div className="input-group mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Search by Name ..."
          onChange={handleSearch}
          onKeyPress={handleSearchEnter}
        />
      </div>
      <label className="switch">
        <input
          type="checkbox"
          checked={isDynamicSearch}
          onChange={toggleDynamicSearch}
        />
        <span className="slider round"></span>
      </label>
      <span className="ms-2">Automatic Search (Search Without Trigger)</span>

      <div className="d-flex justify-content-end">
        <button onClick={handleDeleteSelected} className="btn btn-danger mb-3">
          <i className="fas fa-trash" aria-hidden="true"></i> Delete Selected
        </button>
      </div>

      {/* Display for selected items count */}
      <div className="selected-count-display mb-2">
        <span>
          Selected Items: {selectedRows.size} / {data.length}
        </span>
      </div>

      <table className="table">
        <thead>
          <tr>
            <th>Select</th>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentData.map((item) => (
            <tr
              key={item.id}
              className={selectedRows.has(item.id) ? "table-active" : ""}
            >
              <td>
                <input
                  type="checkbox"
                  checked={selectedRows.has(item.id)}
                  onChange={() => handleSelectRow(item.id)}
                />
              </td>
              <td>
                {edit.id === item.id ? (
                  <input
                    type="text"
                    value={edit.name}
                    onChange={(e) => setEdit({ ...edit, name: e.target.value })}
                  />
                ) : (
                  item.name
                )}
              </td>
              <td>
                {edit.id === item.id ? (
                  <input
                    type="text"
                    value={edit.email}
                    onChange={(e) =>
                      setEdit({ ...edit, email: e.target.value })
                    }
                  />
                ) : (
                  item.email
                )}
              </td>
              <td>
                {edit.id === item.id ? (
                  <input
                    type="text"
                    value={edit.role}
                    onChange={(e) => setEdit({ ...edit, role: e.target.value })}
                  />
                ) : (
                  item.role
                )}
              </td>
              <td>
                {edit.id === item.id ? (
                  <button
                    className="btn btn-success"
                    onClick={() => handleSave(item.id)}
                  >
                    <i class="fas fa-check" aria-hidden="true"></i>
                  </button>
                ) : (
                  <>
                    <button
                      style={{ marginRight: "8px" }}
                      className="btn btn-primary"
                      onClick={() => handleEdit(item.id)}
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleDelete(item.id)}
                    >
                      <i className="fas fa-trash" aria-hidden="true"></i>
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <nav>
        <ul className="pagination">
          <li className="page-item">
            <button className="page-link" onClick={() => setCurrentPage(1)}>
              First
            </button>
          </li>
          <li className="page-item">
            <button
              className="page-link"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </button>
          </li>
          {/* Loop through all pages */}
          {[...Array(pages).keys()].map((page) => (
            <li
              key={page}
              className={`page-item ${
                currentPage === page + 1 ? "active" : ""
              }`}
            >
              <button
                className="page-link"
                onClick={() => setCurrentPage(page + 1)}
              >
                {page + 1}
              </button>
            </li>
          ))}
          <li className="page-item">
            <button
              className="page-link"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === pages}
            >
              Next
            </button>
          </li>
          <li className="page-item">
            <button className="page-link" onClick={() => setCurrentPage(pages)}>
              Last
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Admindashboard;
