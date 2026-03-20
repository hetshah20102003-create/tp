import React, { useState, useEffect } from 'react';
import { getUrl } from 'aws-amplify/storage';
import { uploadData } from 'aws-amplify/storage';

const CategoryForm = ({ category, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    id: '',
    category: '',
    description: '',
    rate: '',
    commission: '',
    image: '',
    popular: false,
    additionalRate: [], // Floor-wise rates
    tonWiseRate: [],
    truckSizeWiseRate: [],
    unitWiseRate: [],
    isopenCategory: false,
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);


  // ✅ NEW: image preview maps for trucks & units
  const [truckPreviews, setTruckPreviews] = useState({});
  const [unitPreviews, setUnitPreviews] = useState({});

  useEffect(() => {
    const loadImage = async () => {
      if (category?.imageKey) {
        try {
          const { url } = await getUrl({
            key: category.imageKey,
            options: { level: "public" },
          });
          setImagePreview(url.toString());
        } catch (err) {
          console.error("Error fetching image from S3:", err);
          setImagePreview(null);
        }
      } else {
        setImagePreview(category?.image || null);
      }
    };

    const loadTruckAndUnitImages = async () => {
      if (category?.truckSizeWiseRate?.length) {
        const previews = {};
        for (let i = 0; i < category.truckSizeWiseRate.length; i++) {
          const truck = category.truckSizeWiseRate[i];
          if (truck.imageUrl) {
            try {
              const { url } = await getUrl({
                key: truck.imageUrl,
                options: { level: "public" },
              });
              previews[i] = url.toString();
            } catch (err) {
              console.error("Error loading truck image:", err);
            }
          }
        }
        setTruckPreviews(previews);
      }

      if (category?.unitWiseRate?.length) {
        const previews = {};
        for (let i = 0; i < category.unitWiseRate.length; i++) {
          const unit = category.unitWiseRate[i];
          if (unit.imageUrl) {
            try {
              const { url } = await getUrl({
                key: unit.imageUrl,
                options: { level: "public" },
              });
              previews[i] = url.toString();
            } catch (err) {
              console.error("Error loading unit image:", err);
            }
          }
        }
        setUnitPreviews(previews);
      }
    };

    if (category) {
      setFormData({
        name: category.name || "",
        id: category.id || "",
        category: category.category || "",
        description: category.description || "",
        rate: category.rate || "",
        commission: category.commission || "",
        image: "",
        popular: category.popular || false,
        additionalRate: category.additionalRate || [],
        tonWiseRate: category.tonWiseRate || [],
        truckSizeWiseRate: category.truckSizeWiseRate || [],
        unitWiseRate: category.unitWiseRate || [],
        isopenCategory: category.isopenCategory || false,
      });
      setImageFile(null);
      loadImage();
      loadTruckAndUnitImages(); // ✅ load previews for trucks & units
    } else {
      setFormData({
        name: "",
        id: "",
        category: "",
        description: "",
        rate: "",
        commission: "",
        image: "",
        popular: false,
        additionalRate: [],
        tonWiseRate: [],
        truckSizeWiseRate: [],
        unitWiseRate: [],
        isopenCategory: false,
      });
      setImagePreview(null);
      setImageFile(null);
    }
  }, [category]);


  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleFloorChange = (index, field, value) => {
    const newFloors = [...formData.additionalRate];
    newFloors[index][field] = value;
    setFormData((prev) => ({ ...prev, additionalRate: newFloors }));
  };

  const addFloor = () => {
    setFormData((prev) => ({
      ...prev,
      additionalRate: [...prev.additionalRate, { floorNumber: '', rate: '' }],
    }));
  };

  const removeFloor = (index) => {
    const newFloors = [...formData.additionalRate];
    newFloors.splice(index, 1);
    setFormData((prev) => ({ ...prev, additionalRate: newFloors }));
  };


  /** ---------- Ton-wise CRUD ---------- **/
  const handleTonChange = (index, field, value) => {
    const newTons = [...formData.tonWiseRate];
    newTons[index][field] = value;
    setFormData((prev) => ({ ...prev, tonWiseRate: newTons }));
  };

  const addTon = () =>
    setFormData((prev) => ({
      ...prev,
      tonWiseRate: [...prev.tonWiseRate, { MinLabourCount: "", rate: "", TonSize: "" }],
    }));

  const removeTon = (index) => {
    const newTons = [...formData.tonWiseRate];
    newTons.splice(index, 1);
    setFormData((prev) => ({ ...prev, tonWiseRate: newTons }));
  };

  /** ---------- Truck-wise CRUD ---------- **/
  const handleTruckChange = (index, field, value) => {
    const newTrucks = [...formData.truckSizeWiseRate];
    newTrucks[index][field] = value;
    setFormData((prev) => ({ ...prev, truckSizeWiseRate: newTrucks }));
  };

  const addTruck = () =>
    setFormData((prev) => ({
      ...prev,
      truckSizeWiseRate: [...prev.truckSizeWiseRate, { truckSize: "", rate: "", imageKey: "", maxLabourAddAllowance: "", ExtraLabourPrice: "" }],
    }));

  const removeTruck = (index) => {
    const newTrucks = [...formData.truckSizeWiseRate];
    newTrucks.splice(index, 1);
    setFormData((prev) => ({ ...prev, truckSizeWiseRate: newTrucks }));
  };

  const handleTruckImageUpload = (index, file) => {
    if (!file) return;
    const newTrucks = [...formData.truckSizeWiseRate];
    newTrucks[index].file = file; // keep temp file for upload
    setFormData((prev) => ({ ...prev, truckSizeWiseRate: newTrucks }));
    setTruckPreviews((prev) => ({ ...prev, [index]: URL.createObjectURL(file) }));
  };

  /** ---------- Unit-wise CRUD ---------- **/
  const handleUnitChange = (index, field, value) => {
    const newUnits = [...formData.unitWiseRate];
    newUnits[index][field] = value;
    setFormData((prev) => ({ ...prev, unitWiseRate: newUnits }));
  };

  const addUnit = () =>
    setFormData((prev) => ({
      ...prev,
      unitWiseRate: [...prev.unitWiseRate, { unitNumber: "", rate: "", imageKey: "", maxLabourAddAllowance: "", ExtraLabourPrice: "" }],
    }));

  const removeUnit = (index) => {
    const newUnits = [...formData.unitWiseRate];
    newUnits.splice(index, 1);
    setFormData((prev) => ({ ...prev, unitWiseRate: newUnits }));
  };

  const handleUnitImageUpload = (index, file) => {
    if (!file) return;
    const newUnits = [...formData.unitWiseRate];
    newUnits[index].file = file;
    setFormData((prev) => ({ ...prev, unitWiseRate: newUnits }));
    setUnitPreviews((prev) => ({ ...prev, [index]: URL.createObjectURL(file) }));
  };


  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({ ...prev, image: 'Image size should be less than 5MB' }));
        return;
      }
      setImageFile(file);
      setFormData((prev) => ({ ...prev, image: '' }));
      setImagePreview(URL.createObjectURL(file));
      if (errors.image) setErrors((prev) => ({ ...prev, image: '' }));
    }
  };

  const handleImageUrlChange = (e) => {
    const url = e.target.value;
    setFormData((prev) => ({ ...prev, image: url }));
    setImageFile(null);
    setImagePreview(isValidUrl(url) ? url : null);
    if (errors.image) setErrors((prev) => ({ ...prev, image: '' }));
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setFormData((prev) => ({ ...prev, image: '' }));
  };

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (category && !formData.id.trim()) newErrors.id = 'Id is required';
    if (!formData.category.trim()) newErrors.category = 'Category is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (formData.rate && (isNaN(formData.rate) || formData.rate <= 0))
      newErrors.rate = 'Rate must be a positive number';
    if (formData.commission && (isNaN(formData.commission) || formData.commission < 0 || formData.commission > 100))
      newErrors.commission = 'Commission must be between 0 and 100';
    formData.additionalRate.forEach((floor, index) => {
      if (!floor.floorNumber || isNaN(floor.floorNumber) || floor.floorNumber <= 0)
        newErrors[`floorNumber${index}`] = 'Floor number must be a positive integer';
      if (!floor.rate || isNaN(floor.rate) || floor.rate <= 0)
        newErrors[`floorRate${index}`] = 'Rate must be a positive number';
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    console.log("done 0");
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);

    console.log("done 1");

    try {
      let dataToSend = { ...formData };

      // Upload Truck Images
      for (let i = 0; i < dataToSend.truckSizeWiseRate.length; i++) {
        const truck = dataToSend.truckSizeWiseRate[i];
        if (truck.file) {
          const uploadResponse = await uploadData({
            key: `category/${formData.name}/trucks/${truck.file.name}`,
            data: truck.file,
            options: { contentType: truck.file.type, level: "public" },
          }).result;
          truck.imageUrl = uploadResponse.key;
          delete truck.file;
        }
      }

      // Upload Unit Images
      for (let i = 0; i < dataToSend.unitWiseRate.length; i++) {
        const unit = dataToSend.unitWiseRate[i];
        if (unit.file) {
          const uploadResponse = await uploadData({
            key: `category/${formData.name}/units/${unit.file.name}`,
            data: unit.file,
            options: { contentType: unit.file.type, level: "public" },
          }).result;
          unit.imageUrl = uploadResponse.key;
          delete unit.file;
        }
      }


      if (imageFile) {
        dataToSend.imageFile = imageFile;
        dataToSend.image = null;
      } else if (formData.image === '') {
        dataToSend.image = null;
      } else {
        dataToSend.image = formData.image;
      }

      await onSubmit(dataToSend);
      onClose();
    } catch (error) {
      console.log("done 2");
      console.error('Error submitting form:', error);
    } finally {
      console.log("done 3");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full my-4 sm:my-8 max-h-[95vh] overflow-y-auto">
        <div className="sticky top-0 bg-white z-10 flex items-center justify-between p-3 sm:p-4 md:p-6 border-b border-gray-200">
          <h2 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900 truncate pr-2">
            {category ? 'Edit Category' : 'Add New Category'}
          </h2>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0 w-8 h-8 flex items-center justify-center"
            aria-label="Close"
          >
            <i className="fas fa-times text-lg sm:text-xl"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-4 md:space-y-6">
          {/* Name & ID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${errors.name ? 'border-red-300' : 'border-gray-300'
                  }`}
                placeholder="e.g., Plumber, Electrician"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            {!category && (
              <div className="flex items-center justify-center bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <i className="fas fa-info-circle text-blue-600"></i>
                  <span className="text-sm text-blue-800 font-medium">
                    Category code will be generated automatically
                  </span>
                </div>
              </div>
            )}

            {category && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Id *</label>
                <input
                  type="text"
                  name="id"
                  value={formData.id}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${errors.id ? 'border-red-300' : 'border-gray-300'
                    }`}
                  placeholder="e.g., PLB001, ELE002"
                />
                {errors.id && <p className="text-red-500 text-xs mt-1">{errors.id}</p>}
              </div>
            )}
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
            <input
              type="text"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${errors.category ? 'border-red-300' : 'border-gray-300'
                }`}
              placeholder="e.g., Plumbing, Electrical, etc."
            />
            {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${errors.description ? 'border-red-300' : 'border-gray-300'
                }`}
              placeholder="Describe the service category..."
            />
            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
          </div>

          {/* Rate & Commission */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rate (₹)</label>
              <input
                type="number"
                name="rate"
                value={formData.rate}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${errors.rate ? 'border-red-300' : 'border-gray-300'
                  }`}
                placeholder="e.g., 500.00"
              />
              {errors.rate && <p className="text-red-500 text-xs mt-1">{errors.rate}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Commission (%)</label>
              <input
                type="number"
                name="commission"
                value={formData.commission}
                onChange={handleInputChange}
                min="0"
                max="100"
                step="0.1"
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${errors.commission ? 'border-red-300' : 'border-gray-300'
                  }`}
                placeholder="e.g., 10"
              />
              {errors.commission && <p className="text-red-500 text-xs mt-1">{errors.commission}</p>}
            </div>
          </div>


          {/* Is Open Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Is Open Category</label>
            <input type="checkbox" name="isopenCategory" checked={formData.isopenCategory} onChange={handleInputChange} className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
          </div>

          {/* Floor-wise Rates */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Floor-wise Rates</label>
            {formData.additionalRate.map((floor, index) => (
              <div key={index} className="mb-3 pb-3 border-b border-gray-200 last:border-0">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mb-2">
                  <input
                    type="number"
                    placeholder="Floor Number"
                    value={floor.floorNumber}
                    onChange={(e) => handleFloorChange(index, 'floorNumber', e.target.value)}
                    className={`flex-1 w-full sm:w-1/2 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors[`floorNumber${index}`] ? 'border-red-300' : 'border-gray-300'
                      }`}
                  />
                  <input
                    type="number"
                    placeholder="Rate (₹)"
                    value={floor.rate}
                    onChange={(e) => handleFloorChange(index, 'rate', e.target.value)}
                    className={`flex-1 w-full sm:w-1/2 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors[`floorRate${index}`] ? 'border-red-300' : 'border-gray-300'
                      }`}
                  />
                  <button
                    type="button"
                    onClick={() => removeFloor(index)}
                    className="w-full sm:w-auto px-3 py-2 text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors rounded-lg text-sm font-medium"
                  >
                    <i className="fas fa-trash mr-1"></i>Remove
                  </button>
                </div>
                {errors[`floorNumber${index}`] && <p className="text-red-500 text-xs mt-1">{errors[`floorNumber${index}`]}</p>}
                {errors[`floorRate${index}`] && <p className="text-red-500 text-xs mt-1">{errors[`floorRate${index}`]}</p>}
              </div>
            ))}
            <button
              type="button"
              onClick={addFloor}
              className="w-full sm:w-auto px-3 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              <i className="fas fa-plus mr-1"></i>Add Floor Rate
            </button>
          </div>

          {/* Ton-wise Rates */}
          {!formData.isopenCategory && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ton-wise Rates</label>
              {formData.tonWiseRate.map((ton, index) => (
                <div key={index} className="mb-4 pb-4 border-b border-gray-200 last:border-0 space-y-2">
                  <input
                    type="text"
                    placeholder="Ton Size"
                    value={ton.TonSize || ""}
                    onChange={(e) => handleTonChange(index, "TonSize", e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 border-gray-300"
                  />
                  <input
                    type="number"
                    placeholder="Minimum Labour Required"
                    value={ton.MinLabourCount}
                    onChange={(e) => handleTonChange(index, "MinLabourCount", e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 border-gray-300"
                  />
                  <input
                    type="number"
                    placeholder="Rate (₹)"
                    value={ton.rate}
                    onChange={(e) => handleTonChange(index, "rate", e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 border-gray-300"
                  />
                  <button 
                    type="button" 
                    onClick={() => removeTon(index)} 
                    className="w-full sm:w-auto px-3 py-2 text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors rounded-lg text-sm font-medium"
                  >
                    <i className="fas fa-trash mr-1"></i>Remove
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addTon}
                className="w-full sm:w-auto px-3 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                <i className="fas fa-plus mr-1"></i>Add Ton Rate
              </button>
            </div>
          )}



          {/* Truck-wise Rates */}
          {formData.isopenCategory && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Truck-wise Rates</label>
              {formData.truckSizeWiseRate.map((truck, index) => (
                <div key={index} className="mb-4 pb-4 border-b border-gray-200 last:border-0 space-y-2">
                  <input
                    type="text"
                    placeholder="Truck Size"
                    value={truck.truckSize}
                    onChange={(e) => handleTruckChange(index, "truckSize", e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 border-gray-300"
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="number"
                      placeholder="Rate (₹)"
                      value={truck.rate}
                      onChange={(e) => handleTruckChange(index, "rate", e.target.value)}
                      className="px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 border-gray-300"
                    />
                    <input
                      type="number"
                      placeholder="Labour Number"
                      value={truck.LabourCount}
                      onChange={(e) => handleTruckChange(index, "LabourCount", e.target.value)}
                      className="px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 border-gray-300"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="number"
                      placeholder="Max Labour Add Allowance"
                      value={truck.maxLabourAddAllowance}
                      onChange={(e) => handleTruckChange(index, "maxLabourAddAllowance", e.target.value)}
                      className="px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 border-gray-300"
                    />
                    <input
                      type="number"
                      placeholder="Extra Labour Price (Per Labour)"
                      value={truck.ExtraLabourPrice}
                      onChange={(e) => handleTruckChange(index, "ExtraLabourPrice", e.target.value)}
                      className="px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 border-gray-300"
                    />
                  </div>
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleTruckImageUpload(index, e.target.files[0])}
                      className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 border-gray-300"
                    />
                    {truckPreviews[index] && (
                      <img src={truckPreviews[index]} alt="preview" className="mt-2 w-20 h-20 object-cover rounded-lg" />
                    )}
                  </div>
                  <button 
                    type="button" 
                    onClick={() => removeTruck(index)} 
                    className="w-full sm:w-auto px-3 py-2 text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors rounded-lg text-sm font-medium"
                  >
                    <i className="fas fa-trash mr-1"></i>Remove
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addTruck}
                className="w-full sm:w-auto px-3 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                <i className="fas fa-plus mr-1"></i>Add Truck Rate
              </button>
            </div>
          )}

          {/* Unit-wise Rates */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Unit-wise Rates</label>
            {formData.unitWiseRate.map((unit, index) => (
              <div key={index} className="mb-4 pb-4 border-b border-gray-200 last:border-0 space-y-2">
                <input
                  type="text"
                  placeholder="Unit No"
                  value={unit.unitNumber}
                  onChange={(e) => handleUnitChange(index, "unitNumber", e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 border-gray-300"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Rate (₹)"
                    value={unit.rate}
                    onChange={(e) => handleUnitChange(index, "rate", e.target.value)}
                    className="px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 border-gray-300"
                  />
                  <input
                    type="number"
                    placeholder="Max Labour Add Allowance"
                    value={unit.maxLabourAddAllowance}
                    onChange={(e) => handleUnitChange(index, "maxLabourAddAllowance", e.target.value)}
                    className="px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 border-gray-300"
                  />
                </div>
                <input
                  type="number"
                  placeholder="Extra Labour Price (Per Labour)"
                  value={unit.ExtraLabourPrice}
                  onChange={(e) => handleUnitChange(index, "ExtraLabourPrice", e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 border-gray-300"
                />
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleUnitImageUpload(index, e.target.files[0])}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 border-gray-300"
                  />
                  {unitPreviews[index] && (
                    <img src={unitPreviews[index]} alt="preview" className="mt-2 w-20 h-20 object-cover rounded-lg" />
                  )}
                </div>
                <button 
                  type="button" 
                  onClick={() => removeUnit(index)} 
                  className="w-full sm:w-auto px-3 py-2 text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors rounded-lg text-sm font-medium"
                >
                  <i className="fas fa-trash mr-1"></i>Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addUnit}
              className="w-full sm:w-auto px-3 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              <i className="fas fa-plus mr-1"></i>Add Unit Rate
            </button>
          </div>

          {/* Image Upload & Popular Checkbox */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category Image</label>
            {imagePreview && (
              <div className="mb-4 relative inline-block">
                <img
                  src={imagePreview}
                  alt="Category preview"
                  className="w-32 h-32 object-cover rounded-lg border border-gray-200"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
            )}
            <input
              type="url"
              value={formData.image}
              onChange={handleImageUrlChange}
              placeholder="https://example.com/image.jpg"
              className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${errors.image ? 'border-red-300' : 'border-gray-300'
                }`}
            />
            <p className="text-xs text-gray-500 mt-1">Enter a direct image URL or upload a file below</p>
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors mt-2">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <i className="fas fa-cloud-upload-alt text-3xl text-gray-400 mb-2"></i>
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
              </div>
              <input type="file" onChange={handleImageUpload} className="hidden" />
            </label>
            {errors.image && <p className="text-red-500 text-xs mt-1">{errors.image}</p>}
          </div>



          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="popular"
              checked={formData.popular}
              onChange={handleInputChange}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label className="text-sm font-medium text-gray-700">Mark as Popular Category</label>
          </div>

          {/* Buttons */}
          <div className="sticky bottom-0 bg-white flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-gray-200 -mx-3 sm:-mx-4 md:-mx-6 px-3 sm:px-4 md:px-6">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              {isSubmitting && <i className="fas fa-spinner fa-spin"></i>}
              <span>{category ? 'Update Category' : 'Create Category'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryForm;
