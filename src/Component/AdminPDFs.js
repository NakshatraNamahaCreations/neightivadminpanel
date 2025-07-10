import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Button, Container, Row, Col, Table, Modal, Form } from 'react-bootstrap';

const AdminPDFs = () => {
  const [dhlOrders, setDhlOrders] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);  // Modal visibility state
  const [selectedOrder, setSelectedOrder] = useState(null);  // To keep track of the selected order for pickup
  const [pickupDetails, setPickupDetails] = useState({
    readyByTime: '',
    closeByTime: '',
    weight: '',
    totalShipments: 0,
  });

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

  const handleModalClose = () => {
    setShowModal(false);
    setPickupDetails({
      readyByTime: '',
      closeByTime: '',
      weight: '',
      totalShipments: 0,
    });
  };

  const handleModalShow = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  const handlePickupChange = (e) => {
    const { name, value } = e.target;
    setPickupDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value,
    }));
  };

const handlePickupSubmit = async () => {
  if (!selectedOrder) {
    alert('No order selected for pickup.');
    return;
  }

  try {
    // Validate inputs
    if (!pickupDetails.readyByTime || !pickupDetails.closeByTime || !pickupDetails.weight || !pickupDetails.totalShipments) {
      alert('All pickup details are required.');
      return;
    }
    if (isNaN(pickupDetails.weight) || pickupDetails.weight <= 0) {
      alert('Weight must be a positive number.');
      return;
    }
    if (isNaN(pickupDetails.totalShipments) || pickupDetails.totalShipments <= 0) {
      alert('Total shipments must be a positive number.');
      return;
    }

    // Extract date and time components
    const readyByTime = new Date(pickupDetails.readyByTime);
    const closeByTime = new Date(pickupDetails.closeByTime);
    const currentDate = new Date(); // Current date and time (04:53 PM IST, July 10, 2025)
    currentDate.setHours(16, 53, 0, 0); // Set to 04:53 PM IST

    // Validate dates and times
    if (readyByTime < currentDate || closeByTime < readyByTime) {
      alert('ReadyByTime must be now or in the future, and CloseByTime must be after ReadyByTime.');
      return;
    }

    const pickupDate = readyByTime.toISOString().split('T')[0]; // YYYY-MM-DD
    const readyByTimeFormatted = readyByTime.toTimeString().slice(0, 5); // HH:MM
    const closeByTimeHrs = closeByTime.getHours().toString().padStart(2, '0');
    const closeByTimeMins = closeByTime.getMinutes().toString().padStart(2, '0');

    // Construct pickup request data for SOAP API
    const pickupRequestData = {
      ShipperCompName: selectedOrder.billToPartyCompany || 'Neightiv India Private Limited',
      ShipperAdd1: 'Suguna Upper Crest Gattigere',
      ShipperAdd2: 'RR Nagar Bangalore',
      ShipperAdd3: '',
      PackageLocation: 'Front Desk',
      Shippercity: 'BANGALORE',
      ShipperPostCode: '560098',
      ShipperCountyCode: 'IN',
      ShipperName: selectedOrder.billToPartyCompany || 'Srinivasmn Nagaraja',
      ShipperPhone: selectedOrder.mobileNumber || '8569949497',
      PickupClosingTimeHrs: closeByTimeHrs,
      PickupClosingTimeMins: closeByTimeMins,
      Pieces: parseInt(pickupDetails.totalShipments, 10),
      PickupWeight: parseFloat(pickupDetails.weight),
      PickupContactName: selectedOrder.receiverName || 'NA',
      PickupContactPhone: selectedOrder.receiverPhone || '9686675113',
      PickupDate: pickupDate,
      ReadyByTime: readyByTimeFormatted,
      AccountNumber: '537986109',
      cookie: 'BIGipServerpl_dhlindiaplugin.com_443=!kfK86nQDmrO5xHN7MRQuST572YnrLoX+aA9KG8LvRIoHyHDhKvVgxCohP45xRRZHulE7tIVNWMbx4H8=; TS019cb396=010448b6557e17734619b004fae56ca049e24d13e4dbb0d9f28ebb249618f176d43bbee665ad32c4edd7daf2f9f4ec340e1fba98ff',
    };

    // Log request data for debugging
    console.log('Pickup Request Data:', pickupRequestData);

    const response = await axios.post(
      'https://api.neightivglobal.com/api/dhl/schedule-pickup',
      pickupRequestData,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    // Handle successful response
    if (response.data.status === 'success') {
      console.log('Pickup Scheduled:', response.data);
      alert(`Pickup Scheduled Successfully! Confirmation ID: ${response.data.confirmationId}`);
      handleModalClose();
    } else {
      throw new Error('Unexpected response status');
    }
  } catch (err) {
    console.error('Error scheduling pickup:', err.response?.data || err.message);
    const errorMessage = err.response?.data?.details || err.response?.data?.error || err.message;
    alert(`Failed to schedule pickup: ${errorMessage}`);
  }
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
                  <th>Schedule Pickup</th>
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
                    <td>
                      <Button
                        variant="success"
                        size="sm"
                        onClick={() => handleModalShow(order)}
                      >
                        Schedule Pickup
                      </Button>
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

      {/* Pickup Modal */}
      <Modal show={showModal} onHide={handleModalClose}>
        <Modal.Header closeButton>
          <Modal.Title>Schedule Pickup</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
  <Form.Label>Ready by Time</Form.Label>
  <Form.Control
    type="datetime-local"
    name="readyByTime"
    value={pickupDetails.readyByTime}
    onChange={handlePickupChange}
    min={new Date().toISOString().slice(0, 16)} // Prevent past dates
  />
</Form.Group>
<Form.Group>
  <Form.Label>Close by Time</Form.Label>
  <Form.Control
    type="datetime-local"
    name="closeByTime"
    value={pickupDetails.closeByTime}
    onChange={handlePickupChange}
    min={new Date().toISOString().slice(0, 16)} // Prevent past dates
  />
</Form.Group>
            <Form.Group>
              <Form.Label>Weight (kg)</Form.Label>
              <Form.Control
                type="number"
                name="weight"
                value={pickupDetails.weight}
                onChange={handlePickupChange}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Total Number of Shipments</Form.Label>
              <Form.Control
                type="number"
                name="totalShipments"
                value={pickupDetails.totalShipments}
                onChange={handlePickupChange}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleModalClose}>
            Close
          </Button>
          <Button variant="primary" onClick={handlePickupSubmit}>
            Submit Pickup Request
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AdminPDFs;
