import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaSearch } from "react-icons/fa";
import { Table, Pagination } from "react-bootstrap";

const InventoryPage = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    setFilteredProducts(
      searchTerm
        ? products.filter((product) =>
            product.name.toLowerCase().includes(searchTerm.toLowerCase())
          )
        : products
    );
  }, [products, searchTerm]);

  const fetchProducts = async () => {
    try {
      const response = await axios.get("https://api.neightivglobal.com/api/products/inventory");
      setProducts(response.data);
    } catch (error) {
      console.error("Error fetching inventory:", error);
    }
  };

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="container my-4" style={{ maxWidth: "120%", marginLeft: "10%" }}>
      <div className="row">
        <div className="col-md-8 mx-auto" style={{ width: "80%" }}>
          <div style={{ display: "flex", alignItems: "center", marginTop: "2%", position: "relative" }}>
            <div style={{ position: "relative" }}>
              <input
                type="text"
                placeholder="Search Products"
                style={{ padding: "5px 10px 5px 30px", width: "250px" }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <i
                className="fa fa-search"
                style={{
                  position: "absolute",
                  left: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                }}
              ></i>
            </div>
          </div>

          <Table striped bordered hover responsive className="inventory-table shadow-sm" style={{ marginTop: "2%" }}>
            <thead style={{ textAlign: "center" }}>
              <tr>
                <th>Sl.no</th>
                <th>Product Name</th>
                <th>Sold Stock</th>
                <th>Current Stock</th>
              </tr>
            </thead>
            <tbody>
              {currentProducts.map((product, index) => (
                <tr key={product._id} style={{ textAlign: "center" }}>
                  <td>{indexOfFirstItem + index + 1}</td>
                  <td>{product.name}</td>
                  <td>{product.soldStock || 0}</td>
                  <td>{product.stock}</td>
                </tr>
              ))}
            </tbody>
          </Table>

          <Pagination className="justify-content-center">
            <Pagination.First onClick={() => setCurrentPage(1)} disabled={currentPage === 1} />
            <Pagination.Prev
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            />
            {Array.from({ length: totalPages }, (_, i) => (
              <Pagination.Item
                key={i + 1}
                active={i + 1 === currentPage}
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </Pagination.Item>
            ))}
            <Pagination.Next
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            />
            <Pagination.Last
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
            />
          </Pagination>
        </div>
      </div>
    </div>
  );
};

export default InventoryPage;