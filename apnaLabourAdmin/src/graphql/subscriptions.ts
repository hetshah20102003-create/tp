/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from "../API";
type GeneratedSubscription<InputType, OutputType> = string & {
  __generatedSubscriptionInput: InputType;
  __generatedSubscriptionOutput: OutputType;
};

export const onCreateUsers = /* GraphQL */ `subscription OnCreateUsers($filter: ModelSubscriptionUsersFilterInput) {
  onCreateUsers(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnCreateUsersSubscriptionVariables,
  APITypes.OnCreateUsersSubscription
>;
export const onUpdateUsers = /* GraphQL */ `subscription OnUpdateUsers($filter: ModelSubscriptionUsersFilterInput) {
  onUpdateUsers(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnUpdateUsersSubscriptionVariables,
  APITypes.OnUpdateUsersSubscription
>;
export const onDeleteUsers = /* GraphQL */ `subscription OnDeleteUsers($filter: ModelSubscriptionUsersFilterInput) {
  onDeleteUsers(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnDeleteUsersSubscriptionVariables,
  APITypes.OnDeleteUsersSubscription
>;
export const onCreateRate = /* GraphQL */ `subscription OnCreateRate($filter: ModelSubscriptionRateFilterInput) {
  onCreateRate(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnCreateRateSubscriptionVariables,
  APITypes.OnCreateRateSubscription
>;
export const onUpdateRate = /* GraphQL */ `subscription OnUpdateRate($filter: ModelSubscriptionRateFilterInput) {
  onUpdateRate(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnUpdateRateSubscriptionVariables,
  APITypes.OnUpdateRateSubscription
>;
export const onDeleteRate = /* GraphQL */ `subscription OnDeleteRate($filter: ModelSubscriptionRateFilterInput) {
  onDeleteRate(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnDeleteRateSubscriptionVariables,
  APITypes.OnDeleteRateSubscription
>;
export const onCreateOrderDetails = /* GraphQL */ `subscription OnCreateOrderDetails(
  $filter: ModelSubscriptionOrderDetailsFilterInput
) {
  onCreateOrderDetails(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnCreateOrderDetailsSubscriptionVariables,
  APITypes.OnCreateOrderDetailsSubscription
>;
export const onUpdateOrderDetails = /* GraphQL */ `subscription OnUpdateOrderDetails(
  $filter: ModelSubscriptionOrderDetailsFilterInput
) {
  onUpdateOrderDetails(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnUpdateOrderDetailsSubscriptionVariables,
  APITypes.OnUpdateOrderDetailsSubscription
>;
export const onDeleteOrderDetails = /* GraphQL */ `subscription OnDeleteOrderDetails(
  $filter: ModelSubscriptionOrderDetailsFilterInput
) {
  onDeleteOrderDetails(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnDeleteOrderDetailsSubscriptionVariables,
  APITypes.OnDeleteOrderDetailsSubscription
>;
export const onCreateNotification = /* GraphQL */ `subscription OnCreateNotification(
  $filter: ModelSubscriptionNotificationFilterInput
) {
  onCreateNotification(filter: $filter) {
    id
    title
    body
    imageUrl
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnCreateNotificationSubscriptionVariables,
  APITypes.OnCreateNotificationSubscription
>;
export const onUpdateNotification = /* GraphQL */ `subscription OnUpdateNotification(
  $filter: ModelSubscriptionNotificationFilterInput
) {
  onUpdateNotification(filter: $filter) {
    id
    title
    body
    imageUrl
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnUpdateNotificationSubscriptionVariables,
  APITypes.OnUpdateNotificationSubscription
>;
export const onDeleteNotification = /* GraphQL */ `subscription OnDeleteNotification(
  $filter: ModelSubscriptionNotificationFilterInput
) {
  onDeleteNotification(filter: $filter) {
    id
    title
    body
    imageUrl
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnDeleteNotificationSubscriptionVariables,
  APITypes.OnDeleteNotificationSubscription
>;
export const onCreateCategory = /* GraphQL */ `subscription OnCreateCategory($filter: ModelSubscriptionCategoryFilterInput) {
  onCreateCategory(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnCreateCategorySubscriptionVariables,
  APITypes.OnCreateCategorySubscription
>;
export const onUpdateCategory = /* GraphQL */ `subscription OnUpdateCategory($filter: ModelSubscriptionCategoryFilterInput) {
  onUpdateCategory(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnUpdateCategorySubscriptionVariables,
  APITypes.OnUpdateCategorySubscription
>;
export const onDeleteCategory = /* GraphQL */ `subscription OnDeleteCategory($filter: ModelSubscriptionCategoryFilterInput) {
  onDeleteCategory(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnDeleteCategorySubscriptionVariables,
  APITypes.OnDeleteCategorySubscription
>;
export const onCreateBooking = /* GraphQL */ `subscription OnCreateBooking($filter: ModelSubscriptionBookingFilterInput) {
  onCreateBooking(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnCreateBookingSubscriptionVariables,
  APITypes.OnCreateBookingSubscription
>;
export const onUpdateBooking = /* GraphQL */ `subscription OnUpdateBooking($filter: ModelSubscriptionBookingFilterInput) {
  onUpdateBooking(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnUpdateBookingSubscriptionVariables,
  APITypes.OnUpdateBookingSubscription
>;
export const onDeleteBooking = /* GraphQL */ `subscription OnDeleteBooking($filter: ModelSubscriptionBookingFilterInput) {
  onDeleteBooking(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnDeleteBookingSubscriptionVariables,
  APITypes.OnDeleteBookingSubscription
>;
export const onCreateOrderAssignment = /* GraphQL */ `subscription OnCreateOrderAssignment(
  $filter: ModelSubscriptionOrderAssignmentFilterInput
) {
  onCreateOrderAssignment(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnCreateOrderAssignmentSubscriptionVariables,
  APITypes.OnCreateOrderAssignmentSubscription
>;
export const onUpdateOrderAssignment = /* GraphQL */ `subscription OnUpdateOrderAssignment(
  $filter: ModelSubscriptionOrderAssignmentFilterInput
) {
  onUpdateOrderAssignment(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnUpdateOrderAssignmentSubscriptionVariables,
  APITypes.OnUpdateOrderAssignmentSubscription
>;
export const onDeleteOrderAssignment = /* GraphQL */ `subscription OnDeleteOrderAssignment(
  $filter: ModelSubscriptionOrderAssignmentFilterInput
) {
  onDeleteOrderAssignment(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnDeleteOrderAssignmentSubscriptionVariables,
  APITypes.OnDeleteOrderAssignmentSubscription
>;
export const onCreateLabour = /* GraphQL */ `subscription OnCreateLabour($filter: ModelSubscriptionLabourFilterInput) {
  onCreateLabour(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnCreateLabourSubscriptionVariables,
  APITypes.OnCreateLabourSubscription
>;
export const onUpdateLabour = /* GraphQL */ `subscription OnUpdateLabour($filter: ModelSubscriptionLabourFilterInput) {
  onUpdateLabour(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnUpdateLabourSubscriptionVariables,
  APITypes.OnUpdateLabourSubscription
>;
export const onDeleteLabour = /* GraphQL */ `subscription OnDeleteLabour($filter: ModelSubscriptionLabourFilterInput) {
  onDeleteLabour(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnDeleteLabourSubscriptionVariables,
  APITypes.OnDeleteLabourSubscription
>;
export const onCreateAttendance = /* GraphQL */ `subscription OnCreateAttendance(
  $filter: ModelSubscriptionAttendanceFilterInput
) {
  onCreateAttendance(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnCreateAttendanceSubscriptionVariables,
  APITypes.OnCreateAttendanceSubscription
>;
export const onUpdateAttendance = /* GraphQL */ `subscription OnUpdateAttendance(
  $filter: ModelSubscriptionAttendanceFilterInput
) {
  onUpdateAttendance(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnUpdateAttendanceSubscriptionVariables,
  APITypes.OnUpdateAttendanceSubscription
>;
export const onDeleteAttendance = /* GraphQL */ `subscription OnDeleteAttendance(
  $filter: ModelSubscriptionAttendanceFilterInput
) {
  onDeleteAttendance(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnDeleteAttendanceSubscriptionVariables,
  APITypes.OnDeleteAttendanceSubscription
>;
export const onCreateBase = /* GraphQL */ `subscription OnCreateBase($filter: ModelSubscriptionBaseFilterInput) {
  onCreateBase(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnCreateBaseSubscriptionVariables,
  APITypes.OnCreateBaseSubscription
>;
export const onUpdateBase = /* GraphQL */ `subscription OnUpdateBase($filter: ModelSubscriptionBaseFilterInput) {
  onUpdateBase(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnUpdateBaseSubscriptionVariables,
  APITypes.OnUpdateBaseSubscription
>;
export const onDeleteBase = /* GraphQL */ `subscription OnDeleteBase($filter: ModelSubscriptionBaseFilterInput) {
  onDeleteBase(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnDeleteBaseSubscriptionVariables,
  APITypes.OnDeleteBaseSubscription
>;
export const onCreateLabourerBase = /* GraphQL */ `subscription OnCreateLabourerBase(
  $filter: ModelSubscriptionLabourerBaseFilterInput
) {
  onCreateLabourerBase(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnCreateLabourerBaseSubscriptionVariables,
  APITypes.OnCreateLabourerBaseSubscription
>;
export const onUpdateLabourerBase = /* GraphQL */ `subscription OnUpdateLabourerBase(
  $filter: ModelSubscriptionLabourerBaseFilterInput
) {
  onUpdateLabourerBase(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnUpdateLabourerBaseSubscriptionVariables,
  APITypes.OnUpdateLabourerBaseSubscription
>;
export const onDeleteLabourerBase = /* GraphQL */ `subscription OnDeleteLabourerBase(
  $filter: ModelSubscriptionLabourerBaseFilterInput
) {
  onDeleteLabourerBase(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnDeleteLabourerBaseSubscriptionVariables,
  APITypes.OnDeleteLabourerBaseSubscription
>;
export const onCreateSuggestion = /* GraphQL */ `subscription OnCreateSuggestion(
  $filter: ModelSubscriptionSuggestionFilterInput
  $userId: String
) {
  onCreateSuggestion(filter: $filter, userId: $userId) {
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
` as GeneratedSubscription<
  APITypes.OnCreateSuggestionSubscriptionVariables,
  APITypes.OnCreateSuggestionSubscription
>;
export const onUpdateSuggestion = /* GraphQL */ `subscription OnUpdateSuggestion(
  $filter: ModelSubscriptionSuggestionFilterInput
  $userId: String
) {
  onUpdateSuggestion(filter: $filter, userId: $userId) {
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
` as GeneratedSubscription<
  APITypes.OnUpdateSuggestionSubscriptionVariables,
  APITypes.OnUpdateSuggestionSubscription
>;
export const onDeleteSuggestion = /* GraphQL */ `subscription OnDeleteSuggestion(
  $filter: ModelSubscriptionSuggestionFilterInput
  $userId: String
) {
  onDeleteSuggestion(filter: $filter, userId: $userId) {
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
` as GeneratedSubscription<
  APITypes.OnDeleteSuggestionSubscriptionVariables,
  APITypes.OnDeleteSuggestionSubscription
>;
export const onCreateOrder = /* GraphQL */ `subscription OnCreateOrder(
  $filter: ModelSubscriptionOrderFilterInput
  $userId: String
) {
  onCreateOrder(filter: $filter, userId: $userId) {
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
` as GeneratedSubscription<
  APITypes.OnCreateOrderSubscriptionVariables,
  APITypes.OnCreateOrderSubscription
>;
export const onUpdateOrder = /* GraphQL */ `subscription OnUpdateOrder(
  $filter: ModelSubscriptionOrderFilterInput
  $userId: String
) {
  onUpdateOrder(filter: $filter, userId: $userId) {
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
` as GeneratedSubscription<
  APITypes.OnUpdateOrderSubscriptionVariables,
  APITypes.OnUpdateOrderSubscription
>;
export const onDeleteOrder = /* GraphQL */ `subscription OnDeleteOrder(
  $filter: ModelSubscriptionOrderFilterInput
  $userId: String
) {
  onDeleteOrder(filter: $filter, userId: $userId) {
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
` as GeneratedSubscription<
  APITypes.OnDeleteOrderSubscriptionVariables,
  APITypes.OnDeleteOrderSubscription
>;
