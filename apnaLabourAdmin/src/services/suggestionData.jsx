export const sampleSuggestions = [
    {
      id: '1',
      userId: 'user_001',
      userName: 'John Smith',
      userEmail: 'john.smith@email.com',
      suggestionText: 'It would be great to have a mobile app version of this platform. The current web interface is good but having mobile access would make it much more convenient for field workers.',
      category: 'feature',
      status: 'pending',
      priority: 'medium',
      response: '',
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-01-15T10:30:00Z'
    },
    {
      id: '2',
      userId: 'user_002',
      userName: 'Maria Garcia',
      userEmail: 'maria.garcia@email.com',
      suggestionText: 'The search functionality is not working properly. When I search for labours by location, it sometimes returns incorrect results.',
      category: 'bug',
      status: 'reviewed',
      priority: 'high',
      response: 'Thank you for reporting this issue. Our team is currently investigating the search functionality and will have a fix deployed soon.',
      createdAt: '2024-01-14T14:45:00Z',
      updatedAt: '2024-01-16T09:20:00Z'
    },
    {
      id: '3',
      userId: 'user_003',
      userName: 'David Johnson',
      userEmail: 'david.johnson@email.com',
      suggestionText: 'Please add a dark mode option. It would be easier on the eyes during night shifts.',
      category: 'improvement',
      status: 'resolved',
      priority: 'medium',
      response: 'Great suggestion! We have implemented dark mode support. You can now toggle between light and dark themes in your profile settings.',
      createdAt: '2024-01-10T16:20:00Z',
      updatedAt: '2024-01-18T11:15:00Z'
    },
    {
      id: '4',
      userId: 'user_004',
      userName: 'Sarah Wilson',
      userEmail: 'sarah.wilson@email.com',
      suggestionText: 'The notification system could be improved. Sometimes I miss important updates about task assignments.',
      category: 'improvement',
      status: 'pending',
      priority: 'medium',
      response: '',
      createdAt: '2024-01-12T08:15:00Z',
      updatedAt: '2024-01-12T08:15:00Z'
    },
    {
      id: '5',
      userId: 'user_005',
      userName: 'Mike Brown',
      userEmail: 'mike.brown@email.com',
      suggestionText: 'Add support for multiple languages, especially Hindi and regional languages for better accessibility.',
      category: 'feature',
      status: 'reviewed',
      priority: 'medium',
      response: 'This is a valuable suggestion. We are planning to add multi-language support in our next major release. Hindi will be the first additional language we implement.',
      createdAt: '2024-01-08T12:30:00Z',
      updatedAt: '2024-01-17T14:45:00Z'
    },
    {
      id: '6',
      userId: 'user_006',
      userName: 'Lisa Anderson',
      userEmail: 'lisa.anderson@email.com',
      suggestionText: 'The dashboard takes too long to load sometimes.',
      category: 'bug',
      status: 'rejected',
      priority: 'high',
      response: 'We have tested the dashboard performance extensively and have not been able to reproduce this issue. Please ensure you have a stable internet connection and try clearing your browser cache.',
      createdAt: '2024-01-05T09:45:00Z',
      updatedAt: '2024-01-19T16:30:00Z'
    },
    {
      id: '7',
      userId: 'user_007',
      userName: 'Robert Taylor',
      userEmail: 'robert.taylor@email.com',
      suggestionText: 'Can we have a  to export labour performance reports to PDF?',
      category: 'feature',
      status: 'pending',
      priority: 'medium',
      response: '',
      createdAt: '2024-01-20T13:20:00Z',
      updatedAt: '2024-01-20T13:20:00Z'
    },
    {
      id: '8',
      userId: 'user_008',
      userName: 'Emma Davis',
      userEmail: 'emma.davis@email.com',
      suggestionText: 'Love the platform! Just wanted to say thanks for making labour management so much easier.',
      category: 'other',
      status: 'reviewed',
      priority: 'low',
      response: 'Thank you so much for your kind words! We really appreciate your feedback and are glad the platform is helping you manage your work more efficiently.',
      createdAt: '2024-01-18T17:10:00Z',
      updatedAt: '2024-01-19T10:25:00Z'
    }
  ];
  
  export const getSuggestionById = (id) => {
    return sampleSuggestions.find(suggestion => suggestion.id === id);
  };
  
  export const getSuggestionsByStatus = (status) => {
    return sampleSuggestions.filter(suggestion => suggestion.status === status);
  };
  
  export const getSuggestionsByCategory = (category) => {
    return sampleSuggestions.filter(suggestion => suggestion.category === category);
  };
  
  export const getSuggestionsByPriority = (priority) => {
    return sampleSuggestions.filter(suggestion => suggestion.priority === priority);
  };