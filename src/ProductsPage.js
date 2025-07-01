import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaSearch, FaTrash, FaEdit, FaTimes } from "react-icons/fa";
import { Button, Table, Pagination } from "react-bootstrap";

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    details: "",
    amount: "",
    dimension: "",
    sku: "",
    images: [null, null, null, null, null, null, null], // Support up to 7 images
    existingImages: [], // Store existing image URLs
    imagesToDelete: [], // Track images to delete
  });
  const [imagePreviews, setImagePreviews] = useState([null, null, null, null, null, null, null]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [isEditingProduct, setIsEditingProduct] = useState(false);
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
      const response = await axios.get("https://api.neightivglobal.com/api/products");
      const productsData = response.data.map((product) => ({
        ...product,
        formattedCreatedDate: new Date(product.createdAt).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }).split("/").join("/"),
      }));
      setProducts(productsData);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  // const handleImageChange = (e, index) => {
  //   const file = e.target.files[0];
  //   if (file) {
  //     if (file.size > 10 * 1024 * 1024) { // 10MB per file limit
  //       alert(`File "${file.name}" exceeds the 10MB size limit.`);
  //       return;
  //     }

  //     const updatedPreviews = [...imagePreviews];
  //     updatedPreviews[index] = URL.createObjectURL(file);
  //     setImagePreviews(updatedPreviews);

  //     const updatedImages = [...newProduct.images];
  //     updatedImages[index] = file; // Store File object for new images
  //     setNewProduct({ ...newProduct, images: updatedImages });
  //   }
  // };


//   const handleImageChange = (e, index) => {
//   const file = e.target.files[0];
//   if (!file) return;

//   if (file.size > 10 * 1024 * 1024) {
//     alert(`File "${file.name}" exceeds the 10MB limit.`);
//     return;
//   }

//   const updatedPreviews = [...imagePreviews];
//   updatedPreviews[index] = URL.createObjectURL(file);
//   setImagePreviews(updatedPreviews);

//   const updatedImages = [...newProduct.images];

//   // If the previous image at this index was a URL string, mark it for deletion
//   if (typeof updatedImages[index] === 'string') {
//     const updatedImagesToDelete = [...newProduct.imagesToDelete];
//     if (!updatedImagesToDelete.includes(updatedImages[index])) {
//       updatedImagesToDelete.push(updatedImages[index]);
//     }

//     const updatedExistingImages = newProduct.existingImages.filter(
//       (img) => img !== updatedImages[index]
//     );

//     setNewProduct({
//       ...newProduct,
//       images: Object.assign([], updatedImages, { [index]: file }),
//       existingImages: updatedExistingImages,
//       imagesToDelete: updatedImagesToDelete,
//     });
//   } else {
//     updatedImages[index] = file;
//     setNewProduct({
//       ...newProduct,
//       images: updatedImages,
//     });
//   }
// };


const handleImageChange = (e, index) => {
  const file = e.target.files[0];
  if (!file) return;

  if (file.size > 10 * 1024 * 1024) {
    alert(`File "${file.name}" exceeds the 10MB limit.`);
    return;
  }

  // Create new arrays for previews and images
  const updatedPreviews = [...imagePreviews];
  const updatedImages = [...newProduct.images];
  const updatedImagesToDelete = [...newProduct.imagesToDelete];
  const updatedExistingImages = [...newProduct.existingImages];

  // If there was a previous image at this index
  if (updatedImages[index]) {
    // If it was an existing image (URL string), mark it for deletion
    if (typeof updatedImages[index] === 'string') {
      if (!updatedImagesToDelete.includes(updatedImages[index])) {
        updatedImagesToDelete.push(updatedImages[index]);
      }
      // Remove from existing images
      const existingIndex = updatedExistingImages.indexOf(updatedImages[index]);
      if (existingIndex >= 0) {
        updatedExistingImages.splice(existingIndex, 1);
      }
    }
  }

  // Update the preview and image at the specific index
  updatedPreviews[index] = URL.createObjectURL(file);
  updatedImages[index] = file;

  setImagePreviews(updatedPreviews);
  setNewProduct({
    ...newProduct,
    images: updatedImages,
    existingImages: updatedExistingImages,
    imagesToDelete: updatedImagesToDelete,
  });
};


  const handleRemoveImage = (index) => {
    const updatedPreviews = [...imagePreviews];
    const updatedImages = [...newProduct.images];
    const updatedExistingImages = [...newProduct.existingImages];
    const updatedImagesToDelete = [...newProduct.imagesToDelete];

    // If the image is an existing one (URL string), add it to imagesToDelete
    if (updatedImages[index] && typeof updatedImages[index] === "string") {
      updatedImagesToDelete.push(updatedImages[index]);
      updatedExistingImages.splice(updatedExistingImages.indexOf(updatedImages[index]), 1);
    }

    // Clear the image and preview
    updatedPreviews[index] = null;
    updatedImages[index] = null;

    setImagePreviews(updatedPreviews);
    setNewProduct({
      ...newProduct,
      images: updatedImages,
      existingImages: updatedExistingImages,
      imagesToDelete: updatedImagesToDelete,
    });
  };

  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.description || !newProduct.amount) {
      alert("Please fill all required fields (Name, Description, Amount).");
      return;
    }

    const validImages = newProduct.images.filter((image) => image instanceof File);
    if (validImages.length < 1) {
      alert("Please upload at least one JPEG or PNG image.");
      return;
    }

    const totalSize = validImages.reduce((sum, image) => sum + image.size, 0);
    if (totalSize > 100 * 1024 * 1024) { // 100MB total limit
      alert("Total image size exceeds 100MB. Please upload smaller or fewer images.");
      return;
    }

    const formData = new FormData();
    formData.append("name", newProduct.name);
    formData.append("description", newProduct.description);
    formData.append("details", newProduct.details || "");
    formData.append("amount", newProduct.amount);
    formData.append("dimension", newProduct.dimension || "");
    formData.append("sku", newProduct.sku || "");

    validImages.forEach((image) => {
      formData.append("images", image);
    });

    try {
      const response = await axios.post("https://api.neightivglobal.com/api/products", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (response.data.message) {
        alert("Product added successfully!");
        setNewProduct({
          name: "",
          description: "",
          details: "",
          amount: "",
          dimension: "",
          sku: "",
          images: [null, null, null, null, null, null, null],
          existingImages: [],
          imagesToDelete: [],
        });
        setImagePreviews([null, null, null, null, null, null, null]);
        fetchProducts();
        setIsAddingProduct(false);
      } else {
        alert("Failed to add product.");
      }
    } catch (error) {
      console.error("Error adding product:", error.response?.data || error);
      alert(`An error occurred: ${error.response?.data?.error || "Unknown error"}`);
    }
  };

  const handleUpdateProduct = async () => {
    if (!newProduct._id) return;

    if (!newProduct.name || !newProduct.description || !newProduct.amount) {
      alert("Please fill all required fields (Name, Description, Amount).");
      return;
    }

    const validImages = newProduct.images.filter((img) => img instanceof File);
    const totalSize = validImages.reduce((sum, image) => sum + image.size, 0);
    if (totalSize > 100 * 1024 * 1024) { // 100MB total limit
      alert("Total image size exceeds 100MB. Please upload smaller or fewer images.");
      return;
    }

    const formData = new FormData();
    formData.append("name", newProduct.name);
    formData.append("description", newProduct.description);
    formData.append("details", newProduct.details || "");
    formData.append("amount", newProduct.amount);
    formData.append("dimension", newProduct.dimension || "");
    formData.append("sku", newProduct.sku || "");

  formData.append("existingImages", JSON.stringify(newProduct.images.map(img => 
    typeof img === 'string' ? img : null
  )));

    if (newProduct.imagesToDelete.length > 0) {
      formData.append("imagesToDelete", JSON.stringify(newProduct.imagesToDelete));
    }

 newProduct.images.forEach((img, index) => {
    if (img instanceof File) {
      formData.append(`images`, img);
    }
  });
    try {
      const response = await axios.put(
        `https://api.neightivglobal.com/api/products/${newProduct._id}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (response.data.message) {
        alert("Product updated successfully!");
        setNewProduct({
          name: "",
          description: "",
          details: "",
          amount: "",
          dimension: "",
          sku: "",
          images: [null, null, null, null, null, null, null],
          existingImages: [],
          imagesToDelete: [],
        });
        setImagePreviews([null, null, null, null, null, null, null]);
        fetchProducts();
        setIsAddingProduct(false);
        setIsEditingProduct(false);
      } else {
        alert("Failed to update product.");
      }
    } catch (error) {
      console.error("Error updating product:", error.response?.data || error);
      alert(`An error occurred: ${error.response?.data?.error || "Unknown error"}`);
    }
  };

  // const handleEditProduct = (productId) => {
  //   const productToEdit = products.find((product) => product._id === productId);
  //   if (!productToEdit) return;

  //   const updatedImages = [...productToEdit.images, ...Array(7 - productToEdit.images.length).fill(null)];
  //   const updatedPreviews = [...productToEdit.images.map((image) => `https://api.neightivglobal.com${image}`), ...Array(7 - productToEdit.images.length).fill(null)];

  //   setNewProduct({
  //     ...productToEdit,
  //     images: updatedImages,
  //     existingImages: productToEdit.images,
  //     imagesToDelete: [],
  //   });
  //   setImagePreviews(updatedPreviews);
  //   setIsAddingProduct(true);
  //   setIsEditingProduct(true);
  // };

//   const handleEditProduct = (productId) => {
//   const productToEdit = products.find((product) => product._id === productId);
//   if (!productToEdit) return;

//   const paddedImages = [...productToEdit.images, ...Array(7 - productToEdit.images.length).fill(null)];

//   setNewProduct({
//     ...productToEdit,
//     images: paddedImages,
//     existingImages: [...productToEdit.images],
//     imagesToDelete: [],
//   });

//   setImagePreviews(
//     paddedImages.map((img) => (img ? `https://api.neightivglobal.com${img}` : null))
//   );

//   setIsAddingProduct(true);
//   setIsEditingProduct(true);
// };


 const handleEditProduct = (productId) => {
  const productToEdit = products.find((product) => product._id === productId);
  if (!productToEdit) return;

  // Create padded images array with null for empty slots
  const paddedImages = [...productToEdit.images];
  while (paddedImages.length < 7) {
    paddedImages.push(null);
  }

  setNewProduct({
    ...productToEdit,
    images: paddedImages,
    existingImages: [...productToEdit.images],
    imagesToDelete: [],
  });

  // Create previews - existing images get URLs, others remain null
  const previews = paddedImages.map((img) => 
    img ? `https://api.neightivglobal.com${img}` : null
  );

  setImagePreviews(previews);
  setIsAddingProduct(true);
  setIsEditingProduct(true);
};


  const handleDeleteProduct = async (productId) => {
    try {
      const response = await axios.delete(`https://api.neightivglobal.com/api/products/${productId}`);
      if (response.data.message) {
        alert("Product deleted successfully!");
        fetchProducts();
      } else {
        alert("Failed to delete product.");
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("An error occurred while deleting the product.");
    }
  };

  const handleRowClick = (product) => {
    setSelectedProduct(product);
  };

  const handleBackToTable = () => {
    setSelectedProduct(null);
  };

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="container my-4" style={{ maxWidth: "120%", marginLeft: "10%" }}>
      <div className="row">
        <div className="col-md-8 mx-auto" style={{ width: "80%" }}>
          {isAddingProduct ? (
            <div
              style={{
                maxWidth: "1200px",
                margin: "0 auto",
                padding: "24px",
                background: "#fff",
                borderRadius: "16px",
                boxShadow: "0 0 20px rgba(0,0,0,0.05)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", marginBottom: "24px" }}>
                <button
                  onClick={() => {
                    setIsAddingProduct(false);
                    setIsEditingProduct(false);
                    setNewProduct({
                      name: "",
                      description: "",
                      details: "",
                      amount: "",
                      dimension: "",
                      sku: "",
                      images: [null, null, null, null, null, null, null],
                      existingImages: [],
                      imagesToDelete: [],
                    });
                    setImagePreviews([null, null, null, null, null, null, null]);
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "24px",
                    marginRight: "16px",
                  }}
                >
                  ←
                </button>
                <h2 style={{ margin: 0, color: "black" }}>
                  {isEditingProduct ? "Edit Product" : "Add Product"}
                </h2>
              </div>

              <div style={{ display: "flex", gap: "12px", marginBottom: "20px", flexWrap: "wrap" }}>
                {[0, 1, 2, 3, 4, 5, 6].map((index) => (
                  <div key={index} style={{ position: "relative" }}>
                    <label
                      htmlFor={`image${index}`}
                      style={{
                        width: "120px",
                        height: "120px",
                        border: "2px dashed #ccc",
                        borderRadius: "8px",
                        backgroundColor: "#f9f9f9",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        overflow: "hidden",
                        cursor: "pointer",
                      }}
                    >
                      {imagePreviews[index] ? (
                        <img
                          src={imagePreviews[index]}
                          alt="Preview"
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      ) : (
                        <span style={{ color: "#aaa", fontSize: "14px" }}>+ Add Image</span>
                      )}
                      <input
                        id={`image${index}`}
                        type="file"
                        accept="image/*"
                      // annotation: true
                        style={{ display: "none" }}
                        onChange={(e) => handleImageChange(e, index)}
                      />
                    </label>
                    {imagePreviews[index] && (
                      <button
                        onClick={() => handleRemoveImage(index)}
                        style={{
                          position: "absolute",
                          top: "5px",
                          right: "5px",
                          background: "rgba(0,0,0,0.6)",
                          color: "#fff",
                          border: "none",
                          borderRadius: "50%",
                          width: "24px",
                          height: "24px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                        }}
                      >
                        <FaTimes size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <input
                  type="text"
                  placeholder="Product Name"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  style={inputStyle}
                />
                <textarea
                  rows={3}
                  placeholder="Description"
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  style={{ ...inputStyle, resize: "none" }}
                />
                <textarea
                  rows={3}
                  placeholder="Details"
                  value={newProduct.details}
                  onChange={(e) => setNewProduct({ ...newProduct, details: e.target.value })}
                  style={{ ...inputStyle, resize: "none" }}
                />
                <input
                  type="number"
                  placeholder="Amount"
                  value={newProduct.amount}
                  onChange={(e) => setNewProduct({ ...newProduct, amount: e.target.value })}
                  style={inputStyle}
                />
                <input
                  type="text"
                  placeholder="Dimension (e.g., 10x20x30 cm)"
                  value={newProduct.dimension}
                  onChange={(e) => setNewProduct({ ...newProduct, dimension: e.target.value })}
                  style={inputStyle}
                />
                <input
                  type="text"
                  placeholder="SKU Code"
                  value={newProduct.sku}
                  onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })}
                  style={inputStyle}
                />
              </div>

              <div style={{ textAlign: "right", marginTop: "24px" }}>
                <button
                  onClick={isEditingProduct ? handleUpdateProduct : handleAddProduct}
                  style={{
                    backgroundColor: "#00614A",
                    color: "#fff",
                    border: "none",
                    padding: "10px 20px",
                    borderRadius: "6px",
                    fontSize: "16px",
                    cursor: "pointer",
                  }}
                >
                  {isEditingProduct ? "Update Product" : "Add Product"}
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div style={{ display: "flex", alignItems: "center", marginTop: "2%", position: "relative" }}>
                <div style={{ position: "relative" }}>
                  <input
                    type="text"
                    placeholder="Search"
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
                <div style={{ marginLeft: "auto" }}>
                  <button
                    onClick={() => setIsAddingProduct(true)}
                    style={{ padding: "5px 10px", cursor: "pointer" }}
                  >
                    + Add Product
                  </button>
                </div>
              </div>

              <div>
                {!selectedProduct && (
                  <>
                    <Table striped bordered hover responsive className="product-table shadow-sm" style={{ marginTop: "2%" }}>
                      <thead style={{ textAlign: "center" }}>
                        <tr>
                          <th>Sl.no</th>
                          <th>Product Name</th>
                          <th>Amount</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentProducts.map((product, index) => (
                          <tr key={product._id} style={{ cursor: "pointer", textAlign: "center" }}>
                            <td>{indexOfFirstItem + index + 1}</td>
                            <td onClick={() => handleRowClick(product)}>{product.name}</td>
                            <td onClick={() => handleRowClick(product)}>{product.amount}</td>
                            <td>
                              <div style={{ display: "inline-flex", alignItems: "center", gap: "10px" }}>
                                <FaEdit
                                  style={{ cursor: "pointer", marginRight: "5px" }}
                                  onClick={() => handleEditProduct(product._id)}
                                />
                                <FaTrash
                                  style={{ cursor: "pointer", color: "red" }}
                                  onClick={() => handleDeleteProduct(product._id)}
                                />
                              </div>
                            </td>
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
                  </>
                )}

                {selectedProduct && (
                  <div>
                    <button
                      onClick={handleBackToTable}
                      style={{
                        padding: "10px",
                        backgroundColor: "transparent",
                        color: "#333",
                        border: "none",
                        borderRadius: "50%",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                      aria-label="Back"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="40"
                        height="40"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6z" />
                      </svg>
                    </button>
                    <div
                      style={{
                        padding: "20px",
                        border: "1px solid #ddd",
                        borderRadius: "8px",
                        maxWidth: "900px",
                        margin: "0 auto",
                      }}
                    >
                      <div style={{ display: "flex", gap: "15px", marginBottom: "20px" }}>
                        {selectedProduct.images &&
                          selectedProduct.images.map((image, index) => {
                            const fullImageUrl = `https://api.neightivglobal.com${image}`;
                            return (
                              <div
                                key={index}
                                style={{
                                  width: "120px",
                                  height: "120px",
                                  border: "1px solid #ccc",
                                  borderRadius: "8px",
                                  overflow: "hidden",
                                  display: "flex",
                                  justifyContent: "center",
                                  alignItems: "center",
                                  backgroundColor: "#f9f9f9",
                                }}
                              >
                                <img
                                  src={fullImageUrl}
                                  alt={`Product ${index}`}
                                  style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                  }}
                                />
                              </div>
                            );
                          })}
                      </div>

                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "15px",
                          marginBottom: "20px",
                        }}
                      >
                        <div
                          style={{
                            padding: "10px 20px",
                            border: "1px solid #ddd",
                            borderRadius: "20px",
                            backgroundColor: "#f9f9f9",
                          }}
                        >
                          <strong>Amount:</strong> ₹{selectedProduct.amount}
                        </div>
                        <div
                          style={{
                            padding: "10px 20px",
                            border: "1px solid #ddd",
                            borderRadius: "20px",
                            backgroundColor: "#f9f9f9",
                          }}
                        >
                          <strong>Dimension:</strong> {selectedProduct.dimension || "N/A"}
                        </div>
                      </div>

                      <div>
                        <h3>Description</h3>
                        <p style={{ lineHeight: "1.6", color: "#555" }}>
                          {selectedProduct.description}
                        </p>
                      </div>
                      <div>
                        <h3>Details</h3>
                        <p style={{ lineHeight: "1.6", color: "#555" }}>
                          {selectedProduct.details || "No additional details provided."}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const inputStyle = {
  padding: "10px",
  border: "1px solid #ccc",
  borderRadius: "6px",
  fontSize: "14px",
  width: "100%",
};

export default ProductsPage;