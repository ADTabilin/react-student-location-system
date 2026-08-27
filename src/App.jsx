import { useMemo, useState } from "react";
import { Alert, Badge, Button, Card, Col, Container, Form, Row, Spinner, Table } from "react-bootstrap";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";

const defaultCenter = [14.5995, 120.9842];

const markerIcon = L.divIcon({
  className: "student-marker",
  html: `<div style="width:30px;height:30px;border-radius:9999px;background:#0d6efd;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,.3);"></div>`,
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});

function MapRecenter({ center }) {
  const map = useMap();
  map.setView(center, center === defaultCenter ? 12 : 15);
  return null;
}

function App() {
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState({
    firstname: "",
    lastname: "",
    course: "",
    email: "",
    address: "",
  });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mapCenter, setMapCenter] = useState(defaultCenter);

  const totalStudents = students.length;
  const courses = useMemo(
    () => new Set(students.map((student) => student.course)).size,
    [students]
  );

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: "" }));
  };

  const validate = () => {
    const nextErrors = {};
    if (!form.firstname.trim()) nextErrors.firstname = "Firstname is required.";
    if (!form.lastname.trim()) nextErrors.lastname = "Lastname is required.";
    if (!form.course.trim()) nextErrors.course = "Course is required.";
    if (!form.email.trim()) nextErrors.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      nextErrors.email = "Enter a valid email address.";
    if (!form.address.trim()) nextErrors.address = "Address is required.";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const geocodeAddress = async (address) => {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(address)}`,
      {
        headers: {
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) throw new Error("The location service could not be reached.");
    const results = await response.json();
    if (!results.length) throw new Error("Address not found. Try adding a city or country.");
    return {
      lat: Number(results[0].lat),
      lng: Number(results[0].lon),
      displayName: results[0].display_name,
    };
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus(null);

    if (!validate()) return;

    setLoading(true);

    try {
      const location = await geocodeAddress(form.address);

      const newStudent = {
        id: crypto.randomUUID(),
        ...form,
        lat: location.lat,
        lng: location.lng,
        displayName: location.displayName,
      };

      setStudents((current) => [...current, newStudent]);
      setMapCenter([location.lat, location.lng]);
      setForm({
        firstname: "",
        lastname: "",
        course: "",
        email: "",
        address: "",
      });
      setErrors({});
      setStatus({
        type: "success",
        message: `${newStudent.firstname} ${newStudent.lastname} was registered successfully.`,
      });
    } catch (error) {
      setStatus({
        type: "danger",
        message: error.message || "Unable to locate the submitted address.",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteStudent = (id) => {
    const student = students.find((item) => item.id === id);
    setStudents((current) => current.filter((item) => item.id !== id));
    setStatus({
      type: "success",
      message: `${student?.firstname || "Student"} ${student?.lastname || ""} was removed.`,
    });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-gradient-to-r from-blue-700 to-indigo-700 text-white shadow">
        <Container className="py-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
             
              <h1 className="mb-1 text-3xl font-bold md:text-4xl">Student Location System</h1>
              <p className="mb-0 text-blue-100">
                Register students, locate their addresses, and manage their records.
              </p>
            </div>
            <div className="rounded-2xl bg-white/10 px-5 py-4 backdrop-blur">
              <div className="text-2xl font-bold">{totalStudents}</div>
              <div className="text-sm text-blue-100">Registered Students</div>
            </div>
          </div>
        </Container>
      </header>

      <Container className="py-5">
        {status && (
          <Alert
            variant={status.type}
            dismissible
            onClose={() => setStatus(null)}
            className="rounded-3 shadow-sm"
          >
            {status.message}
          </Alert>
        )}

        <Row className="g-4">
          <Col lg={5}>
            <Card className="h-100 rounded-4 border-0 shadow-sm">
              <Card.Body className="p-4">
                <div className="mb-4">
                 
                  <h2 className="text-2xl font-bold text-slate-800">Add a student</h2>
                  <p className="text-slate-500">
                    
                  </p>
                </div>

                <Form onSubmit={handleSubmit} noValidate>
                  <Row className="g-3">
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label className="fw-semibold">Firstname</Form.Label>
                        <Form.Control
                          name="firstname"
                          value={form.firstname}
                          onChange={handleChange}
                          isInvalid={!!errors.firstname}
                           placeholder=""
                          className="rounded-3 py-2"
                        />
                        <Form.Control.Feedback type="invalid">{errors.firstname}</Form.Control.Feedback>
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group>
                        <Form.Label className="fw-semibold">Lastname</Form.Label>
                        <Form.Control
                          name="lastname"
                          value={form.lastname}
                          onChange={handleChange}
                          isInvalid={!!errors.lastname}
                          placeholder=""
                          className="rounded-3 py-2"
                        />
                        <Form.Control.Feedback type="invalid">{errors.lastname}</Form.Control.Feedback>
                      </Form.Group>
                    </Col>

                    <Col md={12}>
                      <Form.Group>
                        <Form.Label className="fw-semibold">Course</Form.Label>
                        <Form.Control
                          name="course"
                          value={form.course}
                          onChange={handleChange}
                          isInvalid={!!errors.course}
                           placeholder=""
                          className="rounded-3 py-2"
                        />
                        <Form.Control.Feedback type="invalid">{errors.course}</Form.Control.Feedback>
                      </Form.Group>
                    </Col>

                    <Col md={12}>
                      <Form.Group>
                        <Form.Label className="fw-semibold">Email</Form.Label>
                        <Form.Control
                          type="email"
                          name="email"
                          value={form.email}
                          onChange={handleChange}
                          isInvalid={!!errors.email}
                           placeholder=""
                          className="rounded-3 py-2"
                        />
                        <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
                      </Form.Group>
                    </Col>

                    <Col md={12}>
                      <Form.Group>
                        <Form.Label className="fw-semibold">Address</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={3}
                          name="address"
                          value={form.address}
                          onChange={handleChange}
                          isInvalid={!!errors.address}
                           placeholder=""
                          className="rounded-3"
                        />
                        <Form.Control.Feedback type="invalid">{errors.address}</Form.Control.Feedback>
                      </Form.Group>
                    </Col>

                    <Col md={12}>
                      <Button
                        type="submit"
                        variant="primary"
                        disabled={loading}
                        className="w-100 rounded-3 py-2 fw-semibold"
                      >
                        {loading ? (
                          <>
                            <Spinner size="sm" className="me-2" />
                            Locating Address...
                          </>
                        ) : (
                          "Add Student "
                        )}
                      </Button>
                    </Col>
                  </Row>
                </Form>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={7}>
            <Card className="h-100 rounded-4 border-0 shadow-sm">
              <Card.Body className="p-0 overflow-hidden rounded-4">
                <div className="border-b bg-white p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h2 className="mb-1 text-2xl font-bold text-slate-800">Student Map</h2>
                      <p className="mb-0 text-slate-500">
                        {students.length
                          ? "Click any marker to view student details."
                          : ""}
                      </p>
                    </div>
                    
                  </div>
                </div>

                <div className="h-[520px] w-full">
                  <MapContainer
                    center={defaultCenter}
                    zoom={12}
                    scrollWheelZoom
                    className="h-full w-full"
                  >
                    <TileLayer
                      attribution='&copy; OpenStreetMap contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <MapRecenter center={mapCenter} />

                    {students.map((student) => (
                      <Marker
                        key={student.id}
                        position={[student.lat, student.lng]}
                        icon={markerIcon}
                      >
                        <Popup>
                          <div className="min-w-[220px]">
                            <div className="mb-2 text-lg font-bold">
                              {student.firstname} {student.lastname}
                            </div>
                            <div className="text-sm"><strong>Course:</strong> {student.course}</div>
                            <div className="text-sm"><strong>Email:</strong> {student.email}</div>
                            <div className="mt-2 text-sm"><strong>Address:</strong> {student.address}</div>
                            <div className="mt-2 text-xs text-slate-500">
                              Coordinates: {student.lat.toFixed(5)}, {student.lng.toFixed(5)}
                            </div>
                          </div>
                        </Popup>
                      </Marker>
                    ))}
                  </MapContainer>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Card className="mt-4 rounded-4 border-0 shadow-sm">
          <Card.Body className="p-4">
            <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
              <div>
                <Badge bg="success" className="mb-2 px-3 py-2">Registered Records</Badge>
                <h2 className="text-2xl font-bold text-slate-800">Student Directory</h2>
                <p className="mb-0 text-slate-500">
                  All registered students and their geographic coordinates.
                </p>
              </div>
              <div className="text-sm text-slate-500">
                Courses represented: <span className="font-bold text-slate-800">{courses}</span>
              </div>
            </div>

            <div className="overflow-x-auto rounded-3 border">
              <Table hover responsive className="mb-0 align-middle">
                <thead className="table-light">
                  <tr>
                    <th className="px-3 py-3">#</th>
                    <th className="px-3 py-3">Student</th>
                    <th className="px-3 py-3">Course</th>
                    <th className="px-3 py-3">Email</th>
                    <th className="px-3 py-3">Address</th>
                    <th className="px-3 py-3">Coordinates</th>
                    <th className="px-3 py-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {students.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="py-5 text-center text-slate-500">
                        No students registered yet.
                      </td>
                    </tr>
                  ) : (
                    students.map((student, index) => (
                      <tr key={student.id}>
                        <td className="px-3">{index + 1}</td>
                        <td className="px-3">
                          <div className="font-semibold text-slate-800">
                            {student.firstname} {student.lastname}
                          </div>
                        </td>
                        <td className="px-3">
                          <Badge bg="primary" className="fw-normal">{student.course}</Badge>
                        </td>
                        <td className="px-3">{student.email}</td>
                        <td className="px-3 min-w-[220px]">{student.address}</td>
                        <td className="px-3 whitespace-nowrap text-sm">
                          {student.lat.toFixed(5)}, {student.lng.toFixed(5)}
                        </td>
                        <td className="px-3 text-center">
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => deleteStudent(student.id)}
                            className="rounded-3"
                          >
                            Delete
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </div>
          </Card.Body>
        </Card>

        <footer className="py-5 text-center text-sm text-slate-500">
          TABILIN, ALIYAH MAYE - ACTIVITY 8 Student Location System
        </footer>
      </Container>
    </div>
  );
}

export default App;