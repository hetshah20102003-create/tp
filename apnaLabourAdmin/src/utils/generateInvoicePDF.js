// PDF Invoice Generation Utility - Enhanced Version
export const generateInvoicePDF = (order) => {
	// Create a new window for PDF generation
	const printWindow = window.open('', '_blank');

	// Calculate amounts
	const baseAmount = order?.totalAmount || 0;
	const tax = order?.tax || 0;
	const transportCharges = order?.transportCharges || 0;
	const walletAmount = order?.walletAmount || 0;
	const totalLabour = order?.totalLabour || 0;

	// Get display status
	const getStatusClass = (status) => {
		const normalized = status?.toLowerCase() || '';
		if (normalized.includes('cancel')) return 'cancelled';
		if (normalized.includes('progress') || normalized.includes('confirm')) return 'confirmed';
		return 'completed';
	};

	const getStatusText = (status) => {
		const normalized = status?.toLowerCase() || '';
		if (normalized.includes('cancel')) return 'Booking Cancelled';
		if (normalized.includes('progress')) return 'In Progress';
		if (normalized.includes('confirm')) return 'Booking Confirmed';
		return 'Booking Completed';
	};

	// Generate service items HTML from orders array
	const serviceItemsHtml = order?.orders?.length > 0
		? order.orders.map((o, idx) => `
			<div class="service-card">
				<div class="service-header">
					<span class="service-title">${o.truckSize || ''} ${o.category || 'Service'}</span>
					<span class="service-badge">${o.service || 'Loading/Unloading'}</span>
				</div>
				<table class="details-table">
					<tr>
						<td class="detail-cell blue">
							<div class="detail-label">Truck ID</div>
							<div class="detail-value">${o.truckId || 'N/A'}</div>
						</td>
						${o.unitSize ? `<td class="detail-cell green"><div class="detail-label">Unit Size</div><div class="detail-value">${o.unitSize}</div></td>` : ''}
						${o.UintQty ? `<td class="detail-cell amber"><div class="detail-label">Quantity</div><div class="detail-value">${o.UintQty}</div></td>` : ''}
						${o.maixumWight ? `<td class="detail-cell red"><div class="detail-label">Weight</div><div class="detail-value">${o.maixumWight} Tons</div></td>` : ''}
					</tr>
				</table>
				<div class="service-details-grid">
					<div class="service-detail"><span class="label">Rate:</span> <span class="value">₹${o.rate || 0}</span></div>
					${o.Floor ? `<div class="service-detail"><span class="label">Floor:</span> <span class="value">${o.Floor}</span></div>` : ''}
					<div class="service-detail"><span class="label">Ground Floor:</span> <span class="value">${o.groundFloor ? 'Yes' : 'No'}</span></div>
					<div class="service-detail"><span class="label">Lift Available:</span> <span class="value">${o.lift ? 'Yes' : 'No'}</span></div>
					${o.isOpenFurniture !== undefined ? `<div class="service-detail"><span class="label">Open Furniture:</span> <span class="value">${o.isOpenFurniture ? 'Yes' : 'No'}</span></div>` : ''}
				</div>
			</div>
		`).join('')
		: '<p class="no-data">No service details available.</p>';

	const invoiceHTML = `
		<!DOCTYPE html>
		<html lang="en">
		<head>
			<meta charset="UTF-8" />
			<meta name="viewport" content="width=device-width, initial-scale=1.0" />
			<title>Invoice - ${order?.id || 'N/A'}</title>
			<style>
				@page { size: A4; margin: 10mm; }
				* { margin: 0; padding: 0; box-sizing: border-box; }
				body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 12px; color: #333; background: #fff; }
				
				.invoice-container { max-width: 750px; margin: 0 auto; padding: 15px; }
				
				/* Header */
				.header {
					background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
					color: white;
					padding: 18px 22px;
					display: flex;
					justify-content: space-between;
					align-items: center;
					border-radius: 8px;
					margin-bottom: 12px;
				}
				.brand h1 { font-size: 26px; font-weight: 800; margin-bottom: 2px; letter-spacing: -0.5px; }
				.brand p { font-size: 11px; opacity: 0.9; }
				.invoice-info { text-align: right; }
				.invoice-info .invoice-number { font-size: 16px; font-weight: 700; margin-bottom: 2px; }
				.invoice-info .date { font-size: 11px; opacity: 0.9; }
				
				/* Status Banner */
				.status-banner {
					padding: 10px 18px;
					font-weight: 600;
					font-size: 13px;
					text-align: center;
					border-radius: 6px;
					margin-bottom: 12px;
				}
				.status-banner.confirmed { background: #d1fae5; color: #065f46; border: 1px solid #6ee7b7; }
				.status-banner.cancelled { background: #fee2e2; color: #991b1b; border: 1px solid #fca5a5; }
				.status-banner.completed { background: #dbeafe; color: #1e40af; border: 1px solid #93c5fd; }
				
				/* Labour Highlight */
				.labour-highlight {
					background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
					border: 1px solid #3b82f6;
					border-radius: 8px;
					padding: 14px 18px;
					margin-bottom: 14px;
					display: flex;
					align-items: center;
					gap: 12px;
				}
				.labour-highlight .icon { font-size: 32px; }
				.labour-highlight h3 { font-size: 22px; color: #1e40af; font-weight: 800; margin-bottom: 2px; }
				.labour-highlight p { font-size: 11px; color: #3b82f6; font-weight: 500; }
				
				/* Section Title */
				.section-title {
					font-size: 13px;
					font-weight: 700;
					color: #1f2937;
					margin: 14px 0 8px 0;
					padding-bottom: 6px;
					border-bottom: 2px solid #e5e7eb;
					display: flex;
					align-items: center;
					gap: 6px;
				}
				.section-title .icon { font-size: 14px; }
				
				/* Customer Table */
				.customer-table {
					width: 100%;
					border-collapse: collapse;
					margin-bottom: 14px;
					background: #f9fafb;
					border-radius: 6px;
					overflow: hidden;
				}
				.customer-table td {
					width: 50%;
					padding: 10px 14px;
					border-left: 3px solid #2563eb;
					vertical-align: top;
				}
				.customer-table label { font-size: 9px; color: #6b7280; text-transform: uppercase; font-weight: 600; letter-spacing: 0.3px; display: block; }
				.customer-table p { font-size: 12px; color: #1f2937; font-weight: 600; margin-top: 3px; }
				
				/* Service Cards */
				.service-card {
					background: #fff;
					border: 1px solid #e5e7eb;
					border-radius: 8px;
					padding: 12px 14px;
					margin-bottom: 10px;
					box-shadow: 0 1px 2px rgba(0,0,0,0.04);
				}
				.service-header {
					display: flex;
					justify-content: space-between;
					align-items: center;
					margin-bottom: 10px;
					padding-bottom: 8px;
					border-bottom: 1px dashed #e5e7eb;
				}
				.service-title { font-size: 14px; font-weight: 700; color: #1f2937; }
				.service-badge {
					background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
					color: #2563eb;
					padding: 4px 10px;
					border-radius: 12px;
					font-size: 10px;
					font-weight: 600;
					border: 1px solid #93c5fd;
				}
				.details-table { width: 100%; border-collapse: separate; border-spacing: 6px 0; margin-bottom: 8px; }
				.detail-cell {
					padding: 10px;
					text-align: center;
					border-radius: 6px;
				}
				.detail-cell.blue { background: #eff6ff; border: 1px solid #bfdbfe; }
				.detail-cell.green { background: #ecfdf5; border: 1px solid #a7f3d0; }
				.detail-cell.amber { background: #fffbeb; border: 1px solid #fde68a; }
				.detail-cell.red { background: #fef2f2; border: 1px solid #fecaca; }
				.detail-label { font-size: 9px; color: #6b7280; text-transform: uppercase; font-weight: 600; margin-bottom: 3px; }
				.detail-value { font-size: 16px; font-weight: 700; color: #1f2937; }
				
				.service-details-grid {
					display: grid;
					grid-template-columns: repeat(3, 1fr);
					gap: 6px;
					margin-top: 6px;
				}
				.service-detail {
					background: #f9fafb;
					padding: 6px 10px;
					border-radius: 5px;
					font-size: 10px;
				}
				.service-detail .label { color: #6b7280; }
				.service-detail .value { color: #1f2937; font-weight: 600; }
				
				/* Schedule Section */
				.schedule-grid {
					display: grid;
					grid-template-columns: 1fr 1fr;
					gap: 12px;
					margin-bottom: 14px;
				}
				.schedule-card {
					padding: 12px;
					border-radius: 8px;
				}
				.schedule-card.pickup { background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); border: 1px solid #93c5fd; }
				.schedule-card.delivery { background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); border: 1px solid #6ee7b7; }
				.schedule-card h4 { font-size: 11px; font-weight: 700; margin-bottom: 6px; color: #1f2937; }
				.schedule-card p { font-size: 11px; color: #4b5563; margin: 3px 0; }
				.schedule-card p strong { color: #1f2937; }
				
				/* Fare Table */
				.fare-table { 
					width: 100%; 
					background: #f9fafb; 
					border-radius: 8px; 
					margin-bottom: 14px; 
					overflow: hidden;
					border: 1px solid #e5e7eb;
				}
				.fare-row {
					display: flex;
					justify-content: space-between;
					padding: 10px 16px;
					border-bottom: 1px solid #e5e7eb;
					font-size: 12px;
				}
				.fare-row:last-child { border-bottom: none; }
				.fare-row.total {
					background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
					color: white;
					font-weight: 700;
					font-size: 14px;
				}
				.fare-label { color: #6b7280; }
				.fare-row.total .fare-label { color: white; }
				.fare-value { font-weight: 600; color: #1f2937; }
				.fare-row.total .fare-value { color: white; }
				
				/* Footer */
				.footer {
					background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
					padding: 14px;
					text-align: center;
					border-radius: 8px;
					font-size: 11px;
					color: #6b7280;
					border: 1px solid #e5e7eb;
				}
				.footer .thank-you { 
					font-size: 14px; 
					font-weight: 700; 
					color: #2563eb; 
					margin-bottom: 6px;
				}
				.footer .contact {
					font-size: 11px;
					color: #4b5563;
				}
				
				.no-data { color: #9ca3af; text-align: center; padding: 18px; font-style: italic; background: #f9fafb; border-radius: 6px; font-size: 11px; }
				
				@media print {
					body { margin: 0; padding: 0; }
					.invoice-container { max-width: 100%; padding: 0; }
					.header, .status-banner, .labour-highlight, .service-card, .fare-table, .footer {
						-webkit-print-color-adjust: exact !important;
						print-color-adjust: exact !important;
					}
				}
			</style>
		</head>
		<body>
			<div class="invoice-container">
				<!-- Header -->
				<div class="header">
					<div class="brand">
						<h1>Genie</h1>
						<p>Labour Services Provider</p>
					</div>
					<div class="invoice-info">
						<div class="invoice-number">#${order?.id?.slice(-8) || 'N/A'}</div>
						<div class="date">${order?.pickupDate || new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
					</div>
				</div>
				
				<!-- Status Banner -->
				<div class="status-banner ${getStatusClass(order?.status)}">
					${getStatusText(order?.status)}
				</div>
				
				<!-- Labour Highlight -->
				<div class="labour-highlight">
					<span class="icon">👷</span>
					<div>
						<h3>${totalLabour} Workers</h3>
						<p>Total Labour Assigned</p>
					</div>
				</div>
				
				<!-- Customer Details -->
				<div class="section-title"><span class="icon">👤</span> Customer Details</div>
				<table class="customer-table">
					<tr>
						<td><label>Customer Name</label><p>${order?.bookingName || 'N/A'}</p></td>
						<td><label>Phone Number</label><p>${order?.phoneNumber || 'N/A'}</p></td>
					</tr>
					<tr>
						<td><label>Delivery Address</label><p>${order?.deliveryAddress || 'N/A'}</p></td>
						<td><label>House No / Floor</label><p>${order?.houseNo || ''} ${order?.floorNumber ? '/ Floor ' + order.floorNumber : ''}</p></td>
					</tr>
				</table>
				
				<!-- Schedule -->
				<div class="section-title"><span class="icon">📅</span> Schedule</div>
				<div class="schedule-grid">
					<div class="schedule-card pickup">
						<h4>📦 Pickup</h4>
						<p><strong>Date:</strong> ${order?.pickupDate || 'N/A'}</p>
						<p><strong>Time:</strong> ${order?.pickupTime || 'N/A'}</p>
					</div>
					<div class="schedule-card delivery">
						<h4>🚚 Delivery</h4>
						<p><strong>Date:</strong> ${order?.deliveryDate || 'N/A'}</p>
						<p><strong>Time:</strong> ${order?.deliveryTime || 'N/A'}</p>
					</div>
				</div>
				
				<!-- Labour Info -->
				${order?.labourName ? `
				<div class="section-title"><span class="icon">🛠️</span> Assigned Labour</div>
				<table class="customer-table">
					<tr>
						<td><label>Labour Name</label><p>${order?.labourName || 'N/A'}</p></td>
						<td><label>Labour Phone</label><p>${order?.labourPhoneNumber || 'N/A'}</p></td>
					</tr>
				</table>
				` : ''}
				
				<!-- Service Summary -->
				<div class="section-title"><span class="icon">🛒</span> Service Summary</div>
				${serviceItemsHtml}
				
				<!-- Fare Summary -->
				<div class="section-title"><span class="icon">💰</span> Fare Summary</div>
				<div class="fare-table">
					<div class="fare-row"><span class="fare-label">Base Amount</span><span class="fare-value">₹${baseAmount.toLocaleString('en-IN')}</span></div>
					${tax ? `<div class="fare-row"><span class="fare-label">Tax</span><span class="fare-value">₹${tax.toLocaleString('en-IN')}</span></div>` : ''}
					${transportCharges ? `<div class="fare-row"><span class="fare-label">Transport Charges</span><span class="fare-value">₹${transportCharges.toLocaleString('en-IN')}</span></div>` : ''}
					${walletAmount ? `<div class="fare-row"><span class="fare-label">Wallet Discount</span><span class="fare-value">-₹${walletAmount.toLocaleString('en-IN')}</span></div>` : ''}
					<div class="fare-row total"><span class="fare-label">Total Amount</span><span class="fare-value">₹${(baseAmount + tax + transportCharges - walletAmount).toLocaleString('en-IN')}</span></div>
				</div>
				
				<!-- Footer -->
				<div class="footer">
					<p class="thank-you">Thank you for choosing Genie!</p>
					<p class="contact">apnalabour@gmail.com | +91 9512885353</p>
					<p style="margin-top: 10px; font-size: 12px; color: #9ca3af;">This is a computer-generated invoice.</p>
				</div>
			</div>
		</body>
		</html>
	`;

	// Write the HTML content to the new window
	printWindow.document.write(invoiceHTML);
	printWindow.document.close();

	// Wait for the content to load, then trigger print
	printWindow.onload = () => {
		printWindow.focus();
		printWindow.print();
	};
};
