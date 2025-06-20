import React, { useState, useEffect } from "react";
import { Table, Button, Card, Form, Row, Col, Pagination, Container, Alert, Spinner } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updatedStatus, setUpdatedStatus] = useState("");
  const [isModified, setIsModified] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const itemsPerPage = 10;

  // Fetch orders from API
  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("https://api.neightivglobal.com/api/shiprocket/orders", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
       
          },
        });

        if (!response.ok) {
          throw new Error(`Error: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();
        // Ensure data is an array; adjust if API wraps it (e.g., data.orders)
        const ordersArray = Array.isArray(data) ? data : data.orders || [];
        setOrders(ordersArray);
      } catch (err) {
        setError(`Failed to fetch orders: ${err.message}`);
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Pagination logic
  const totalPages = Math.ceil(orders.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentOrders = orders.slice(indexOfFirstItem, indexOfLastItem);

  // Handle edit click
  const handleEditClick = (order) => {
    setSelectedOrder(order);
    setUpdatedStatus(order.status || "completed"); // Default to 'completed' as per JSON
    setIsModified(false);
  };

  // Handle status change
  const handleStatusChange = (e) => {
    setUpdatedStatus(e.target.value);
    setIsModified(true);
  };

  // Save changes to the order
  const handleSaveChanges = async () => {
    if (!selectedOrder || !selectedOrder._id) {
      alert("Invalid order selected.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `https://api.neightivglobal.com/api/shiprocket/orders/${selectedOrder._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            // Add authentication headers if required
            // "Authorization": "Bearer <your-token>"
          },
          body: JSON.stringify({ status: updatedStatus }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update order status.");
      }

      const updatedOrder = await response.json();
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === updatedOrder._id ? { ...order, status: updatedOrder.status } : order
        )
      );
      alert("✅ Order status updated successfully!");
      setSelectedOrder(null);
    } catch (err) {
      alert(`❌ Error: ${err.message}`);
      setError(`Failed to update order: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-4" style={{width:'80%', marginLeft:'20%'}}>
      <h3 className="text-center mb-4">Order Management</h3>

      {loading && (
        <div className="text-center">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      )}
      {error && <Alert variant="danger">{error}</Alert>}

      {!selectedOrder ? (
        <>
          {orders.length === 0 && !loading && !error && (
            <Alert variant="info">No orders found.</Alert>
          )}
          {orders.length > 0 && (
            <>
              <Table bordered hover responsive className="shadow-sm" >
                <thead className="bg-light">
                  <tr className="text-center">
                    <th>#</th>
                    <th>Customer</th>
                    <th>Amount (₹)</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentOrders.map((order, index) => (
                    <tr key={order._id} className="text-center">
                      <td>{indexOfFirstItem + index + 1}</td>
                      <td>{order.shippingAddress?.name || "N/A"}</td>
                      <td>₹{order.total ? Number(order.total).toFixed(2) : "0.00"}</td>
                      <td>{order.status || "N/A"}</td>
                      <td>
                        {order.createdAt
                          ? new Date(order.createdAt).toLocaleDateString("en-IN")
                          : "N/A"}
                      </td>
                      <td>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => handleEditClick(order)}
                        >
                          Edit
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>

              <Pagination className="justify-content-center mt-3">
                <Pagination.First
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                />
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
            </>
          )}
        </>
      ) : (
        <>
          <Button
            variant="secondary"
            onClick={() => setSelectedOrder(null)}
            className="mb-3"
            disabled={loading}
          >
            Back
          </Button>

          <h4>Order Details</h4>
          <Card className="mb-4 shadow-sm">
            <Card.Body>
              <h5>{selectedOrder.shippingAddress?.name || "N/A"}</h5>
              <p>
                <strong>Total:</strong> ₹
                {selectedOrder.total ? Number(selectedOrder.total).toFixed(2) : "0.00"}
              </p>
              <p>
                <strong>Status:</strong> {selectedOrder.status || "N/A"}
              </p>
              <p>
                <strong>Date:</strong>{" "}
                {selectedOrder.createdAt
                  ? new Date(selectedOrder.createdAt).toLocaleDateString("en-IN")
                  : "N/A"}
              </p>
              <p>
                <strong>Address:</strong>{" "}
                {selectedOrder.shippingAddress
                  ? `${selectedOrder.shippingAddress.address}, ${selectedOrder.shippingAddress.city}, ${selectedOrder.shippingAddress.state} - ${selectedOrder.shippingAddress.pincode}`
                  : "N/A"}
              </p>
              <p>
                <strong>Email:</strong> {selectedOrder.shippingAddress?.email || "N/A"}
              </p>
              <p>
                <strong>Phone:</strong> {selectedOrder.shippingAddress?.phone || "N/A"}
              </p>
            </Card.Body>
          </Card>

          <h5>Products</h5>
          <Table bordered hover responsive className="mb-4">
            <thead>
              <tr>
                <th>Name</th>
                <th>Price (₹)</th>
                <th>Quantity</th>
              </tr>
            </thead>
            <tbody>
              {selectedOrder.items?.map((item, index) => (
                <tr key={index}>
                  <td>{item.name || "N/A"}</td>
                  <td>₹{item.price ? Number(item.price).toFixed(2) : "0.00"}</td>
                  <td>{item.quantity || "N/A"}</td>
                </tr>
              ))}
            </tbody>
          </Table>

          {/* <Form.Group className="mb-3" style={{ maxWidth: "300px" }}>
            <Form.Label>Update Status</Form.Label>
            <Form.Select value={updatedStatus} onChange={handleStatusChange}>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="ready for dispatch">Ready for Dispatch</option>
              <option value="delivered">Delivered</option>
            </Form.Select>
          </Form.Group> */}

          {/* <Button
            variant="success"
            onClick={handleSaveChanges}
            disabled={!isModified || loading}
          >
            {loading ? <Spinner animation="border" size="sm" /> : "Save Changes"}
          </Button> */}
        </>
      )}
    </Container>
  );
};

export default OrdersPage;