import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Button, Container, Row, Col, Table } from 'react-bootstrap';

const AdminPDFs = () => {
  const [dhlOrders, setDhlOrders] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchDhlOrders = async () => {
    setLoading(true);
    try {
      const response = await axios.get('https://api.neightivglobal.com/api/admin/orders');
      const reversedOrders = response.data.reverse(); // Latest first
      setDhlOrders(reversedOrders);
      setError(null);
    } catch (err) {
      console.error('Axios Error Details:', err.response?.data || err.message);
      setError(err.response?.data?.error || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDhlOrders();
  }, []);

  const handleDownload = (url) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = url.substring(url.lastIndexOf('/') + 1);
    link.click();
  };

  return (
    <Container style={{ marginLeft: '20%', marginTop: '50px' }}>
      <Row>
        <Col>
          <h2>DHL Orders</h2>

          {error && <p style={{ color: 'red' }}>{error}</p>}
          {loading ? (
            <p>Loading orders...</p>
          ) : dhlOrders.length > 0 ? (
            <Table striped bordered hover responsive className="mt-4" style={{ width: '90%' }}>
              <thead>
                <tr>
                  <th>Sl No</th>
                  <th>Receiver Name</th>
                  <th>Receiver Phone</th>
                  <th>AWB No</th>
                  <th>AWB PDF</th>
                  <th>Invoice PDF</th>
                </tr>
              </thead>
              <tbody>
                {dhlOrders.map((order, index) => (
                  <tr key={order._id}>
                    <td>{index + 1}</td>
                    <td>{order.receiverName || 'N/A'}</td>
                    <td>{order.receiverPhone || 'N/A'}</td>
                    <td>{order.awbNo || 'N/A'}</td>
                    <td>
                      {order.shipmentPdfPath ? (
                        <Button
                          variant="info"
                          size="sm"
                          onClick={() => handleDownload(order.shipmentPdfPath)}
                        >
                          Download Shipment PDF
                        </Button>
                      ) : (
                        <span>No shipment PDF</span>
                      )}
                    </td>
                    <td>
                      {order.invoicePath ? (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleDownload(order.invoicePath)}
                        >
                          Download Invoice PDF
                        </Button>
                      ) : (
                        <span>No invoice PDF</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <p>No orders found.</p>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default AdminPDFs;
