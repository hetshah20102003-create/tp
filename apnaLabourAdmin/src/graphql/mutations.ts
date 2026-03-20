/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from "../API";
type GeneratedMutation<InputType, OutputType> = string & {
  __generatedMutationInput: InputType;
  __generatedMutationOutput: OutputType;
};

export const createUsers = /* GraphQL */ `mutation CreateUsers(
  $input: CreateUsersInput!
  $condition: ModelUsersConditionInput
) {
  createUsers(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.CreateUsersMutationVariables,
  APITypes.CreateUsersMutation
>;
export const updateUsers = /* GraphQL */ `mutation UpdateUsers(
  $input: UpdateUsersInput!
  $condition: ModelUsersConditionInput
) {
  updateUsers(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.UpdateUsersMutationVariables,
  APITypes.UpdateUsersMutation
>;
export const deleteUsers = /* GraphQL */ `mutation DeleteUsers(
  $input: DeleteUsersInput!
  $condition: ModelUsersConditionInput
) {
  deleteUsers(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.DeleteUsersMutationVariables,
  APITypes.DeleteUsersMutation
>;
export const createRate = /* GraphQL */ `mutation CreateRate(
  $input: CreateRateInput!
  $condition: ModelRateConditionInput
) {
  createRate(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.CreateRateMutationVariables,
  APITypes.CreateRateMutation
>;
export const updateRate = /* GraphQL */ `mutation UpdateRate(
  $input: UpdateRateInput!
  $condition: ModelRateConditionInput
) {
  updateRate(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.UpdateRateMutationVariables,
  APITypes.UpdateRateMutation
>;
export const deleteRate = /* GraphQL */ `mutation DeleteRate(
  $input: DeleteRateInput!
  $condition: ModelRateConditionInput
) {
  deleteRate(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.DeleteRateMutationVariables,
  APITypes.DeleteRateMutation
>;
export const createOrderDetails = /* GraphQL */ `mutation CreateOrderDetails(
  $input: CreateOrderDetailsInput!
  $condition: ModelOrderDetailsConditionInput
) {
  createOrderDetails(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.CreateOrderDetailsMutationVariables,
  APITypes.CreateOrderDetailsMutation
>;
export const updateOrderDetails = /* GraphQL */ `mutation UpdateOrderDetails(
  $input: UpdateOrderDetailsInput!
  $condition: ModelOrderDetailsConditionInput
) {
  updateOrderDetails(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.UpdateOrderDetailsMutationVariables,
  APITypes.UpdateOrderDetailsMutation
>;
export const deleteOrderDetails = /* GraphQL */ `mutation DeleteOrderDetails(
  $input: DeleteOrderDetailsInput!
  $condition: ModelOrderDetailsConditionInput
) {
  deleteOrderDetails(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.DeleteOrderDetailsMutationVariables,
  APITypes.DeleteOrderDetailsMutation
>;
export const createNotification = /* GraphQL */ `mutation CreateNotification(
  $input: CreateNotificationInput!
  $condition: ModelNotificationConditionInput
) {
  createNotification(input: $input, condition: $condition) {
    id
    title
    body
    imageUrl
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedMutation<
  APITypes.CreateNotificationMutationVariables,
  APITypes.CreateNotificationMutation
>;
export const updateNotification = /* GraphQL */ `mutation UpdateNotification(
  $input: UpdateNotificationInput!
  $condition: ModelNotificationConditionInput
) {
  updateNotification(input: $input, condition: $condition) {
    id
    title
    body
    imageUrl
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedMutation<
  APITypes.UpdateNotificationMutationVariables,
  APITypes.UpdateNotificationMutation
>;
export const deleteNotification = /* GraphQL */ `mutation DeleteNotification(
  $input: DeleteNotificationInput!
  $condition: ModelNotificationConditionInput
) {
  deleteNotification(input: $input, condition: $condition) {
    id
    title
    body
    imageUrl
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedMutation<
  APITypes.DeleteNotificationMutationVariables,
  APITypes.DeleteNotificationMutation
>;
export const createCategory = /* GraphQL */ `mutation CreateCategory(
  $input: CreateCategoryInput!
  $condition: ModelCategoryConditionInput
) {
  createCategory(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.CreateCategoryMutationVariables,
  APITypes.CreateCategoryMutation
>;
export const updateCategory = /* GraphQL */ `mutation UpdateCategory(
  $input: UpdateCategoryInput!
  $condition: ModelCategoryConditionInput
) {
  updateCategory(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.UpdateCategoryMutationVariables,
  APITypes.UpdateCategoryMutation
>;
export const deleteCategory = /* GraphQL */ `mutation DeleteCategory(
  $input: DeleteCategoryInput!
  $condition: ModelCategoryConditionInput
) {
  deleteCategory(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.DeleteCategoryMutationVariables,
  APITypes.DeleteCategoryMutation
>;
export const createBooking = /* GraphQL */ `mutation CreateBooking(
  $input: CreateBookingInput!
  $condition: ModelBookingConditionInput
) {
  createBooking(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.CreateBookingMutationVariables,
  APITypes.CreateBookingMutation
>;
export const updateBooking = /* GraphQL */ `mutation UpdateBooking(
  $input: UpdateBookingInput!
  $condition: ModelBookingConditionInput
) {
  updateBooking(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.UpdateBookingMutationVariables,
  APITypes.UpdateBookingMutation
>;
export const deleteBooking = /* GraphQL */ `mutation DeleteBooking(
  $input: DeleteBookingInput!
  $condition: ModelBookingConditionInput
) {
  deleteBooking(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.DeleteBookingMutationVariables,
  APITypes.DeleteBookingMutation
>;
export const createOrderAssignment = /* GraphQL */ `mutation CreateOrderAssignment(
  $input: CreateOrderAssignmentInput!
  $condition: ModelOrderAssignmentConditionInput
) {
  createOrderAssignment(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.CreateOrderAssignmentMutationVariables,
  APITypes.CreateOrderAssignmentMutation
>;
export const updateOrderAssignment = /* GraphQL */ `mutation UpdateOrderAssignment(
  $input: UpdateOrderAssignmentInput!
  $condition: ModelOrderAssignmentConditionInput
) {
  updateOrderAssignment(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.UpdateOrderAssignmentMutationVariables,
  APITypes.UpdateOrderAssignmentMutation
>;
export const deleteOrderAssignment = /* GraphQL */ `mutation DeleteOrderAssignment(
  $input: DeleteOrderAssignmentInput!
  $condition: ModelOrderAssignmentConditionInput
) {
  deleteOrderAssignment(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.DeleteOrderAssignmentMutationVariables,
  APITypes.DeleteOrderAssignmentMutation
>;
export const createLabour = /* GraphQL */ `mutation CreateLabour(
  $input: CreateLabourInput!
  $condition: ModelLabourConditionInput
) {
  createLabour(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.CreateLabourMutationVariables,
  APITypes.CreateLabourMutation
>;
export const updateLabour = /* GraphQL */ `mutation UpdateLabour(
  $input: UpdateLabourInput!
  $condition: ModelLabourConditionInput
) {
  updateLabour(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.UpdateLabourMutationVariables,
  APITypes.UpdateLabourMutation
>;
export const deleteLabour = /* GraphQL */ `mutation DeleteLabour(
  $input: DeleteLabourInput!
  $condition: ModelLabourConditionInput
) {
  deleteLabour(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.DeleteLabourMutationVariables,
  APITypes.DeleteLabourMutation
>;
export const createAttendance = /* GraphQL */ `mutation CreateAttendance(
  $input: CreateAttendanceInput!
  $condition: ModelAttendanceConditionInput
) {
  createAttendance(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.CreateAttendanceMutationVariables,
  APITypes.CreateAttendanceMutation
>;
export const updateAttendance = /* GraphQL */ `mutation UpdateAttendance(
  $input: UpdateAttendanceInput!
  $condition: ModelAttendanceConditionInput
) {
  updateAttendance(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.UpdateAttendanceMutationVariables,
  APITypes.UpdateAttendanceMutation
>;
export const deleteAttendance = /* GraphQL */ `mutation DeleteAttendance(
  $input: DeleteAttendanceInput!
  $condition: ModelAttendanceConditionInput
) {
  deleteAttendance(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.DeleteAttendanceMutationVariables,
  APITypes.DeleteAttendanceMutation
>;
export const createBase = /* GraphQL */ `mutation CreateBase(
  $input: CreateBaseInput!
  $condition: ModelBaseConditionInput
) {
  createBase(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.CreateBaseMutationVariables,
  APITypes.CreateBaseMutation
>;
export const updateBase = /* GraphQL */ `mutation UpdateBase(
  $input: UpdateBaseInput!
  $condition: ModelBaseConditionInput
) {
  updateBase(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.UpdateBaseMutationVariables,
  APITypes.UpdateBaseMutation
>;
export const deleteBase = /* GraphQL */ `mutation DeleteBase(
  $input: DeleteBaseInput!
  $condition: ModelBaseConditionInput
) {
  deleteBase(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.DeleteBaseMutationVariables,
  APITypes.DeleteBaseMutation
>;
export const createLabourerBase = /* GraphQL */ `mutation CreateLabourerBase(
  $input: CreateLabourerBaseInput!
  $condition: ModelLabourerBaseConditionInput
) {
  createLabourerBase(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.CreateLabourerBaseMutationVariables,
  APITypes.CreateLabourerBaseMutation
>;
export const updateLabourerBase = /* GraphQL */ `mutation UpdateLabourerBase(
  $input: UpdateLabourerBaseInput!
  $condition: ModelLabourerBaseConditionInput
) {
  updateLabourerBase(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.UpdateLabourerBaseMutationVariables,
  APITypes.UpdateLabourerBaseMutation
>;
export const deleteLabourerBase = /* GraphQL */ `mutation DeleteLabourerBase(
  $input: DeleteLabourerBaseInput!
  $condition: ModelLabourerBaseConditionInput
) {
  deleteLabourerBase(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.DeleteLabourerBaseMutationVariables,
  APITypes.DeleteLabourerBaseMutation
>;
export const createSuggestion = /* GraphQL */ `mutation CreateSuggestion(
  $input: CreateSuggestionInput!
  $condition: ModelSuggestionConditionInput
) {
  createSuggestion(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.CreateSuggestionMutationVariables,
  APITypes.CreateSuggestionMutation
>;
export const updateSuggestion = /* GraphQL */ `mutation UpdateSuggestion(
  $input: UpdateSuggestionInput!
  $condition: ModelSuggestionConditionInput
) {
  updateSuggestion(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.UpdateSuggestionMutationVariables,
  APITypes.UpdateSuggestionMutation
>;
export const deleteSuggestion = /* GraphQL */ `mutation DeleteSuggestion(
  $input: DeleteSuggestionInput!
  $condition: ModelSuggestionConditionInput
) {
  deleteSuggestion(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.DeleteSuggestionMutationVariables,
  APITypes.DeleteSuggestionMutation
>;
export const createOrder = /* GraphQL */ `mutation CreateOrder(
  $input: CreateOrderInput!
  $condition: ModelOrderConditionInput
) {
  createOrder(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.CreateOrderMutationVariables,
  APITypes.CreateOrderMutation
>;
export const updateOrder = /* GraphQL */ `mutation UpdateOrder(
  $input: UpdateOrderInput!
  $condition: ModelOrderConditionInput
) {
  updateOrder(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.UpdateOrderMutationVariables,
  APITypes.UpdateOrderMutation
>;
export const deleteOrder = /* GraphQL */ `mutation DeleteOrder(
  $input: DeleteOrderInput!
  $condition: ModelOrderConditionInput
) {
  deleteOrder(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.DeleteOrderMutationVariables,
  APITypes.DeleteOrderMutation
>;
