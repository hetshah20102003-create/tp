import React, { useEffect, useState } from 'react';
import { getUrl } from 'aws-amplify/storage';

const CategoryDetails = ({ category, onClose }) => {
  const [truckImages, setTruckImages] = useState({});
  const [unitImages, setUnitImages] = useState({});
  const [categoryImage, setCategoryImage] = useState(null);

  if (!category) return null;

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        if (category.imageKey) {
          const { url } = await getUrl({
            key: category.imageKey,
            options: { level: "public" },
          });
          setCategoryImage(url.toString());
        }

        if (category.truckSizeWiseRate) {
          const images = {};
          for (const truck of category.truckSizeWiseRate) {
            if (truck.imageUrl) {
              const { url } = await getUrl({
                key: truck.imageUrl,
                options: { level: "public" },
              });
              images[truck.imageUrl] = url.toString();
            }
          }
          setTruckImages(images);
        }

        if (category.unitWiseRate) {
          const images = {};
          for (const unit of category.unitWiseRate) {
            if (unit.imageUrl) {
              const { url } = await getUrl({
                key: unit.imageUrl,
                options: { level: "public" },
              });
              images[unit.imageUrl] = url.toString();
            }
          }
          setUnitImages(images);
        }
      } catch (error) {
        console.error("Error fetching S3 images:", error);
      }
    };

    fetchImages();
  }, [category]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg sm:rounded-xl shadow-xl max-w-5xl w-full my-4 sm:my-8 max-h-[95vh] overflow-y-auto">
        
        {/* Header */}
        <div className="sticky top-0 bg-white z-10 flex items-center justify-between p-3 sm:p-4 md:p-5 border-b border-gray-200">
          <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-800 truncate pr-2">{category.name}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition flex-shrink-0 text-xl sm:text-2xl w-8 h-8 flex items-center justify-center"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6 md:space-y-8">
          
          {/* Category Image */}
          {categoryImage && (
            <div className="flex justify-center">
              <div className="w-full max-w-md h-48 sm:h-60 md:h-72 flex items-center justify-center bg-gray-50 rounded-lg shadow-md">
                <img
                  src={categoryImage}
                  alt={category.name}
                  className="max-h-full w-full object-contain p-2"
                />
              </div>
            </div>
          )}

          {/* Basic Information */}
          <section>
            <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-2 sm:mb-3">Basic Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 md:gap-4 bg-gray-50 p-3 sm:p-4 rounded-lg">
              <div className="text-sm sm:text-base">
                <span className="font-medium">ID:</span> <span className="font-mono text-xs sm:text-sm">{category.id}</span>
              </div>
              <div className="text-sm sm:text-base">
                <span className="font-medium">Category:</span> {category.category}
              </div>
              <div className="text-sm sm:text-base">
                <span className="font-medium">Created:</span> <span className="text-xs sm:text-sm">{formatDate(category.createdAt)}</span>
              </div>
              <div className="text-sm sm:text-base">
                <span className="font-medium">Popular:</span>{" "}
                <span className={`inline-block px-2 py-1 text-xs rounded-full ${category.popular ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                  {category.popular ? "Yes" : "No"}
                </span>
              </div>
            </div>
          </section>

          {/* Description */}
          {category.description && (
            <section>
              <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-2 sm:mb-3">Description</h3>
              <p className="bg-gray-50 p-3 sm:p-4 rounded-lg text-gray-700 text-sm sm:text-base break-words">{category.description}</p>
            </section>
          )}

          <section>
            <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-2 sm:mb-3">Is Open Category</h3>
            <p className="bg-gray-50 p-3 sm:p-4 rounded-lg text-gray-700 text-sm sm:text-base">{category.isopenCategory ? "Yes" : "No"}</p>
          </section>
     
          {/* Floor-wise Rates */}
          {category.additionalRate?.length > 0 && (
            <section>
              <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-2 sm:mb-3">Floor-wise Rates</h3>
              <div className="space-y-2">
                {category.additionalRate.map((floor, i) => (
                  <div key={i} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 bg-gray-50 p-2 sm:p-3 rounded-md">
                    <span className="text-sm sm:text-base font-medium">Floor {floor.floorNumber}</span>
                    <span className="font-bold text-sm sm:text-base">{formatCurrency(floor.rate)}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Truck-wise Rates */}
          {category.truckSizeWiseRate?.length && category.isopenCategory && (
            <section>
              <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-2 sm:mb-3">Truck-wise Rates</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {category.truckSizeWiseRate.map((truck, i) => (
                  <div key={i} className="p-3 sm:p-4 bg-gray-50 rounded-lg shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                    {truck.imageUrl && truckImages[truck.imageUrl] && (
                      <img
                        src={truckImages[truck.imageUrl]}
                        alt={truck.truckSize}
                        className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-lg flex-shrink-0"
                      />
                    )}
                    <div className="flex flex-col gap-1 min-w-0 flex-1">
                      <p className="font-medium text-sm sm:text-base truncate">{truck.truckSize}</p>
                      <p className="font-bold text-sm sm:text-base">{formatCurrency(truck.rate)}</p>
                      <p className="text-xs sm:text-sm text-gray-600 font-bold">Min Labour: {truck.LabourCount}</p>
                      {truck.maxLabourAddAllowance > 0 && (
                        <p className="text-xs sm:text-sm text-gray-600 font-bold">Max Labour: {truck.maxLabourAddAllowance}</p>
                      )}
                      {truck.ExtraLabourPrice > 0 && (
                        <p className="text-xs sm:text-sm text-gray-600 font-bold">Extra: {formatCurrency(truck.ExtraLabourPrice)}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Ton-wise Rates */}
          {category.tonWiseRate?.length > 0 && !category.isopenCategory && (
            <section>
              <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-2 sm:mb-3">Ton-wise Rates</h3>
              <div className="space-y-2">
                {category.tonWiseRate.map((ton, i) => (
                  <div key={i} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 bg-gray-50 p-2 sm:p-3 rounded-md">
                    <span className="text-sm sm:text-base font-medium">Ton {ton.TonSize || ton.tonNumber}</span>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-2">
                      <span className="font-bold text-sm sm:text-base">{formatCurrency(ton.rate)}</span>
                      <span className="text-xs sm:text-sm text-gray-600">(Min Labour: {ton.MinLabourCount})</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}  

          {/* Unit-wise Rates */}
          {category.unitWiseRate?.length > 0 && (
            <section>
              <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-2 sm:mb-3">Unit-wise Rates</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {category.unitWiseRate.map((unit, i) => (
                  <div key={i} className="p-3 sm:p-4 bg-gray-50 rounded-lg shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                    {unit.imageUrl && unitImages[unit.imageUrl] && (
                      <img
                        src={unitImages[unit.imageUrl]}
                        alt={`Unit ${unit.unitNumber}`}
                        className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-lg flex-shrink-0"
                      />
                    )}
                    <div className="flex flex-col gap-1 min-w-0 flex-1">
                      <p className="font-medium text-sm sm:text-base">Unit {unit.unitNumber}</p>
                      <p className="font-bold text-sm sm:text-base">{formatCurrency(unit.rate)}</p>
                      {unit.maxLabourAddAllowance > 0 && (
                        <p className="text-xs sm:text-sm text-gray-600 font-bold">Max Labour: {unit.maxLabourAddAllowance}</p>
                      )}
                      {unit.ExtraLabourPrice > 0 && (
                        <p className="text-xs sm:text-sm text-gray-600 font-bold">Extra: {formatCurrency(unit.ExtraLabourPrice)}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Actions */}
          <div className="flex justify-end pt-3 sm:pt-4 border-t border-gray-200 sticky bottom-0 bg-white">
            <button
              onClick={onClose}
              className="px-4 sm:px-5 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium text-sm sm:text-base transition-colors"
            >
              Close
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CategoryDetails;
