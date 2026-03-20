/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from "../API";
type GeneratedQuery<InputType, OutputType> = string & {
  __generatedQueryInput: InputType;
  __generatedQueryOutput: OutputType;
};

export const getUsers = /* GraphQL */ `query GetUsers($id: ID!) {
  getUsers(id: $id) {
    id
    username
    email
    phoneNumber
    password
    latitude
    longitude
    userType
    selectedRole
    isActive
    isDeleted
    languages
    deviceId
    deviceName
    firstName
    lastName
    isEmailVerified
    fcmToken
    addressList
    businessType
    businessName
    businessGSTNO
    balance
    earningBalance
    isWhatsappSync
    isHomeAddressSelect
    isFactoryAddress
    isOtherAddress
    isAccountActivated
    isUserOnline
    userImage
    aadharCardImage
    car_no
    driving_licence_number
    Rcnumber
    panCardImage
    rating
    geohash
    geohashPrefix
    referralCode
    referredBy
    totalTask
    totalEarnings
    lastAccessed
    createdAt
    updatedAt
    appVersion
    appVersionCode
    is_loading_unloading_enabled
    __typename
  }
}
` as GeneratedQuery<APITypes.GetUsersQueryVariables, APITypes.GetUsersQuery>;
export const listUsers = /* GraphQL */ `query ListUsers(
  $id: ID
  $filter: ModelUsersFilterInput
  $limit: Int
  $nextToken: String
  $sortDirection: ModelSortDirection
) {
  listUsers(
    id: $id
    filter: $filter
    limit: $limit
    nextToken: $nextToken
    sortDirection: $sortDirection
  ) {
    items {
      id
      username
      email
      phoneNumber
      password
      latitude
      longitude
      userType
      selectedRole
      isActive
      isDeleted
      languages
      deviceId
      deviceName
      firstName
      lastName
      isEmailVerified
      fcmToken
      addressList
      businessType
      businessName
      businessGSTNO
      balance
      earningBalance
      isWhatsappSync
      isHomeAddressSelect
      isFactoryAddress
      isOtherAddress
      isAccountActivated
      isUserOnline
      userImage
      aadharCardImage
      car_no
      driving_licence_number
      Rcnumber
      panCardImage
      rating
      geohash
      geohashPrefix
      referralCode
      referredBy
      totalTask
      totalEarnings
      lastAccessed
      createdAt
      updatedAt
      appVersion
      appVersionCode
      is_loading_unloading_enabled
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<APITypes.ListUsersQueryVariables, APITypes.ListUsersQuery>;
export const getRate = /* GraphQL */ `query GetRate($cid: String!) {
  getRate(cid: $cid) {
    cid
    latitude
    longitude
    serviceType
    isGroundFloor
    liftAvailable
    floorNumber
    truckSize
    weightPerUnit
    tons
    time
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedQuery<APITypes.GetRateQueryVariables, APITypes.GetRateQuery>;
export const listRates = /* GraphQL */ `query ListRates(
  $cid: String
  $filter: ModelRateFilterInput
  $limit: Int
  $nextToken: String
  $sortDirection: ModelSortDirection
) {
  listRates(
    cid: $cid
    filter: $filter
    limit: $limit
    nextToken: $nextToken
    sortDirection: $sortDirection
  ) {
    items {
      cid
      latitude
      longitude
      serviceType
      isGroundFloor
      liftAvailable
      floorNumber
      truckSize
      weightPerUnit
      tons
      time
      createdAt
      updatedAt
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<APITypes.ListRatesQueryVariables, APITypes.ListRatesQuery>;
export const getOrderDetails = /* GraphQL */ `query GetOrderDetails($id: ID!) {
  getOrderDetails(id: $id) {
    id
    orderId
    orderCategory
    name
    address
    phoneNumber
    totalLabour
    labourName
    city
    area
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetOrderDetailsQueryVariables,
  APITypes.GetOrderDetailsQuery
>;
export const listOrderDetails = /* GraphQL */ `query ListOrderDetails(
  $id: ID
  $filter: ModelOrderDetailsFilterInput
  $limit: Int
  $nextToken: String
  $sortDirection: ModelSortDirection
) {
  listOrderDetails(
    id: $id
    filter: $filter
    limit: $limit
    nextToken: $nextToken
    sortDirection: $sortDirection
  ) {
    items {
      id
      orderId
      orderCategory
      name
      address
      phoneNumber
      totalLabour
      labourName
      city
      area
      createdAt
      updatedAt
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListOrderDetailsQueryVariables,
  APITypes.ListOrderDetailsQuery
>;
export const getNotification = /* GraphQL */ `query GetNotification($id: ID!) {
  getNotification(id: $id) {
    id
    title
    body
    imageUrl
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetNotificationQueryVariables,
  APITypes.GetNotificationQuery
>;
export const listNotifications = /* GraphQL */ `query ListNotifications(
  $filter: ModelNotificationFilterInput
  $limit: Int
  $nextToken: String
) {
  listNotifications(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      id
      title
      body
      imageUrl
      createdAt
      updatedAt
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListNotificationsQueryVariables,
  APITypes.ListNotificationsQuery
>;
export const getCategory = /* GraphQL */ `query GetCategory($id: ID!) {
  getCategory(id: $id) {
    id
    name
    category
    description
    image
    imageKey
    isFloorEnable
    isOpenCategory
    isUintSelectEnableCategory
    isTruckSelectEnableCategory
    isTonEnable
    additionalRate {
      floorNumber
      rate
      __typename
    }
    truckSizeWiseRate {
      imageUrl
      truckSize
      rate
      LabourCount
      halfTruckLabourCount
      maxLabourAddAllowance
      ExtraLabourPrice
      __typename
    }
    truckSizeOtherWiseRate {
      imageUrl
      truckSize
      rate
      LabourCount
      halfTruckLabourCount
      maxLabourAddAllowance
      ExtraLabourPrice
      __typename
    }
    unitWiseRate {
      imageUrl
      unitNumber
      rate
      maxLabourAddAllowance
      isTonEnable
      uintPrice
      maxUintPerLabour
      tonPrice
      tonPerLabour
      ExtraLabourPrice
      LabourCount
      __typename
    }
    otherWiseRate {
      imageUrl
      unitNumber
      truckSize
      tonWeight
      maxLabourAddAllowance
      isTonEnable
      uintPrice
      maxUintPerLabour
      tonPrice
      tonPerLabour
      ExtraLabourPrice
      LabourCount
      rate
      rates
      __typename
    }
    tonWiseRate {
      TonSize
      rate
      MinLabourCount
      __typename
    }
    commission
    maxCommission
    rate
    rating
    reviews {
      userId
      firstName
      lastName
      comment
      rating
      date
      __typename
    }
    popular
    tonPerLabour
    availableWorkers {
      workerId
      firstName
      lastName
      rating
      totalTask
      totalEarning
      __typename
    }
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetCategoryQueryVariables,
  APITypes.GetCategoryQuery
>;
export const listCategories = /* GraphQL */ `query ListCategories(
  $id: ID
  $filter: ModelCategoryFilterInput
  $limit: Int
  $nextToken: String
  $sortDirection: ModelSortDirection
) {
  listCategories(
    id: $id
    filter: $filter
    limit: $limit
    nextToken: $nextToken
    sortDirection: $sortDirection
  ) {
    items {
      id
      name
      category
      description
      image
      imageKey
      isFloorEnable
      isOpenCategory
      isUintSelectEnableCategory
      isTruckSelectEnableCategory
      isTonEnable
      additionalRate {
        floorNumber
        rate
        __typename
      }
      truckSizeWiseRate {
        imageUrl
        truckSize
        rate
        LabourCount
        halfTruckLabourCount
        maxLabourAddAllowance
        ExtraLabourPrice
        __typename
      }
      truckSizeOtherWiseRate {
        imageUrl
        truckSize
        rate
        LabourCount
        halfTruckLabourCount
        maxLabourAddAllowance
        ExtraLabourPrice
        __typename
      }
      unitWiseRate {
        imageUrl
        unitNumber
        rate
        maxLabourAddAllowance
        isTonEnable
        uintPrice
        maxUintPerLabour
        tonPrice
        tonPerLabour
        ExtraLabourPrice
        LabourCount
        __typename
      }
      otherWiseRate {
        imageUrl
        unitNumber
        truckSize
        tonWeight
        maxLabourAddAllowance
        isTonEnable
        uintPrice
        maxUintPerLabour
        tonPrice
        tonPerLabour
        ExtraLabourPrice
        LabourCount
        rate
        rates
        __typename
      }
      tonWiseRate {
        TonSize
        rate
        MinLabourCount
        __typename
      }
      commission
      maxCommission
      rate
      rating
      reviews {
        userId
        firstName
        lastName
        comment
        rating
        date
        __typename
      }
      popular
      tonPerLabour
      availableWorkers {
        workerId
        firstName
        lastName
        rating
        totalTask
        totalEarning
        __typename
      }
      createdAt
      updatedAt
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListCategoriesQueryVariables,
  APITypes.ListCategoriesQuery
>;
export const getBooking = /* GraphQL */ `query GetBooking($id: ID!) {
  getBooking(id: $id) {
    id
    userId
    BookingCode
    GoodType
    ServiceName
    truckType {
      type
      quantity
      __typename
    }
    weightPerUnit
    NoOfUnits
    GoodsWeight
    image
    video
    tax
    commission
    paymentType
    totalAmount
    totalLabour
    phoneNumber
    geoHas
    bookingName
    houseNo
    latitude
    longitude
    transportCharges
    nightCharges
    GenieMoney
    orderUpdate
    status
    labourName
    labourPhoneNumber
    labourId
    deliveryAddress
    pickupAddress
    pickupLatitudeAddress
    pickupLongitudeAddress
    stop1Address
    stop1LatitudeAddress
    stop1LongitudeAddress
    stop2Address
    stop2LatitudeAddress
    stop2LongitudeAddress
    stop3Address
    stop3LatitudeAddress
    stop3LongitudeAddress
    isListAvailable
    isGroundFloor
    floorNumber
    UintQty
    orders
    cancelReason
    PickupDate
    PickupTime
    BookingLocation
    DeliveryDate
    DeliveryTime
    bookingType
    startDate
    endDate
    daysCount
    scheduledTime
    assignmentStartAt
    assignmentStatus
    assignedBaseId
    assignedBaseName
    assignmentScheduledAt
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetBookingQueryVariables,
  APITypes.GetBookingQuery
>;
export const listBookings = /* GraphQL */ `query ListBookings(
  $id: ID
  $filter: ModelBookingFilterInput
  $limit: Int
  $nextToken: String
  $sortDirection: ModelSortDirection
) {
  listBookings(
    id: $id
    filter: $filter
    limit: $limit
    nextToken: $nextToken
    sortDirection: $sortDirection
  ) {
    items {
      id
      userId
      BookingCode
      GoodType
      ServiceName
      truckType {
        type
        quantity
        __typename
      }
      weightPerUnit
      NoOfUnits
      GoodsWeight
      image
      video
      tax
      commission
      paymentType
      totalAmount
      totalLabour
      phoneNumber
      geoHas
      bookingName
      houseNo
      latitude
      longitude
      transportCharges
      nightCharges
      GenieMoney
      orderUpdate
      status
      labourName
      labourPhoneNumber
      labourId
      deliveryAddress
      pickupAddress
      pickupLatitudeAddress
      pickupLongitudeAddress
      stop1Address
      stop1LatitudeAddress
      stop1LongitudeAddress
      stop2Address
      stop2LatitudeAddress
      stop2LongitudeAddress
      stop3Address
      stop3LatitudeAddress
      stop3LongitudeAddress
      isListAvailable
      isGroundFloor
      floorNumber
      UintQty
      orders
      cancelReason
      PickupDate
      PickupTime
      BookingLocation
      DeliveryDate
      DeliveryTime
      bookingType
      startDate
      endDate
      daysCount
      scheduledTime
      assignmentStartAt
      assignmentStatus
      assignedBaseId
      assignedBaseName
      assignmentScheduledAt
      createdAt
      updatedAt
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListBookingsQueryVariables,
  APITypes.ListBookingsQuery
>;
export const getOrderAssignment = /* GraphQL */ `query GetOrderAssignment($id: ID!) {
  getOrderAssignment(id: $id) {
    id
    bookingId
    userId
    baseId
    status
    distanceKm
    slotStart
    slotHours
    assignedAt
    expiresAt
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetOrderAssignmentQueryVariables,
  APITypes.GetOrderAssignmentQuery
>;
export const listOrderAssignments = /* GraphQL */ `query ListOrderAssignments(
  $id: ID
  $filter: ModelOrderAssignmentFilterInput
  $limit: Int
  $nextToken: String
  $sortDirection: ModelSortDirection
) {
  listOrderAssignments(
    id: $id
    filter: $filter
    limit: $limit
    nextToken: $nextToken
    sortDirection: $sortDirection
  ) {
    items {
      id
      bookingId
      userId
      baseId
      status
      distanceKm
      slotStart
      slotHours
      assignedAt
      expiresAt
      createdAt
      updatedAt
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListOrderAssignmentsQueryVariables,
  APITypes.ListOrderAssignmentsQuery
>;
export const getLabour = /* GraphQL */ `query GetLabour($id: ID!) {
  getLabour(id: $id) {
    id
    name
    idNumber
    phoneNumber
    dailySalary
    aadharCardImage
    photo
    isActive
    totalEarnings
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedQuery<APITypes.GetLabourQueryVariables, APITypes.GetLabourQuery>;
export const listLabour = /* GraphQL */ `query ListLabour(
  $id: ID
  $filter: ModelLabourFilterInput
  $limit: Int
  $nextToken: String
  $sortDirection: ModelSortDirection
) {
  listLabour(
    id: $id
    filter: $filter
    limit: $limit
    nextToken: $nextToken
    sortDirection: $sortDirection
  ) {
    items {
      id
      name
      idNumber
      phoneNumber
      dailySalary
      aadharCardImage
      photo
      isActive
      totalEarnings
      createdAt
      updatedAt
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListLabourQueryVariables,
  APITypes.ListLabourQuery
>;
export const getAttendance = /* GraphQL */ `query GetAttendance($id: ID!) {
  getAttendance(id: $id) {
    id
    labourId
    date
    status
    orderTaken
    salary
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetAttendanceQueryVariables,
  APITypes.GetAttendanceQuery
>;
export const listAttendances = /* GraphQL */ `query ListAttendances(
  $id: ID
  $filter: ModelAttendanceFilterInput
  $limit: Int
  $nextToken: String
  $sortDirection: ModelSortDirection
) {
  listAttendances(
    id: $id
    filter: $filter
    limit: $limit
    nextToken: $nextToken
    sortDirection: $sortDirection
  ) {
    items {
      id
      labourId
      date
      status
      orderTaken
      salary
      createdAt
      updatedAt
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListAttendancesQueryVariables,
  APITypes.ListAttendancesQuery
>;
export const getBase = /* GraphQL */ `query GetBase($id: ID!) {
  getBase(id: $id) {
    id
    baseName
    baseCode
    latitude
    longitude
    geohash
    address
    city
    area
    pincode
    totalCapacity
    currentLabourers
    availableLabourers
    openTime
    closeTime
    isActive
    managerName
    managerPhone
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedQuery<APITypes.GetBaseQueryVariables, APITypes.GetBaseQuery>;
export const listBases = /* GraphQL */ `query ListBases(
  $id: ID
  $filter: ModelBaseFilterInput
  $limit: Int
  $nextToken: String
  $sortDirection: ModelSortDirection
) {
  listBases(
    id: $id
    filter: $filter
    limit: $limit
    nextToken: $nextToken
    sortDirection: $sortDirection
  ) {
    items {
      id
      baseName
      baseCode
      latitude
      longitude
      geohash
      address
      city
      area
      pincode
      totalCapacity
      currentLabourers
      availableLabourers
      openTime
      closeTime
      isActive
      managerName
      managerPhone
      createdAt
      updatedAt
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<APITypes.ListBasesQueryVariables, APITypes.ListBasesQuery>;
export const getLabourerBase = /* GraphQL */ `query GetLabourerBase($id: ID!) {
  getLabourerBase(id: $id) {
    id
    labourerId
    baseId
    status
    todayJobsCount
    todayHoursWorked
    maxHoursPerDay
    availableFrom
    availableTo
    bookedSlots
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetLabourerBaseQueryVariables,
  APITypes.GetLabourerBaseQuery
>;
export const listLabourerBases = /* GraphQL */ `query ListLabourerBases(
  $id: ID
  $filter: ModelLabourerBaseFilterInput
  $limit: Int
  $nextToken: String
  $sortDirection: ModelSortDirection
) {
  listLabourerBases(
    id: $id
    filter: $filter
    limit: $limit
    nextToken: $nextToken
    sortDirection: $sortDirection
  ) {
    items {
      id
      labourerId
      baseId
      status
      todayJobsCount
      todayHoursWorked
      maxHoursPerDay
      availableFrom
      availableTo
      bookedSlots
      createdAt
      updatedAt
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListLabourerBasesQueryVariables,
  APITypes.ListLabourerBasesQuery
>;
export const usersByReferralCode = /* GraphQL */ `query UsersByReferralCode(
  $referralCode: String!
  $sortDirection: ModelSortDirection
  $filter: ModelUsersFilterInput
  $limit: Int
  $nextToken: String
) {
  usersByReferralCode(
    referralCode: $referralCode
    sortDirection: $sortDirection
    filter: $filter
    limit: $limit
    nextToken: $nextToken
  ) {
    items {
      id
      username
      email
      phoneNumber
      password
      latitude
      longitude
      userType
      selectedRole
      isActive
      isDeleted
      languages
      deviceId
      deviceName
      firstName
      lastName
      isEmailVerified
      fcmToken
      addressList
      businessType
      businessName
      businessGSTNO
      balance
      earningBalance
      isWhatsappSync
      isHomeAddressSelect
      isFactoryAddress
      isOtherAddress
      isAccountActivated
      isUserOnline
      userImage
      aadharCardImage
      car_no
      driving_licence_number
      Rcnumber
      panCardImage
      rating
      geohash
      geohashPrefix
      referralCode
      referredBy
      totalTask
      totalEarnings
      lastAccessed
      createdAt
      updatedAt
      appVersion
      appVersionCode
      is_loading_unloading_enabled
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.UsersByReferralCodeQueryVariables,
  APITypes.UsersByReferralCodeQuery
>;
export const bookingsByUser = /* GraphQL */ `query BookingsByUser(
  $userId: ID!
  $createdAt: ModelStringKeyConditionInput
  $sortDirection: ModelSortDirection
  $filter: ModelBookingFilterInput
  $limit: Int
  $nextToken: String
) {
  bookingsByUser(
    userId: $userId
    createdAt: $createdAt
    sortDirection: $sortDirection
    filter: $filter
    limit: $limit
    nextToken: $nextToken
  ) {
    items {
      id
      userId
      BookingCode
      GoodType
      ServiceName
      truckType {
        type
        quantity
        __typename
      }
      weightPerUnit
      NoOfUnits
      GoodsWeight
      image
      video
      tax
      commission
      paymentType
      totalAmount
      totalLabour
      phoneNumber
      geoHas
      bookingName
      houseNo
      latitude
      longitude
      transportCharges
      nightCharges
      GenieMoney
      orderUpdate
      status
      labourName
      labourPhoneNumber
      labourId
      deliveryAddress
      pickupAddress
      pickupLatitudeAddress
      pickupLongitudeAddress
      stop1Address
      stop1LatitudeAddress
      stop1LongitudeAddress
      stop2Address
      stop2LatitudeAddress
      stop2LongitudeAddress
      stop3Address
      stop3LatitudeAddress
      stop3LongitudeAddress
      isListAvailable
      isGroundFloor
      floorNumber
      UintQty
      orders
      cancelReason
      PickupDate
      PickupTime
      BookingLocation
      DeliveryDate
      DeliveryTime
      bookingType
      startDate
      endDate
      daysCount
      scheduledTime
      assignmentStartAt
      assignmentStatus
      assignedBaseId
      assignedBaseName
      assignmentScheduledAt
      createdAt
      updatedAt
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.BookingsByUserQueryVariables,
  APITypes.BookingsByUserQuery
>;
export const attendancesByLabourIdAndDate = /* GraphQL */ `query AttendancesByLabourIdAndDate(
  $labourId: ID!
  $date: ModelStringKeyConditionInput
  $sortDirection: ModelSortDirection
  $filter: ModelAttendanceFilterInput
  $limit: Int
  $nextToken: String
) {
  attendancesByLabourIdAndDate(
    labourId: $labourId
    date: $date
    sortDirection: $sortDirection
    filter: $filter
    limit: $limit
    nextToken: $nextToken
  ) {
    items {
      id
      labourId
      date
      status
      orderTaken
      salary
      createdAt
      updatedAt
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.AttendancesByLabourIdAndDateQueryVariables,
  APITypes.AttendancesByLabourIdAndDateQuery
>;
export const basesByBaseCode = /* GraphQL */ `query BasesByBaseCode(
  $baseCode: String!
  $sortDirection: ModelSortDirection
  $filter: ModelBaseFilterInput
  $limit: Int
  $nextToken: String
) {
  basesByBaseCode(
    baseCode: $baseCode
    sortDirection: $sortDirection
    filter: $filter
    limit: $limit
    nextToken: $nextToken
  ) {
    items {
      id
      baseName
      baseCode
      latitude
      longitude
      geohash
      address
      city
      area
      pincode
      totalCapacity
      currentLabourers
      availableLabourers
      openTime
      closeTime
      isActive
      managerName
      managerPhone
      createdAt
      updatedAt
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.BasesByBaseCodeQueryVariables,
  APITypes.BasesByBaseCodeQuery
>;
export const basesByGeohashAndBaseName = /* GraphQL */ `query BasesByGeohashAndBaseName(
  $geohash: String!
  $baseName: ModelStringKeyConditionInput
  $sortDirection: ModelSortDirection
  $filter: ModelBaseFilterInput
  $limit: Int
  $nextToken: String
) {
  basesByGeohashAndBaseName(
    geohash: $geohash
    baseName: $baseName
    sortDirection: $sortDirection
    filter: $filter
    limit: $limit
    nextToken: $nextToken
  ) {
    items {
      id
      baseName
      baseCode
      latitude
      longitude
      geohash
      address
      city
      area
      pincode
      totalCapacity
      currentLabourers
      availableLabourers
      openTime
      closeTime
      isActive
      managerName
      managerPhone
      createdAt
      updatedAt
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.BasesByGeohashAndBaseNameQueryVariables,
  APITypes.BasesByGeohashAndBaseNameQuery
>;
export const labourerBasesByLabourerIdAndCreatedAt = /* GraphQL */ `query LabourerBasesByLabourerIdAndCreatedAt(
  $labourerId: ID!
  $createdAt: ModelStringKeyConditionInput
  $sortDirection: ModelSortDirection
  $filter: ModelLabourerBaseFilterInput
  $limit: Int
  $nextToken: String
) {
  labourerBasesByLabourerIdAndCreatedAt(
    labourerId: $labourerId
    createdAt: $createdAt
    sortDirection: $sortDirection
    filter: $filter
    limit: $limit
    nextToken: $nextToken
  ) {
    items {
      id
      labourerId
      baseId
      status
      todayJobsCount
      todayHoursWorked
      maxHoursPerDay
      availableFrom
      availableTo
      bookedSlots
      createdAt
      updatedAt
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.LabourerBasesByLabourerIdAndCreatedAtQueryVariables,
  APITypes.LabourerBasesByLabourerIdAndCreatedAtQuery
>;
export const labourerBasesByBaseIdAndStatus = /* GraphQL */ `query LabourerBasesByBaseIdAndStatus(
  $baseId: ID!
  $status: ModelStringKeyConditionInput
  $sortDirection: ModelSortDirection
  $filter: ModelLabourerBaseFilterInput
  $limit: Int
  $nextToken: String
) {
  labourerBasesByBaseIdAndStatus(
    baseId: $baseId
    status: $status
    sortDirection: $sortDirection
    filter: $filter
    limit: $limit
    nextToken: $nextToken
  ) {
    items {
      id
      labourerId
      baseId
      status
      todayJobsCount
      todayHoursWorked
      maxHoursPerDay
      availableFrom
      availableTo
      bookedSlots
      createdAt
      updatedAt
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.LabourerBasesByBaseIdAndStatusQueryVariables,
  APITypes.LabourerBasesByBaseIdAndStatusQuery
>;
export const getSuggestion = /* GraphQL */ `query GetSuggestion($id: ID!) {
  getSuggestion(id: $id) {
    id
    userId
    suggestionText
    category
    status
    priority
    response
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetSuggestionQueryVariables,
  APITypes.GetSuggestionQuery
>;
export const listSuggestions = /* GraphQL */ `query ListSuggestions(
  $id: ID
  $filter: ModelSuggestionFilterInput
  $limit: Int
  $nextToken: String
  $sortDirection: ModelSortDirection
) {
  listSuggestions(
    id: $id
    filter: $filter
    limit: $limit
    nextToken: $nextToken
    sortDirection: $sortDirection
  ) {
    items {
      id
      userId
      suggestionText
      category
      status
      priority
      response
      createdAt
      updatedAt
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListSuggestionsQueryVariables,
  APITypes.ListSuggestionsQuery
>;
export const getOrder = /* GraphQL */ `query GetOrder($id: ID!) {
  getOrder(id: $id) {
    id
    userId
    orderCode
    orderAmount
    currency
    orderNote
    cashfreeOrderId
    paymentSessionId
    paymentStatus
    paymentMethod
    paymentReferenceId
    paymentGatewayResponse
    customerName
    customerEmail
    customerPhone
    status
    createdAt
    updatedAt
    bookingId
    createdBy
    updatedBy
    __typename
  }
}
` as GeneratedQuery<APITypes.GetOrderQueryVariables, APITypes.GetOrderQuery>;
export const listOrders = /* GraphQL */ `query ListOrders(
  $id: ID
  $filter: ModelOrderFilterInput
  $limit: Int
  $nextToken: String
  $sortDirection: ModelSortDirection
) {
  listOrders(
    id: $id
    filter: $filter
    limit: $limit
    nextToken: $nextToken
    sortDirection: $sortDirection
  ) {
    items {
      id
      userId
      orderCode
      orderAmount
      currency
      orderNote
      cashfreeOrderId
      paymentSessionId
      paymentStatus
      paymentMethod
      paymentReferenceId
      paymentGatewayResponse
      customerName
      customerEmail
      customerPhone
      status
      createdAt
      updatedAt
      bookingId
      createdBy
      updatedBy
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListOrdersQueryVariables,
  APITypes.ListOrdersQuery
>;
export const ordersByUserIdAndCreatedAt = /* GraphQL */ `query OrdersByUserIdAndCreatedAt(
  $userId: ID!
  $createdAt: ModelStringKeyConditionInput
  $sortDirection: ModelSortDirection
  $filter: ModelOrderFilterInput
  $limit: Int
  $nextToken: String
) {
  ordersByUserIdAndCreatedAt(
    userId: $userId
    createdAt: $createdAt
    sortDirection: $sortDirection
    filter: $filter
    limit: $limit
    nextToken: $nextToken
  ) {
    items {
      id
      userId
      orderCode
      orderAmount
      currency
      orderNote
      cashfreeOrderId
      paymentSessionId
      paymentStatus
      paymentMethod
      paymentReferenceId
      paymentGatewayResponse
      customerName
      customerEmail
      customerPhone
      status
      createdAt
      updatedAt
      bookingId
      createdBy
      updatedBy
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.OrdersByUserIdAndCreatedAtQueryVariables,
  APITypes.OrdersByUserIdAndCreatedAtQuery
>;
export const ordersByOrderCode = /* GraphQL */ `query OrdersByOrderCode(
  $orderCode: String!
  $sortDirection: ModelSortDirection
  $filter: ModelOrderFilterInput
  $limit: Int
  $nextToken: String
) {
  ordersByOrderCode(
    orderCode: $orderCode
    sortDirection: $sortDirection
    filter: $filter
    limit: $limit
    nextToken: $nextToken
  ) {
    items {
      id
      userId
      orderCode
      orderAmount
      currency
      orderNote
      cashfreeOrderId
      paymentSessionId
      paymentStatus
      paymentMethod
      paymentReferenceId
      paymentGatewayResponse
      customerName
      customerEmail
      customerPhone
      status
      createdAt
      updatedAt
      bookingId
      createdBy
      updatedBy
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.OrdersByOrderCodeQueryVariables,
  APITypes.OrdersByOrderCodeQuery
>;
export const ordersByBookingId = /* GraphQL */ `query OrdersByBookingId(
  $bookingId: ID!
  $sortDirection: ModelSortDirection
  $filter: ModelOrderFilterInput
  $limit: Int
  $nextToken: String
) {
  ordersByBookingId(
    bookingId: $bookingId
    sortDirection: $sortDirection
    filter: $filter
    limit: $limit
    nextToken: $nextToken
  ) {
    items {
      id
      userId
      orderCode
      orderAmount
      currency
      orderNote
      cashfreeOrderId
      paymentSessionId
      paymentStatus
      paymentMethod
      paymentReferenceId
      paymentGatewayResponse
      customerName
      customerEmail
      customerPhone
      status
      createdAt
      updatedAt
      bookingId
      createdBy
      updatedBy
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.OrdersByBookingIdQueryVariables,
  APITypes.OrdersByBookingIdQuery
>;
