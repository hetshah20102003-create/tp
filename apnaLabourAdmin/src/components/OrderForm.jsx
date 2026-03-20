import React, { useState } from "react";
import axios from "axios";
import { createOrder } from "../services/ordersAPI";

const OrderForm = () => {
  const [formData, setFormData] = useState({
    orderId: "",
    orderCategory: "",
    name: "",
    address: "",
    phoneNumber: "",
    totalLabour: "",
    labourName: "",
    city: "",
    area: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createOrder(formData);
      alert("✅ Order submitted successfully!");

      // 🔹 Reset form after submission
      setFormData({
        orderId: "",
        orderCategory: "",
        name: "",
        address: "",
        phoneNumber: "",
        totalLabour: "",
        labourName: "",
        city: "",
        area: "",
      });

    } catch (error) {
      console.error("Error submitting order:", error);
      alert("❌ Error submitting order. Please try again.");
    }
  };


  const fieldConfig = [
    { label: "Order ID", name: "orderId", type: "text", icon: "fa-hashtag" },
    { label: "Order Category", name: "orderCategory", type: "text", icon: "fa-tag" },
    { label: "Customer Name", name: "name", type: "text", icon: "fa-user" },
    { label: "Address", name: "address", type: "text", icon: "fa-map-marker-alt" },
    { label: "Phone Number", name: "phoneNumber", type: "tel", icon: "fa-phone" },
    { label: "Total Labour", name: "totalLabour", type: "number", icon: "fa-users" },
    { label: "Labour Name", name: "labourName", type: "text", icon: "fa-user-tie" },
    { label: "City", name: "city", type: "text", icon: "fa-city" },
    { label: "Area", name: "area", type: "text", icon: "fa-map" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto w-full">
        {/* Header Card */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-blue-50 rounded-lg">
              <i className="fas fa-file-invoice text-blue-600 text-xl"></i>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Create New Order</h2>
              <p className="text-sm text-gray-500 mt-1">Fill in the details below to create an order</p>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {fieldConfig.map(({ label, name, type, icon }) => (
                <div key={name} className={name === "address" ? "md:col-span-2" : ""}>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <i className={`fas ${icon} text-blue-600 text-xs`}></i>
                    {label}
                  </label>
                  <input
                    type={type}
                    name={name}
                    value={formData[name]}
                    onChange={handleChange}
                    placeholder={`Enter ${label.toLowerCase()}`}
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-gray-50 hover:bg-white text-sm"
                    required
                  />
                </div>
              ))}
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-4 border-t border-gray-200 mt-6">
              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2"
              >
                <i className="fas fa-check"></i>
                Submit Order
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OrderForm;
