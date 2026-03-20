// Sample labour data based on user schema
export const sampleLabours = [
	{
		id: 'LAB001',
		username: 'rajesh_kumar',
		email: 'rajesh.kumar@email.com',
		phone: '9876543210',
		firstName: 'Rajesh',
		lastName: 'Kumar',
		userType: 1, // Labour
		businessName: 'Rajesh Construction Services',
		businessType: 'individual',
		latitude: 28.6139,
		longitude: 77.2090,
		rating: 4.8,
		totalTask: 45,
		totalEarning: 125000,
		status: 'active',
		balance: 15000,
		lastActiveAt: new Date('2025-01-15T08:30:00Z'),
		userImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
		addressList: {
			homeAddress: {
				street: '123 Main Street',
				city: 'New Delhi',
				state: 'Delhi',
				pincode: '110001',
				landmark: 'Near Metro Station'
			}
		},
		skills: ['Masonry', 'Plumbing', 'Painting'],
		experience: '5 years',
		availability: 'Available',
		location: 'New Delhi, Delhi'
	},
	{
		id: 'LAB002',
		username: 'priya_sharma',
		email: 'priya.sharma@email.com',
		phone: '9876543211',
		firstName: 'Priya',
		lastName: 'Sharma',
		userType: 1,
		businessName: 'Priya Electrical Works',
		businessType: 'individual',
		latitude: 19.0760,
		longitude: 72.8777,
		rating: 4.9,
		totalTask: 38,
		totalEarning: 98000,
		status: 'active',
		balance: 8500,
		lastActiveAt: new Date('2025-01-15T09:15:00Z'),
		userImage: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150',
		addressList: {
			homeAddress: {
				street: '456 Park Avenue',
				city: 'Mumbai',
				state: 'Maharashtra',
				pincode: '400001',
				landmark: 'Near Shopping Mall'
			}
		},
		skills: ['Electrical', 'Wiring', 'Maintenance'],
		experience: '7 years',
		availability: 'Available',
		location: 'Mumbai, Maharashtra'
	},
	{
		id: 'LAB003',
		username: 'amit_singh',
		email: 'amit.singh@email.com',
		phone: '9876543212',
		firstName: 'Amit',
		lastName: 'Singh',
		userType: 1,
		businessName: 'Amit Carpentry Solutions',
		businessType: 'individual',
		latitude: 12.9716,
		longitude: 77.5946,
		rating: 4.7,
		totalTask: 52,
		totalEarning: 145000,
		status: 'active',
		balance: 22000,
		lastActiveAt: new Date('2025-01-15T10:45:00Z'),
		userImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
		addressList: {
			homeAddress: {
				street: '789 Garden Road',
				city: 'Bangalore',
				state: 'Karnataka',
				pincode: '560001',
				landmark: 'Near IT Park'
			}
		},
		skills: ['Carpentry', 'Furniture', 'Repair'],
		experience: '6 years',
		availability: 'Busy',
		location: 'Bangalore, Karnataka'
	},
	{
		id: 'LAB004',
		username: 'sita_patel',
		email: 'sita.patel@email.com',
		phone: '9876543213',
		firstName: 'Sita',
		lastName: 'Patel',
		userType: 1,
		businessName: 'Sita Cleaning Services',
		businessType: 'individual',
		latitude: 23.0225,
		longitude: 72.5714,
		rating: 4.6,
		totalTask: 28,
		totalEarning: 65000,
		status: 'active',
		balance: 5000,
		lastActiveAt: new Date('2025-01-14T16:20:00Z'),
		userImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
		addressList: {
			homeAddress: {
				street: '321 Lake View',
				city: 'Ahmedabad',
				state: 'Gujarat',
				pincode: '380001',
				landmark: 'Near Lake'
			}
		},
		skills: ['Cleaning', 'Housekeeping', 'Maintenance'],
		experience: '4 years',
		availability: 'Available',
		location: 'Ahmedabad, Gujarat'
	},
	{
		id: 'LAB005',
		username: 'vikram_joshi',
		email: 'vikram.joshi@email.com',
		phone: '9876543214',
		firstName: 'Vikram',
		lastName: 'Joshi',
		userType: 1,
		businessName: 'Vikram AC Services',
		businessType: 'individual',
		latitude: 26.9124,
		longitude: 75.7873,
		rating: 4.9,
		totalTask: 41,
		totalEarning: 112000,
		status: 'active',
		balance: 18000,
		lastActiveAt: new Date('2025-01-15T11:30:00Z'),
		userImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
		addressList: {
			homeAddress: {
				street: '654 Tech Park',
				city: 'Jaipur',
				state: 'Rajasthan',
				pincode: '302001',
				landmark: 'Near Tech Hub'
			}
		},
		skills: ['AC Repair', 'Refrigeration', 'HVAC'],
		experience: '8 years',
		availability: 'Available',
		location: 'Jaipur, Rajasthan'
	},
	{
		id: 'LAB006',
		username: 'meera_gupta',
		email: 'meera.gupta@email.com',
		phone: '9876543215',
		firstName: 'Meera',
		lastName: 'Gupta',
		userType: 1,
		businessName: 'Meera Beauty Services',
		businessType: 'individual',
		latitude: 22.5726,
		longitude: 88.3639,
		rating: 4.8,
		totalTask: 33,
		totalEarning: 78000,
		status: 'inactive',
		balance: 12000,
		lastActiveAt: new Date('2025-01-10T14:15:00Z'),
		userImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
		addressList: {
			homeAddress: {
				street: '987 Fashion Street',
				city: 'Kolkata',
				state: 'West Bengal',
				pincode: '700001',
				landmark: 'Near Market'
			}
		},
		skills: ['Beauty', 'Hair Styling', 'Makeup'],
		experience: '3 years',
		availability: 'Not Available',
		location: 'Kolkata, West Bengal'
	}
];

export const getLabourById = (id) => {
	return sampleLabours.find(labour => labour.id === id);
};

export const getLaboursByStatus = (status) => {
	return sampleLabours.filter(labour => labour.status === status);
};

export const getLaboursByLocation = (location) => {
	return sampleLabours.filter(labour => 
		labour.location.toLowerCase().includes(location.toLowerCase())
	);
};
