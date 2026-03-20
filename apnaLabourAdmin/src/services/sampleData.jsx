// Sample data for testing when backend is not available
export const sampleOrders = [
	{
		id: 'ORD001',
		type: 'Masonry',
		customer: 'John Doe',
		status: 'In Progress',
		progress: 65,
		baseAmount: 15000,
		taxPercent: 5,
		gstPercent: 2.5,
		date: new Date('2025-01-15T10:30:00Z'),
		items: [
			{
				name: 'Brick Work - Living Room',
				qty: 100,
				rate: 120,
				media: [
					{
						type: 'image',
						url: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400',
						poster: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400'
					}
				]
			},
			{
				name: 'Cement Work - Kitchen',
				qty: 50,
				rate: 80,
				media: [
					{
						type: 'video',
						url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
						poster: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400'
					}
				]
			}
		]
	},
	{
		id: 'ORD002',
		type: 'Electrician',
		customer: 'Jane Smith',
		status: 'Completed',
		progress: 100,
		baseAmount: 8500,
		taxPercent: 5,
		gstPercent: 2.5,
		date: new Date('2025-01-14T14:20:00Z'),
		items: [
			{
				name: 'Wiring Installation',
				qty: 1,
				rate: 5000,
				media: []
			},
			{
				name: 'Switch Board Setup',
				qty: 5,
				rate: 700,
				media: [
					{
						type: 'image',
						url: 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=400',
						poster: 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=400'
					}
				]
			}
		]
	},
	{
		id: 'ORD003',
		type: 'Plumbing',
		customer: 'Mike Johnson',
		status: 'Pending',
		progress: 0,
		baseAmount: 12000,
		taxPercent: 5,
		gstPercent: 2.5,
		date: new Date('2025-01-16T09:15:00Z'),
		items: [
			{
				name: 'Pipe Installation',
				qty: 20,
				rate: 500,
				media: []
			},
			{
				name: 'Bathroom Fixtures',
				qty: 2,
				rate: 1000,
				media: [
					{
						type: 'image',
						url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400',
						poster: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400'
					}
				]
			}
		]
	},
	{
		id: 'ORD004',
		type: 'Painting',
		customer: 'Sarah Wilson',
		status: 'In Progress',
		progress: 30,
		baseAmount: 18000,
		taxPercent: 5,
		gstPercent: 2.5,
		date: new Date('2025-01-13T16:45:00Z'),
		items: [
			{
				name: 'Interior Painting',
				qty: 1,
				rate: 15000,
				media: [
					{
						type: 'image',
						url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400',
						poster: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400'
					}
				]
			},
			{
				name: 'Exterior Touch-up',
				qty: 1,
				rate: 3000,
				media: []
			}
		]
	},
	{
		id: 'ORD005',
		type: 'Carpentry',
		customer: 'David Brown',
		status: 'Cancelled',
		progress: 0,
		baseAmount: 25000,
		taxPercent: 5,
		gstPercent: 2.5,
		date: new Date('2025-01-12T11:30:00Z'),
		items: [
			{
				name: 'Custom Wardrobe',
				qty: 1,
				rate: 20000,
				media: []
			},
			{
				name: 'Kitchen Cabinets',
				qty: 1,
				rate: 5000,
				media: [
					{
						type: 'image',
						url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400',
						poster: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400'
					}
				]
			}
		]
	}
];

export const sampleOrderDetails = (orderId) => {
	return sampleOrders.find(order => order.id === orderId);
};
