import { API_BASE_URL } from '../config';
import { apiRequest } from './api';
import { usersAPI } from './usersAPI';

import { sampleOrders, sampleOrderDetails } from './sampleData';
import { listBookings, getBooking } from '../graphql/queries';
import { createOrderDetails } from '../graphql/mutations';

import { generateClient } from 'aws-amplify/api';

const client = generateClient();

export async function fetchOrders() {

	try {

		let allItems = [];

		let nextToken = null;

		do {

			const res = await client.graphql({
				query: listBookings,
				variables: {
					limit: 100, // ✅ fetch 100 items per request
					nextToken,
				},
			});

			const items = res?.data?.listBookings?.items || [];

			allItems = allItems.concat(items);

			nextToken = res?.data?.listBookings?.nextToken;

		} while (nextToken);

		// ✅ Map basic order fields
		const list = allItems.map(mapOrderFromApi);

		// ✅ Fetch user details for all orders to get customer names
		const userIds = [...new Set(list.map(o => o.userId).filter(id => id))];

		const userMap = {};
		if (userIds.length > 0) {
			try {
				const users = await usersAPI.fetchUsersByIds(userIds);
				users.forEach(u => {
					userMap[u.id] = {
						firstName: u.firstName || '',
						lastName: u.lastName || '',
						fullName: `${u.firstName || ''} ${u.lastName || ''}`.trim() || 'Unknown'
					};
				});
			} catch (err) {
				console.error("Error fetching user details for orders:", err);
			}
		}

		// ✅ Augment orders with customer name
		const augmentedList = list.map(order => {
			const user = userMap[order.userId];
			return {
				...order,
				customer: user ? user.fullName : (order.bookingName || 'Unknown'), // Fallback to bookingName if available
				customerDetails: user
			};
		});

		console.log("Booking list with customers", augmentedList);

		return augmentedList;

	} catch (error) {

		console.error('Error fetching orders:', error);

		console.log('Using sample data as fallback');

		return sampleOrders;

	}

}



export async function createOrder(formdata) {
	try {
		console.log("Received formdata:", formdata);

		// ✅ Safely map and typecast fields
		const safeData = {
			orderId: String(formdata.orderId || ''),
			orderCategory: String(formdata.orderCategory || ''),
			name: String(formdata.name || ''),
			address: String(formdata.address || ''),
			phoneNumber: String(formdata.phoneNumber || ''),
			totalLabour: Number(formdata.totalLabour || 0),
			labourName: String(formdata.labourName || ''),
			city: String(formdata.city || ''),
			area: String(formdata.area || ''),
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		};

		// ✅ Call AWS Amplify GraphQL API
		const response = await client.graphql({
			query: createOrderDetails,
			variables: { input: safeData },
		});

		console.log("✅ Order successfully created:", response.data.createOrderDetails);
		return response.data.createOrderDetails;

	} catch (err) {
		console.error("❌ Error creating order:", err);
		throw err;
	}
}

export async function fetchOrderById(id) {

	try {

		const res = await client.graphql({

			query: getBooking,
			variables: { id }

		});

		console.log(" fref rkf kr", res);

		return mapOrderFromApi(res?.data?.getBooking);


	} catch (error) {

		console.error('Error fetching order by ID:', error);

		console.log('Using sample data as fallback');

	}
}
function mapOrderFromApi(o) {
	if (!o) return null;

	return {
		id: o.id,
		userId: o.userId || "",
		bookingCode: o.BookingCode || "",
		bookingName: o.bookingName || "",
		goodType: o.GoodType || "",
		serviceName: o.ServiceName || "",
		truckType: o.truckType || [],
		weightPerUnit: o.weightPerUnit || "",
		noOfUnits: o.NoOfUnits || 0,
		goodsWeight: o.GoodsWeight || 0,
		image: o.image || "",
		video: o.video || "",
		tax: o.tax || 0,
		walletAmount: o.GenieMoney || 0,
		transportCharges: o.transportCharges || 0,
		nightCharges: o.nightCharges || 0,
		commission: o.commission || 0,
		paymentType: o.paymentType || "N/A",
		totalAmount: o.totalAmount || 0,
		totalLabour: o.totalLabour || 0,
		phoneNumber: o.phoneNumber || "",
		geoHas: o.geoHas || "",
		orderUpdate: o.orderUpdate ? JSON.parse(o.orderUpdate) : {},
		status: o.status || "Unknown",
		labourName: o.labourName || "",
		labourPhoneNumber: o.labourPhoneNumber || "",
		labourId: o.labourId || "",
		deliveryAddress: o.deliveryAddress || "",
		isListAvailable: o.isListAvailable ?? false,
		isGroundFloor: o.isGroundFloor ?? false,
		floorNumber: o.floorNumber ? Number(o.floorNumber) : null,
		orders: o.orders ? JSON.parse(o.orders) : [],
		cancelReason: o.cancelReason || "",
		pickupDate: o.PickupDate || "",
		pickupTime: o.PickupTime || "",
		deliveryDate: o.DeliveryDate || "",
		deliveryTime: o.DeliveryTime || "",
		bookingType: o.bookingType || "",
		startDate: o.startDate || "",
		endDate: o.endDate || "",
		daysCount: o.daysCount || 0,
		scheduledTime: o.scheduledTime || "",
		latitude: o.latitude || null,
		longitude: o.longitude || null,
		createdAt: o.createdAt || "",
		updatedAt: o.updatedAt || "",
	};
}
