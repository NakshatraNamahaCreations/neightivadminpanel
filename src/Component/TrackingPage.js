import React, { useState } from "react";
import { Table, Button, Card, Form, Container, Alert, Spinner } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

const TrackingPage = () => {
  const [awbNumber, setAwbNumber] = useState("");
  const [trackingDetails, setTrackingDetails] = useState(null);
  const [shipments, setShipments] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchTracking = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("https://api.neightivglobal.com/api/dhl/fetch-tracking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ awbNumber, cookie: "YOUR_COOKIE_HERE" }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      if (data.error) {
        setError(data.error);
        setTrackingDetails(null);
      } else {
        setTrackingDetails({
          awbNumber: data.awbNumber,
          status: data.trackingDetails,
        });
      }
    } catch (err) {
      setError(`Failed to fetch tracking details: ${err.message}`);
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

 const fetchAllShipments = async () => {
  setLoading(true);
  setError(null);
  try {
    const response = await fetch("https://api.neightivglobal.com/api/dhl/get-all-shipments", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();
    if (data.shipments.length === 0) {
      setError(data.message || "No shipments found.");
      setShipments([]);
    } else {
      setShipments(data.shipments);
    }
  } catch (err) {
    setError(`Failed to fetch shipments: ${err.message}`);
    console.error("Fetch error:", err);
  } finally {
    setLoading(false);
  }
};


  const handleSubmit = (e) => {
    e.preventDefault();
    if (awbNumber) {
      fetchTracking();
    }
  };

  return (
    <Container className="py-4" style={{ width: "80%", marginLeft: "20%" }}>
      <h3 className="text-center mb-4">Tracking Management</h3>

      {loading && (
        <div className="text-center">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      )}
      {error && <Alert variant="danger">{error}</Alert>}

      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>AWB Number</Form.Label>
              <Form.Control
                type="text"
                value={awbNumber}
                onChange={(e) => setAwbNumber(e.target.value)}
                placeholder="Enter AWB Number"
              />
            </Form.Group>
            <Button
              variant="primary"
              type="submit"
              disabled={loading || !awbNumber}
              className="me-2"
            >
              {loading ? (
                <Spinner animation="border" size="sm" />
              ) : (
                "Fetch Tracking Details"
              )}
            </Button>
            {/* <Button
              variant="secondary"
              onClick={fetchAllShipments}
              disabled={loading}
            >
              {loading ? (
                <Spinner animation="border" size="sm" />
              ) : (
                "Fetch All Shipments"
              )}
            </Button> */}
          </Form>
        </Card.Body>
      </Card>

      {trackingDetails && (
        <>
          <h4>Tracking Details</h4>
          <Table bordered hover responsive className="shadow-sm">
            <thead className="bg-light">
              <tr className="text-center">
                <th>AWB Number</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr className="text-center">
                <td>{trackingDetails.awbNumber}</td>
                <td>{JSON.stringify(trackingDetails.status)}</td>
              </tr>
            </tbody>
          </Table>
        </>
      )}

      {shipments.length > 0 && (
        <>
          <h4>All Shipments</h4>
          <Table bordered hover responsive className="shadow-sm">
            <thead className="bg-light">
              <tr className="text-center">
                <th>AWB Number</th>
                <th>Receiver Name</th>
                <th>Address</th>
                <th>City</th>
                <th>Postal Code</th>
                <th>Country</th>
                <th>Declared Value</th>
                <th>Currency</th>
                <th>Weight</th>
                <th>Created Date</th>
                <th>Items</th>
              </tr>
            </thead>
            <tbody>
              {shipments.map((shipment, index) => (
                <tr key={index} className="text-center">
                  <td>{shipment.awbNumber}</td>
                  <td>{shipment.receiverName}</td>
                  <td>{shipment.receiverAddress}</td>
                  <td>{shipment.receiverCity}</td>
                  <td>{shipment.receiverPostalCode}</td>
                  <td>{shipment.receiverCountryCode}</td>
                  <td>{shipment.declaredValue}</td>
                  <td>{shipment.currency}</td>
                  <td>{shipment.weight}</td>
                  <td>{shipment.createdDate}</td>
                  <td>
                    {shipment.items
                      .map((item) => `${item.name} (x${item.quantity})`)
                      .join(", ")}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </>
      )}

      {!trackingDetails && !shipments.length && !loading && !error && (
        <Alert variant="info">
          No tracking details or shipments found. Enter an AWB number or fetch all shipments.
        </Alert>
      )}
    </Container>
  );
};

export default TrackingPage;