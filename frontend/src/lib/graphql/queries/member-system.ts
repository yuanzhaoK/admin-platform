import { gql } from "@apollo/client";

// ========================= 会员管理相关查询 =========================

export const GET_MEMBERS = gql`
  query GetMembers($query: MemberQueryInput!) {
    members(query: $query) {
      items {
        id
        created
        updated
        profile {
          username
          email
          phone
          avatar
          realName
          nickname
          gender
          birthday
          bio
          location {
            province
            city
            district
            address
          }
        }
        level {
          id
          name
          displayName
          color
          icon
        }
        levelId
        points
        frozenPoints
        totalEarnedPoints
        totalSpentPoints
        balance
        frozenBalance
        status
        isVerified
        registerTime
        lastLoginTime
        lastActiveTime
        stats {
          totalOrders
          totalAmount
          averageOrderValue
          loyaltyScore
        }
        tags {
          id
          name
          color
          type
        }
        riskLevel
        trustScore
      }
      pagination {
        page
        perPage
        totalItems
        totalPages
        hasNext
        hasPrev
      }
      stats {
        totalActive
        totalInactive
        totalBanned
        totalNewThisMonth
        averageLevel
        totalPoints
        totalBalance
      }
    }
  }
`;

export const GET_MEMBER_DETAIL = gql`
  query GetMemberDetail($id: ID!) {
    memberDetail(id: $id) {
      member {
        id
        created
        updated
        profile {
          username
          email
          phone
          avatar
          realName
          nickname
          gender
          birthday
          bio
          location {
            province
            city
            district
            address
            longitude
            latitude
            postalCode
          }
          preferences {
            language
            timezone
            currency
            notifications {
              email
              sms
              push
              wechat
              orderUpdates
              promotions
              pointsUpdates
              systemMessages
            }
            privacy {
              profileVisibility
              showLocation
              showBirthday
              showPhone
              showEmail
              allowSearch
              allowRecommendation
            }
            marketing {
              emailMarketing
              smsMarketing
              pushMarketing
              personalizedRecommendations
              behaviorTracking
            }
          }
        }
        level {
          id
          name
          displayName
          description
          color
          backgroundColor
          icon
          badgeImage
          level
          benefits {
            id
            type
            name
            description
            value
            condition
            icon
            isActive
          }
          discountRate
          pointsRate
          freeShippingThreshold
        }
        levelId
        points
        frozenPoints
        totalEarnedPoints
        totalSpentPoints
        balance
        frozenBalance
        status
        isVerified
        verification {
          status
          type
          identityCard {
            number
            name
            verified
            verifiedAt
          }
          enterprise {
            companyName
            businessLicense
            taxNumber
            verified
            verifiedAt
          }
          documents {
            id
            filename
            url
            thumbnailUrl
          }
          verifiedAt
          verifiedBy
          rejectReason
        }
        stats {
          totalOrders
          totalAmount
          totalSavings
          averageOrderValue
          favoriteCategories
          loyaltyScore
          engagementScore
          lastOrderDate
          membershipDuration
        }
        registerTime
        lastLoginTime
        lastActiveTime
        levelUpgradeTime
        wechatOpenid
        wechatUnionid
        thirdPartyBindings {
          platform
          platformUserId
          platformUsername
          avatar
          bindTime
          lastSyncTime
          isActive
        }
        tags {
          id
          name
          displayName
          description
          color
          backgroundColor
          type
          category
          weight
          isActive
        }
        groups
        segment
        riskLevel
        trustScore
        blacklistReason
        customFields
        metadata
      }
      recentOrders
      recentPoints {
        id
        type
        points
        balance
        reason
        description
        earnedAt
        spentAt
        expiredAt
        status
        source
        operatorName
      }
      loginHistory
      behaviorData
      recommendations
    }
  }
`;

export const SEARCH_MEMBERS = gql`
  query SearchMembers($keyword: String!) {
    searchMembers(keyword: $keyword) {
      id
      profile {
        username
        email
        phone
        avatar
        realName
        nickname
      }
      level {
        name
        color
      }
      points
      balance
      status
      registerTime
    }
  }
`;

export const GET_MEMBER_STATS = gql`
  query GetMemberStats($dateRange: DateRangeInput) {
    memberStats(dateRange: $dateRange) {
      overview {
        total
        active
        inactive
        banned
        newThisMonth
        retentionRate
      }
      levelDistribution {
        levelId
        levelName
        memberCount
        percentage
        averageOrderValue
        totalRevenue
      }
      genderDistribution {
        gender
        count
        percentage
      }
      ageDistribution {
        ageGroup
        count
        percentage
      }
      locationDistribution {
        province
        city
        count
        percentage
      }
      registrationTrend {
        date
        count
        cumulative
      }
      activityTrend {
        date
        activeUsers
        loginCount
        orderCount
      }
      segmentAnalysis {
        segment
        count
        avgOrderValue
        totalRevenue
        retentionRate
      }
    }
  }
`;

// ========================= 会员等级相关查询 =========================

export const GET_MEMBER_LEVELS = gql`
  query GetMemberLevels($query: MemberLevelQueryInput!) {
    memberLevels(query: $query) {
      items {
        id
        created
        updated
        name
        displayName
        description
        slogan
        icon
        color
        backgroundColor
        badgeImage
        level
        sortOrder
        isActive
        isDefault
        upgradeConditions {
          type
          operator
          value
          valueMax
          description
          weight
        }
        pointsRequired
        benefits {
          id
          type
          name
          description
          value
          condition
          icon
          isActive
        }
        discountRate
        pointsRate
        freeShippingThreshold
        maintenanceRule {
          enabled
          period
          conditions {
            type
            operator
            value
            valueMax
            description
            weight
          }
          downgradeToLevelId
          gracePeriod
          notificationDays
        }
        memberCount
        averageOrderValue
        totalRevenue
        maxValidityDays
        allowDowngrade
        autoUpgrade
        customBenefits
        businessRules
        metadata
      }
      pagination {
        page
        perPage
        totalItems
        totalPages
        hasNext
        hasPrev
      }
      stats {
        totalLevels
        activeLevels
        totalMembers
        averageLevel
      }
    }
  }
`;

export const GET_MEMBER_LEVEL = gql`
  query GetMemberLevel($id: ID!) {
    memberLevel(id: $id) {
      id
      created
      updated
      name
      displayName
      description
      slogan
      icon
      color
      backgroundColor
      badgeImage
      level
      sortOrder
      isActive
      isDefault
      upgradeConditions {
        type
        operator
        value
        valueMax
        description
        weight
      }
      pointsRequired
      benefits {
        id
        type
        name
        description
        value
        condition
        icon
        isActive
      }
      discountRate
      pointsRate
      freeShippingThreshold
      maintenanceRule {
        enabled
        period
        conditions {
          type
          operator
          value
          valueMax
          description
          weight
        }
        downgradeToLevelId
        gracePeriod
        notificationDays
      }
      memberCount
      averageOrderValue
      totalRevenue
      maxValidityDays
      allowDowngrade
      autoUpgrade
      customBenefits
      businessRules
      metadata
    }
  }
`;

export const GET_ALL_MEMBER_LEVELS = gql`
  query GetAllMemberLevels {
    allMemberLevels {
      id
      name
      displayName
      color
      icon
      level
      pointsRequired
      isActive
      isDefault
    }
  }
`;

export const GET_LEVEL_UPGRADE_HISTORIES = gql`
  query GetLevelUpgradeHistories($query: LevelUpgradeHistoryQueryInput!) {
    levelUpgradeHistories(query: $query) {
      items {
        id
        created
        updated
        memberId
        username
        fromLevelId
        fromLevelName
        toLevelId
        toLevelName
        upgradeType
        reason
        conditions {
          type
          value
          satisfied
        }
        operatorId
        operatorName
        upgradeTime
        beforeSnapshot {
          points
          totalOrders
          totalAmount
        }
        afterSnapshot {
          points
          totalOrders
          totalAmount
        }
      }
      pagination {
        page
        perPage
        totalItems
        totalPages
        hasNext
        hasPrev
      }
      stats {
        totalUpgrades
        autoUpgrades
        manualUpgrades
        adminUpgrades
      }
    }
  }
`;

export const CHECK_UPGRADE_ELIGIBILITY = gql`
  query CheckUpgradeEligibility($memberId: String!) {
    checkUpgradeEligibility(memberId: $memberId) {
      canUpgrade
      targetLevelId
      targetLevel {
        id
        name
        displayName
        color
        icon
        level
      }
      currentConditions {
        condition {
          type
          operator
          value
          valueMax
          description
        }
        currentValue
        requiredValue
        satisfied
        progress
      }
      nextMilestone {
        levelId
        levelName
        requirements {
          type
          description
          currentValue
          requiredValue
          remaining
        }
      }
    }
  }
`;

export const GET_MEMBER_LEVEL_STATS = gql`
  query GetMemberLevelStats($dateRange: DateRangeInput) {
    memberLevelStats(dateRange: $dateRange) {
      overview {
        totalLevels
        activeLevels
        totalMembers
        averageUpgradeTime
      }
      distribution {
        levelId
        levelName
        memberCount
        percentage
        averageOrderValue
        totalRevenue
      }
      upgradeTrend {
        date
        upgrades
        downgrades
        netChange
      }
      benefitUsage {
        benefitType
        benefitName
        usageCount
        savings
      }
      revenueImpact {
        levelId
        levelName
        revenue
        orderCount
        avgOrderValue
        discountAmount
        netRevenue
      }
    }
  }
`;

// ========================= 积分系统相关查询 =========================

export const GET_POINTS_RECORDS = gql`
  query GetPointsRecords($query: PointsRecordQueryInput!) {
    pointsRecords(query: $query) {
      items {
        id
        created
        updated
        userId
        username
        user {
          id
          profile {
            username
            avatar
            realName
          }
          level {
            name
            color
          }
        }
        type
        points
        balance
        reason
        description
        orderId
        productId
        ruleId
        exchangeId
        relatedId
        earnedAt
        spentAt
        expiredAt
        status
        isReversible
        source
        operatorId
        operatorName
        metadata
        tags
        rule {
          id
          name
          displayName
          type
          category
        }
      }
      pagination {
        page
        perPage
        totalItems
        totalPages
        hasNext
        hasPrev
      }
      stats {
        totalPoints
        earnedPoints
        spentPoints
        expiredPoints
        balancePoints
      }
    }
  }
`;

export const GET_USER_POINTS_OVERVIEW = gql`
  query GetUserPointsOverview($userId: String!) {
    userPointsOverview(userId: $userId) {
      userId
      username
      currentBalance
      totalEarned
      totalSpent
      totalExpired
      recentRecords {
        id
        type
        points
        balance
        reason
        description
        earnedAt
        spentAt
        status
        source
      }
      upcomingExpiry {
        points
        expiryDate
        daysRemaining
      }
      availableExchanges {
        id
        name
        displayName
        image
        pointsRequired
        exchangeType
        rewardValue
        stock
        status
      }
      recommendedExchanges {
        id
        name
        displayName
        image
        pointsRequired
        exchangeType
        rewardValue
        stock
        status
      }
      statistics {
        thisMonthEarned
        thisMonthSpent
        averageMonthlyEarned
        totalOrders
        averagePointsPerOrder
        membershipDuration
      }
    }
  }
`;

export const GET_POINTS_RULES = gql`
  query GetPointsRules($query: PointsRuleQueryInput!) {
    pointsRules(query: $query) {
      items {
        id
        created
        updated
        name
        displayName
        description
        type
        category
        points
        pointsMax
        conditions {
          id
          field
          operator
          value
          valueMax
          description
          weight
        }
        dailyLimit
        weeklyLimit
        monthlyLimit
        totalLimit
        userDailyLimit
        userTotalLimit
        startTime
        endTime
        validDays
        validHours
        isActive
        priority
        weight
        formula
        multiplier
        excludeUsers
        includeUsers
        usageCount
        totalPointsGranted
        lastUsedAt
        customConfig
        metadata
      }
      pagination {
        page
        perPage
        totalItems
        totalPages
        hasNext
        hasPrev
      }
      stats {
        totalRules
        activeRules
        totalUsage
        totalPointsGranted
      }
    }
  }
`;

export const GET_POINTS_EXCHANGES = gql`
  query GetPointsExchanges($query: PointsExchangeQueryInput!) {
    pointsExchanges(query: $query) {
      items {
        id
        created
        updated
        name
        displayName
        description
        subtitle
        image
        images
        category
        tags
        pointsRequired
        originalPrice
        exchangeType
        rewardValue
        rewardUnit
        rewardProductId
        rewardCouponId
        rewardConfig
        stock
        unlimitedStock
        virtualStock
        dailyStock
        userDailyLimit
        userTotalLimit
        status
        startTime
        endTime
        conditions {
          id
          type
          operator
          value
          description
          errorMessage
        }
        sortOrder
        isHot
        isNew
        isRecommended
        usedCount
        totalPointsSpent
        conversionRate
        rating
        reviewCount
        customConfig
        metadata
      }
      pagination {
        page
        perPage
        totalItems
        totalPages
        hasNext
        hasPrev
      }
      stats {
        totalExchanges
        activeExchanges
        totalStock
        totalExchanged
      }
      categories {
        category
        count
        totalStock
      }
    }
  }
`;

export const GET_POINTS_EXCHANGE_RECORDS = gql`
  query GetPointsExchangeRecords($query: PointsExchangeRecordQueryInput!) {
    pointsExchangeRecords(query: $query) {
      items {
        id
        created
        updated
        userId
        username
        exchangeId
        exchange {
          id
          name
          displayName
          image
          exchangeType
          rewardValue
          rewardUnit
        }
        pointsCost
        quantity
        totalPointsCost
        rewardType
        rewardValue
        rewardDescription
        status
        processedAt
        processedBy
        failureReason
        shippingAddress
        trackingNumber
        shippedAt
        deliveredAt
        notes
        metadata
      }
      pagination {
        page
        perPage
        totalItems
        totalPages
        hasNext
        hasPrev
      }
      stats {
        totalRecords
        completedRecords
        pendingRecords
        totalPointsSpent
      }
    }
  }
`;

export const GET_POINTS_STATS = gql`
  query GetPointsStats($dateRange: DateRangeInput) {
    pointsStats(dateRange: $dateRange) {
      overview {
        totalUsers
        totalPoints
        totalEarned
        totalSpent
        totalExpired
        totalFrozen
        averageBalance
      }
      typeDistribution {
        type
        count
        points
        percentage
      }
      rulePerformance {
        ruleId
        ruleName
        usageCount
        totalPoints
        averagePoints
        lastUsed
      }
      exchangeStats {
        exchangeId
        exchangeName
        totalExchanged
        totalPointsSpent
        conversionRate
        revenue
      }
      trendAnalysis {
        date
        earned
        spent
        expired
        balance
        activeUsers
      }
      userSegmentation {
        segment
        userCount
        averageBalance
        averageEarned
        averageSpent
        engagementRate
      }
    }
  }
`;

// ========================= 变更操作 =========================

export const CREATE_MEMBER = gql`
  mutation CreateMember($input: MemberCreateInput!) {
    createMember(input: $input) {
      id
      profile {
        username
        email
        phone
        realName
        nickname
      }
      level {
        name
        color
      }
      points
      balance
      status
      registerTime
    }
  }
`;

export const UPDATE_MEMBER = gql`
  mutation UpdateMember($id: ID!, $input: MemberUpdateInput!) {
    updateMember(id: $id, input: $input) {
      id
      profile {
        username
        email
        phone
        realName
        nickname
        avatar
        gender
        birthday
        bio
      }
      level {
        name
        color
      }
      points
      balance
      status
      updated
    }
  }
`;

export const DELETE_MEMBER = gql`
  mutation DeleteMember($id: ID!) {
    deleteMember(id: $id)
  }
`;

export const ACTIVATE_MEMBER = gql`
  mutation ActivateMember($id: ID!) {
    activateMember(id: $id)
  }
`;

export const DEACTIVATE_MEMBER = gql`
  mutation DeactivateMember($id: ID!) {
    deactivateMember(id: $id)
  }
`;

export const BAN_MEMBER = gql`
  mutation BanMember($id: ID!, $reason: String!) {
    banMember(id: $id, reason: $reason)
  }
`;

export const UNBAN_MEMBER = gql`
  mutation UnbanMember($id: ID!) {
    unbanMember(id: $id)
  }
`;

export const CREATE_MEMBER_LEVEL = gql`
  mutation CreateMemberLevel($input: MemberLevelCreateInput!) {
    createMemberLevel(input: $input) {
      id
      name
      displayName
      color
      icon
      level
      pointsRequired
      benefits {
        id
        type
        name
        description
        value
      }
      discountRate
      pointsRate
      freeShippingThreshold
      isActive
      isDefault
    }
  }
`;

export const UPDATE_MEMBER_LEVEL = gql`
  mutation UpdateMemberLevel($id: ID!, $input: MemberLevelUpdateInput!) {
    updateMemberLevel(id: $id, input: $input) {
      id
      name
      displayName
      color
      icon
      level
      pointsRequired
      benefits {
        id
        type
        name
        description
        value
      }
      discountRate
      pointsRate
      freeShippingThreshold
      isActive
      isDefault
      updated
    }
  }
`;

export const DELETE_MEMBER_LEVEL = gql`
  mutation DeleteMemberLevel($id: ID!) {
    deleteMemberLevel(id: $id)
  }
`;

export const UPGRADE_TO_LEVEL = gql`
  mutation UpgradeToLevel($memberId: String!, $levelId: String!, $reason: String) {
    upgradeToLevel(memberId: $memberId, levelId: $levelId, reason: $reason)
  }
`;

export const ADJUST_POINTS = gql`
  mutation AdjustPoints($input: PointsAdjustmentInput!) {
    adjustPoints(input: $input) {
      id
      userId
      username
      type
      points
      balance
      reason
      description
      earnedAt
      spentAt
      status
      source
      operatorName
    }
  }
`;

export const BATCH_ADJUST_POINTS = gql`
  mutation BatchAdjustPoints($inputs: [PointsAdjustmentInput!]!) {
    batchAdjustPoints(inputs: $inputs) {
      id
      userId
      username
      type
      points
      balance
      reason
      description
      status
      source
      operatorName
    }
  }
`;

export const FREEZE_POINTS = gql`
  mutation FreezePoints($userId: String!, $points: Int!, $reason: String!) {
    freezePoints(userId: $userId, points: $points, reason: $reason)
  }
`;

export const UNFREEZE_POINTS = gql`
  mutation UnfreezePoints($userId: String!, $points: Int!, $reason: String!) {
    unfreezePoints(userId: $userId, points: $points, reason: $reason)
  }
`;

export const CREATE_POINTS_RULE = gql`
  mutation CreatePointsRule($input: PointsRuleCreateInput!) {
    createPointsRule(input: $input) {
      id
      name
      displayName
      description
      type
      category
      points
      pointsMax
      conditions {
        field
        operator
        value
        description
      }
      dailyLimit
      weeklyLimit
      monthlyLimit
      userDailyLimit
      userTotalLimit
      startTime
      endTime
      isActive
      priority
      weight
    }
  }
`;

export const UPDATE_POINTS_RULE = gql`
  mutation UpdatePointsRule($id: ID!, $input: PointsRuleUpdateInput!) {
    updatePointsRule(id: $id, input: $input) {
      id
      name
      displayName
      description
      type
      category
      points
      pointsMax
      conditions {
        field
        operator
        value
        description
      }
      dailyLimit
      weeklyLimit
      monthlyLimit
      userDailyLimit
      userTotalLimit
      startTime
      endTime
      isActive
      priority
      weight
      updated
    }
  }
`;

export const DELETE_POINTS_RULE = gql`
  mutation DeletePointsRule($id: ID!) {
    deletePointsRule(id: $id)
  }
`;

export const CREATE_POINTS_EXCHANGE = gql`
  mutation CreatePointsExchange($input: PointsExchangeCreateInput!) {
    createPointsExchange(input: $input) {
      id
      name
      displayName
      description
      image
      category
      pointsRequired
      originalPrice
      exchangeType
      rewardValue
      rewardUnit
      stock
      unlimitedStock
      status
      startTime
      endTime
      sortOrder
      isHot
      isNew
      isRecommended
    }
  }
`;

export const UPDATE_POINTS_EXCHANGE = gql`
  mutation UpdatePointsExchange($id: ID!, $input: PointsExchangeUpdateInput!) {
    updatePointsExchange(id: $id, input: $input) {
      id
      name
      displayName
      description
      image
      category
      pointsRequired
      originalPrice
      exchangeType
      rewardValue
      rewardUnit
      stock
      unlimitedStock
      status
      startTime
      endTime
      sortOrder
      isHot
      isNew
      isRecommended
      updated
    }
  }
`;

export const DELETE_POINTS_EXCHANGE = gql`
  mutation DeletePointsExchange($id: ID!) {
    deletePointsExchange(id: $id)
  }
`;

export const EXCHANGE_POINTS = gql`
  mutation ExchangePoints($userId: String!, $input: PointsExchangeInput!) {
    exchangePoints(userId: $userId, input: $input) {
      id
      userId
      username
      exchangeId
      exchange {
        name
        displayName
        image
        exchangeType
      }
      pointsCost
      quantity
      totalPointsCost
      rewardType
      rewardValue
      rewardDescription
      status
      created
    }
  }
`;

export const PROCESS_EXCHANGE_RECORD = gql`
  mutation ProcessExchangeRecord($recordId: String!, $status: ExchangeRecordStatus!, $reason: String) {
    processExchangeRecord(recordId: $recordId, status: $status, reason: $reason) {
      id
      status
      processedAt
      processedBy
      failureReason
    }
  }
`;

// ========================= 批量操作 =========================

export const BATCH_UPDATE_MEMBERS = gql`
  mutation BatchUpdateMembers($ids: [ID!]!, $input: MemberUpdateInput!) {
    batchUpdateMembers(ids: $ids, input: $input)
  }
`;

export const BATCH_DELETE_MEMBERS = gql`
  mutation BatchDeleteMembers($ids: [ID!]!) {
    batchDeleteMembers(ids: $ids)
  }
`;

export const IMPORT_MEMBERS = gql`
  mutation ImportMembers($data: [JSON!]!) {
    importMembers(data: $data) {
      success
      total
      successful
      failed
      duplicates
      errors {
        row
        field
        message
        data
      }
      warnings {
        row
        field
        message
        data
      }
      summary {
        newMembers
        updatedMembers
        skippedMembers
      }
    }
  }
`;

// ========================= 地址管理相关查询 =========================

export const GET_ADDRESSES = gql`
  query GetAddresses($query: AddressQueryInput!) {
    addresses(query: $query) {
      items {
        id
        created
        updated
        userId
        user {
          id
          profile {
            username
            avatar
          }
        }
        name
        phone
        email
        province
        city
        district
        street
        address
        detailAddress
        postalCode
        longitude
        latitude
        locationAccuracy
        tag
        tagColor
        isDefault
        isActive
        isVerified
        verificationStatus
        verificationMethod
        verificationTime
        verificationDetails
        usageCount
        lastUsedAt
        orderCount
        source
        sourceDetails
        fullAddress
        coordinates {
          longitude
          latitude
        }
        customFields
        metadata
      }
      pagination {
        page
        perPage
        totalItems
        totalPages
        hasNext
        hasPrev
      }
      stats {
        totalAddresses
        defaultAddresses
        verifiedAddresses
        totalUsers
        averageAddressesPerUser
      }
      regions {
        region
        count
        percentage
      }
    }
  }
`;

export const GET_ADDRESS = gql`
  query GetAddress($id: ID!) {
    address(id: $id) {
      id
      created
      updated
      userId
      user {
        id
        profile {
          username
          avatar
          email
          phone
        }
      }
      name
      phone
      email
      province
      city
      district
      street
      address
      detailAddress
      postalCode
      longitude
      latitude
      locationAccuracy
      tag
      tagColor
      isDefault
      isActive
      isVerified
      verificationStatus
      verificationMethod
      verificationTime
      verificationDetails
      usageCount
      lastUsedAt
      orderCount
      source
      sourceDetails
      fullAddress
      coordinates {
        longitude
        latitude
      }
      customFields
      metadata
    }
  }
`;

export const GET_USER_ADDRESSES = gql`
  query GetUserAddresses($userId: String!) {
    userAddresses(userId: $userId) {
      id
      created
      updated
      name
      phone
      email
      province
      city
      district
      street
      address
      detailAddress
      postalCode
      longitude
      latitude
      tag
      tagColor
      isDefault
      isActive
      isVerified
      verificationStatus
      usageCount
      lastUsedAt
      orderCount
      source
      fullAddress
      coordinates {
        longitude
        latitude
      }
    }
  }
`;

export const GET_DEFAULT_ADDRESS = gql`
  query GetDefaultAddress($userId: String!) {
    defaultAddress(userId: $userId) {
      id
      name
      phone
      email
      province
      city
      district
      street
      address
      detailAddress
      postalCode
      tag
      tagColor
      isDefault
      fullAddress
      coordinates {
        longitude
        latitude
      }
    }
  }
`;

export const GET_ADDRESS_STATS = gql`
  query GetAddressStats($dateRange: DateRangeInput) {
    addressStats(dateRange: $dateRange) {
      overview {
        totalAddresses
        totalUsers
        verifiedAddresses
        defaultAddresses
        averageAddressesPerUser
        totalUsage
      }
      regionDistribution {
        province
        city
        district
        addressCount
        userCount
        percentage
        usageCount
      }
      tagDistribution {
        tag
        count
        percentage
        usageRate
      }
      usageAnalysis {
        date
        newAddresses
        totalUsage
        uniqueUsers
        verificationRate
      }
      qualityMetrics {
        verificationRate
        standardFormatRate
        duplicateRate
        coordinateAccuracy
        userSatisfactionScore
      }
    }
  }
`;

export const SEARCH_ADDRESSES = gql`
  query SearchAddresses($query: String!, $options: JSON) {
    searchAddresses(query: $query, options: $options) {
      id
      name
      phone
      province
      city
      district
      address
      fullAddress
      tag
      isDefault
      isActive
      user {
        id
        profile {
          username
          avatar
        }
      }
    }
  }
`;

export const SEARCH_NEARBY_ADDRESSES = gql`
  query SearchNearbyAddresses($longitude: Float!, $latitude: Float!, $radius: Int!) {
    searchNearbyAddresses(longitude: $longitude, latitude: $latitude, radius: $radius) {
      id
      name
      phone
      province
      city
      district
      address
      fullAddress
      longitude
      latitude
      locationAccuracy
      tag
      user {
        id
        profile {
          username
          avatar
        }
      }
    }
  }
`;

export const GET_ADDRESS_TEMPLATES = gql`
  query GetAddressTemplates($query: AddressTemplateQueryInput!) {
    addressTemplates(query: $query) {
      items {
        id
        created
        updated
        name
        description
        template
        type
        category
        usageCount
        popularityScore
        isActive
        isPublic
        createdBy
        metadata
      }
      pagination {
        page
        perPage
        totalItems
        totalPages
        hasNext
        hasPrev
      }
      stats {
        totalTemplates
        systemTemplates
        customTemplates
        popularTemplates
        totalUsage
      }
      categories {
        category
        count
        totalUsage
      }
    }
  }
`;

export const GET_POPULAR_TEMPLATES = gql`
  query GetPopularTemplates($limit: Int) {
    popularTemplates(limit: $limit) {
      id
      name
      description
      template
      type
      category
      usageCount
      popularityScore
      isActive
    }
  }
`;

export const GET_REGIONS = gql`
  query GetRegions($query: RegionQueryInput!) {
    regions(query: $query) {
      items {
        id
        created
        updated
        code
        name
        fullName
        shortName
        englishName
        level
        parentId
        parentPath
        longitude
        latitude
        boundaryData
        isActive
        isHot
        sortOrder
        metadata
      }
      pagination {
        page
        perPage
        totalItems
        totalPages
        hasNext
        hasPrev
      }
      stats {
        totalRegions
        activeRegions
        hotRegions
        maxLevel
      }
      tree {
        id
        code
        name
        fullName
        level
        parentId
        isActive
        isHot
        children {
          id
          code
          name
          fullName
          level
          parentId
          isActive
          isHot
          hasChildren
          childrenCount
        }
        hasChildren
        childrenCount
      }
    }
  }
`;

export const GET_REGION_TREE = gql`
  query GetRegionTree($parentId: String, $maxDepth: Int) {
    regionTree(parentId: $parentId, maxDepth: $maxDepth) {
      id
      code
      name
      fullName
      level
      parentId
      isActive
      isHot
      children {
        id
        code
        name
        fullName
        level
        parentId
        isActive
        isHot
        children {
          id
          code
          name
          fullName
          level
          parentId
          isActive
          isHot
          hasChildren
          childrenCount
        }
        hasChildren
        childrenCount
      }
      hasChildren
      childrenCount
    }
  }
`;

export const SEARCH_REGIONS = gql`
  query SearchRegions($keyword: String!) {
    searchRegions(keyword: $keyword) {
      id
      code
      name
      fullName
      level
      parentId
      parentPath
      isActive
      isHot
    }
  }
`;

export const GET_ADDRESS_USAGE_RECORDS = gql`
  query GetAddressUsageRecords($query: AddressUsageRecordQueryInput!) {
    addressUsageRecords(query: $query) {
      items {
        id
        created
        updated
        addressId
        userId
        usageType
        orderId
        addressSnapshot
        result
        resultDetails
        metadata
      }
      pagination {
        page
        perPage
        totalItems
        totalPages
        hasNext
        hasPrev
      }
      stats {
        totalRecords
        successfulUsage
        failedUsage
        averageUsagePerAddress
      }
    }
  }
`;

// ========================= 地址管理相关变更 =========================

export const CREATE_ADDRESS = gql`
  mutation CreateAddress($userId: String!, $input: AddressCreateInput!) {
    createAddress(userId: $userId, input: $input) {
      id
      created
      updated
      name
      phone
      email
      province
      city
      district
      street
      address
      detailAddress
      postalCode
      longitude
      latitude
      tag
      tagColor
      isDefault
      isActive
      isVerified
      verificationStatus
      usageCount
      orderCount
      source
      fullAddress
      coordinates {
        longitude
        latitude
      }
    }
  }
`;

export const UPDATE_ADDRESS = gql`
  mutation UpdateAddress($id: ID!, $input: AddressUpdateInput!) {
    updateAddress(id: $id, input: $input) {
      id
      updated
      name
      phone
      email
      province
      city
      district
      street
      address
      detailAddress
      postalCode
      longitude
      latitude
      tag
      tagColor
      isDefault
      isActive
      fullAddress
      coordinates {
        longitude
        latitude
      }
    }
  }
`;

export const DELETE_ADDRESS = gql`
  mutation DeleteAddress($id: ID!) {
    deleteAddress(id: $id)
  }
`;

export const SET_DEFAULT_ADDRESS = gql`
  mutation SetDefaultAddress($userId: String!, $addressId: String!) {
    setDefaultAddress(userId: $userId, addressId: $addressId)
  }
`;

export const CLEAR_DEFAULT_ADDRESS = gql`
  mutation ClearDefaultAddress($userId: String!) {
    clearDefaultAddress(userId: $userId)
  }
`;

export const VALIDATE_ADDRESS = gql`
  mutation ValidateAddress($input: AddressValidationInput!) {
    validateAddress(input: $input) {
      isValid
      confidence
      details {
        provinceValid
        cityValid
        districtValid
        streetValid
        postalCodeValid
        coordinatesValid
      }
      suggestions {
        field
        originalValue
        suggestedValue
        confidence
        reason
      }
      standardizedAddress
      errors
      warnings
      validationMethod
      validationTime
      provider
    }
  }
`;

export const BATCH_VALIDATE_ADDRESSES = gql`
  mutation BatchValidateAddresses($inputs: [AddressValidationInput!]!) {
    batchValidateAddresses(inputs: $inputs) {
      isValid
      confidence
      details {
        provinceValid
        cityValid
        districtValid
        streetValid
        postalCodeValid
        coordinatesValid
      }
      suggestions {
        field
        originalValue
        suggestedValue
        confidence
        reason
      }
      standardizedAddress
      errors
      warnings
      validationMethod
      validationTime
      provider
    }
  }
`;

export const STANDARDIZE_ADDRESS = gql`
  mutation StandardizeAddress($address: JSON!) {
    standardizeAddress(address: $address)
  }
`;

export const CREATE_ADDRESS_TEMPLATE = gql`
  mutation CreateAddressTemplate($input: AddressTemplateCreateInput!) {
    createAddressTemplate(input: $input) {
      id
      created
      name
      description
      template
      type
      category
      usageCount
      popularityScore
      isActive
      isPublic
      createdBy
      metadata
    }
  }
`;

export const UPDATE_ADDRESS_TEMPLATE = gql`
  mutation UpdateAddressTemplate($id: ID!, $input: AddressTemplateUpdateInput!) {
    updateAddressTemplate(id: $id, input: $input) {
      id
      updated
      name
      description
      template
      type
      category
      isActive
      isPublic
      metadata
    }
  }
`;

export const DELETE_ADDRESS_TEMPLATE = gql`
  mutation DeleteAddressTemplate($id: ID!) {
    deleteAddressTemplate(id: $id)
  }
`;

export const RECORD_ADDRESS_USAGE = gql`
  mutation RecordAddressUsage($addressId: String!, $usageType: AddressUsageType!, $options: JSON) {
    recordAddressUsage(addressId: $addressId, usageType: $usageType, options: $options) {
      id
      created
      addressId
      userId
      usageType
      orderId
      result
      resultDetails
    }
  }
`;

export const BATCH_CREATE_ADDRESSES = gql`
  mutation BatchCreateAddresses($addresses: [JSON!]!) {
    batchCreateAddresses(addresses: $addresses)
  }
`;

export const BATCH_UPDATE_ADDRESSES = gql`
  mutation BatchUpdateAddresses($updates: [JSON!]!) {
    batchUpdateAddresses(updates: $updates)
  }
`;

export const BATCH_DELETE_ADDRESSES = gql`
  mutation BatchDeleteAddresses($ids: [ID!]!) {
    batchDeleteAddresses(ids: $ids)
  }
`;

export const IMPORT_ADDRESSES = gql`
  mutation ImportAddresses($input: AddressImportInput!) {
    importAddresses(input: $input) {
      success
      total
      successful
      failed
      duplicates
      errors {
        row
        address
        error
        suggestions
      }
      summary {
        newAddresses
        updatedAddresses
        skippedAddresses
        validatedAddresses
      }
      validationResults {
        isValid
        confidence
        errors
        warnings
      }
    }
  }
`;

export const CLEANUP_DUPLICATE_ADDRESSES = gql`
  mutation CleanupDuplicateAddresses($userId: String) {
    cleanupDuplicateAddresses(userId: $userId)
  }
`;

export const CLEANUP_INVALID_ADDRESSES = gql`
  mutation CleanupInvalidAddresses {
    cleanupInvalidAddresses
  }
`;

export const UPDATE_ADDRESS_COORDINATES = gql`
  mutation UpdateAddressCoordinates($addressId: String!) {
    updateAddressCoordinates(addressId: $addressId)
  }
`;

// ========================= 标签管理相关查询 =========================

export const GET_MEMBER_TAGS = gql`
  query GetMemberTags($query: MemberTagQueryInput!) {
    memberTags(query: $query) {
      items {
        id
        created
        updated
        name
        displayName
        description
        type
        category
        subcategory
        groupId
        group {
          id
          name
          displayName
          color
        }
        color
        backgroundColor
        icon
        priority
        isSystem
        isAutoAssigned
        isVisible
        isActive
        autoRules {
          id
          type
          condition
          params
          description
          isActive
        }
        memberCount
        usageCount
        businessValue
        conversionRate
        averageOrderValue
        validityPeriod
        lastUpdated
        metadata
        customProperties
      }
      pagination {
        page
        perPage
        totalItems
        totalPages
        hasNext
        hasPrev
      }
      stats {
        totalTags
        systemTags
        customTags
        autoAssignedTags
        totalMembers
        averageTagsPerMember
      }
      categories {
        category
        count
        subcategories {
          subcategory
          count
        }
      }
    }
  }
`;

export const GET_MEMBER_TAG = gql`
  query GetMemberTag($id: ID!) {
    memberTag(id: $id) {
      id
      created
      updated
      name
      displayName
      description
      type
      category
      subcategory
      groupId
      group {
        id
        name
        displayName
        description
        color
        icon
        priority
        isSystem
        isActive
      }
      color
      backgroundColor
      icon
      priority
      isSystem
      isAutoAssigned
      isVisible
      isActive
      autoRules {
        id
        type
        condition
        params
        description
        isActive
      }
      memberCount
      usageCount
      businessValue
      conversionRate
      averageOrderValue
      validityPeriod
      lastUpdated
      metadata
      customProperties
    }
  }
`;

export const GET_MEMBER_TAG_BY_NAME = gql`
  query GetMemberTagByName($name: String!) {
    memberTagByName(name: $name) {
      id
      name
      displayName
      description
      type
      category
      color
      memberCount
      isActive
    }
  }
`;

export const GET_TAG_GROUPS = gql`
  query GetTagGroups($query: TagGroupQueryInput!) {
    tagGroups(query: $query) {
      items {
        id
        created
        updated
        name
        displayName
        description
        color
        icon
        priority
        isSystem
        isActive
        tags {
          id
          name
          displayName
          type
          category
          color
          memberCount
          isActive
        }
        tagCount
        maxTagsPerMember
        exclusiveMode
        memberCount
        metadata
      }
      pagination {
        page
        perPage
        totalItems
        totalPages
        hasNext
        hasPrev
      }
      stats {
        totalGroups
        systemGroups
        customGroups
        totalTags
        averageTagsPerGroup
      }
    }
  }
`;

export const GET_TAG_GROUP = gql`
  query GetTagGroup($id: ID!) {
    tagGroup(id: $id) {
      id
      created
      updated
      name
      displayName
      description
      color
      icon
      priority
      isSystem
      isActive
      tags {
        id
        name
        displayName
        description
        type
        category
        color
        backgroundColor
        icon
        memberCount
        isActive
      }
      tagCount
      maxTagsPerMember
      exclusiveMode
      memberCount
      metadata
    }
  }
`;

export const GET_MEMBER_TAG_RELATIONS = gql`
  query GetMemberTagRelations($query: MemberTagRelationQueryInput!) {
    memberTagRelations(query: $query) {
      items {
        id
        created
        updated
        memberId
        tagId
        member {
          id
          profile {
            username
            avatar
            realName
          }
        }
        tag {
          id
          name
          displayName
          type
          category
          color
          backgroundColor
          icon
        }
        assignedBy
        assignedByUserId
        assignedReason
        assignedSource
        assignedAt
        expiresAt
        lastUpdated
        value
        properties
        isActive
        confidence
      }
      pagination {
        page
        perPage
        totalItems
        totalPages
        hasNext
        hasPrev
      }
      stats {
        totalRelations
        activeRelations
        systemAssigned
        manualAssigned
        averageConfidence
      }
    }
  }
`;

export const GET_MEMBER_TAGS_BY_MEMBER = gql`
  query GetMemberTags($memberId: String!) {
    getMemberTags(memberId: $memberId) {
      id
      tagId
      tag {
        id
        name
        displayName
        type
        category
        color
        backgroundColor
        icon
      }
      assignedBy
      assignedAt
      expiresAt
      value
      confidence
      isActive
    }
  }
`;

export const GET_MEMBER_TAGS_BY_CATEGORY = gql`
  query GetMemberTagsByCategory($memberId: String!, $category: String!) {
    getMemberTagsByCategory(memberId: $memberId, category: $category) {
      id
      tagId
      tag {
        id
        name
        displayName
        type
        category
        color
        icon
      }
      assignedBy
      assignedAt
      value
      confidence
      isActive
    }
  }
`;

export const GET_TAG_ANALYSIS = gql`
  query GetTagAnalysis($dateRange: DateRangeInput) {
    tagAnalysis(dateRange: $dateRange) {
      overview {
        totalTags
        totalRelations
        averageTagsPerMember
        mostUsedTags {
          tagId
          tagName
          memberCount
          usageRate
        }
      }
      categoryDistribution {
        category
        tagCount
        memberCount
        percentage
      }
      tagPerformance {
        tagId
        tagName
        memberCount
        conversionRate
        averageOrderValue
        businessValue
        roi
      }
      memberSegmentation {
        segment
        description
        memberCount
        tags
        characteristics
      }
      trendAnalysis {
        date
        newTags
        newRelations
        expiredRelations
        netGrowth
      }
      recommendations {
        type
        description
        priority
        impact
        data
      }
    }
  }
`;

export const GET_MEMBER_TAG_PROFILE = gql`
  query GetMemberTagProfile($memberId: String!) {
    memberTagProfile(memberId: $memberId) {
      memberId
      totalTags
      activeTags
      tagsByCategory {
        category
        tags {
          tagId
          tagName
          value
          confidence
          assignedAt
          expiresAt
        }
      }
      behaviorTags {
        id
        tag {
          id
          name
          displayName
          color
        }
        assignedAt
        confidence
      }
      demographicTags {
        id
        tag {
          id
          name
          displayName
          color
        }
        assignedAt
        confidence
      }
      transactionTags {
        id
        tag {
          id
          name
          displayName
          color
        }
        assignedAt
        confidence
      }
      customTags {
        id
        tag {
          id
          name
          displayName
          color
        }
        assignedAt
        confidence
      }
      segmentInfo {
        primarySegment
        secondarySegments
        confidence
      }
      recommendations {
        type
        title
        description
        priority
        basedOnTags
      }
      riskFactors {
        factor
        level
        description
        relatedTags
      }
    }
  }
`;

export const SUGGEST_TAGS_FOR_MEMBER = gql`
  query SuggestTagsForMember($memberId: String!) {
    suggestTagsForMember(memberId: $memberId) {
      tag {
        id
        name
        displayName
        description
        type
        category
        color
        icon
      }
      confidence
      reason
    }
  }
`;

export const SUGGEST_MEMBERS_FOR_TAG = gql`
  query SuggestMembersForTag($tagId: String!) {
    suggestMembersForTag(tagId: $tagId) {
      memberId
      confidence
      reason
    }
  }
`;

export const FIND_SIMILAR_MEMBERS = gql`
  query FindSimilarMembers($memberId: String!, $limit: Int) {
    findSimilarMembers(memberId: $memberId, limit: $limit) {
      memberId
      similarity
      commonTags
    }
  }
`;

export const TEST_TAG_RULE = gql`
  query TestTagRule($rule: TagRuleInput!, $memberId: String!) {
    testTagRule(rule: $rule, memberId: $memberId) {
      matches
      confidence
      details
    }
  }
`;

export const GET_TAG_PERFORMANCE = gql`
  query GetTagPerformance($tagId: String!) {
    tagPerformance(tagId: $tagId)
  }
`;

export const GET_TAG_SEGMENT_ANALYSIS = gql`
  query GetTagSegmentAnalysis {
    tagSegmentAnalysis
  }
`;

// ========================= 标签管理相关变更 =========================

export const CREATE_MEMBER_TAG = gql`
  mutation CreateMemberTag($input: MemberTagCreateInput!) {
    createMemberTag(input: $input) {
      id
      created
      name
      displayName
      description
      type
      category
      subcategory
      color
      backgroundColor
      icon
      priority
      isSystem
      isAutoAssigned
      isVisible
      isActive
      autoRules {
        id
        type
        condition
        params
        description
        isActive
      }
      memberCount
      usageCount
      businessValue
      validityPeriod
      metadata
      customProperties
    }
  }
`;

export const UPDATE_MEMBER_TAG = gql`
  mutation UpdateMemberTag($id: ID!, $input: MemberTagUpdateInput!) {
    updateMemberTag(id: $id, input: $input) {
      id
      updated
      name
      displayName
      description
      type
      category
      subcategory
      color
      backgroundColor
      icon
      priority
      isAutoAssigned
      isVisible
      isActive
      autoRules {
        id
        type
        condition
        params
        description
        isActive
      }
      businessValue
      validityPeriod
      metadata
      customProperties
    }
  }
`;

export const DELETE_MEMBER_TAG = gql`
  mutation DeleteMemberTag($id: ID!) {
    deleteMemberTag(id: $id)
  }
`;

export const CREATE_TAG_GROUP = gql`
  mutation CreateTagGroup($input: TagGroupCreateInput!) {
    createTagGroup(input: $input) {
      id
      created
      name
      displayName
      description
      color
      icon
      priority
      isSystem
      isActive
      maxTagsPerMember
      exclusiveMode
      tagCount
      memberCount
      metadata
    }
  }
`;

export const UPDATE_TAG_GROUP = gql`
  mutation UpdateTagGroup($id: ID!, $input: TagGroupUpdateInput!) {
    updateTagGroup(id: $id, input: $input) {
      id
      updated
      name
      displayName
      description
      color
      icon
      priority
      isActive
      maxTagsPerMember
      exclusiveMode
      metadata
    }
  }
`;

export const DELETE_TAG_GROUP = gql`
  mutation DeleteTagGroup($id: ID!) {
    deleteTagGroup(id: $id)
  }
`;

export const ASSIGN_TAGS = gql`
  mutation AssignTags($input: MemberTagAssignInput!) {
    assignTags(input: $input) {
      id
      memberId
      tagId
      tag {
        id
        name
        displayName
        color
      }
      assignedBy
      assignedAt
      assignedReason
      value
      confidence
      isActive
    }
  }
`;

export const REMOVE_TAGS = gql`
  mutation RemoveTags($memberIds: [String!]!, $tagIds: [String!]!) {
    removeTags(memberIds: $memberIds, tagIds: $tagIds)
  }
`;

export const ADD_TAG_TO_MEMBER = gql`
  mutation AddTagToMember($memberId: String!, $tagId: String!, $options: JSON) {
    addTagToMember(memberId: $memberId, tagId: $tagId, options: $options) {
      id
      memberId
      tagId
      tag {
        id
        name
        displayName
        color
      }
      assignedBy
      assignedAt
      assignedReason
      value
      confidence
      isActive
    }
  }
`;

export const REMOVE_TAG_FROM_MEMBER = gql`
  mutation RemoveTagFromMember($memberId: String!, $tagId: String!) {
    removeTagFromMember(memberId: $memberId, tagId: $tagId)
  }
`;

export const EVALUATE_TAG_RULES = gql`
  mutation EvaluateTagRules($memberId: String!) {
    evaluateTagRules(memberId: $memberId) {
      id
      tagId
      tag {
        id
        name
        displayName
        color
      }
      assignedBy
      assignedAt
      confidence
      isActive
    }
  }
`;

export const PROCESS_AUTO_TAGGING = gql`
  mutation ProcessAutoTagging {
    processAutoTagging {
      processed
      assigned
      removed
    }
  }
`;

export const BATCH_ASSIGN_TAGS = gql`
  mutation BatchAssignTags($input: TagBatchOperationInput!) {
    batchAssignTags(input: $input)
  }
`;

export const BATCH_REMOVE_TAGS = gql`
  mutation BatchRemoveTags($memberIds: [String!]!, $tagIds: [String!]!) {
    batchRemoveTags(memberIds: $memberIds, tagIds: $tagIds)
  }
`;

export const BATCH_UPDATE_TAG_RELATIONS = gql`
  mutation BatchUpdateTagRelations($relations: [JSON!]!) {
    batchUpdateTagRelations(relations: $relations)
  }
`;

// ========================= 系统设置相关查询 =========================

export const GET_SYSTEM_SETTINGS = gql`
  query GetSystemSettings($query: SettingQueryInput) {
    systemSettings(query: $query) {
      items {
        id
        key
        name
        description
        value
        default_value
        type
        category
        scope
        is_public
        is_readonly
        validation_rules
        options
        order_index
        group_name
        icon
        created
        updated
        updated_by
      }
      pagination {
        page
        perPage
        totalItems
        totalPages
        hasNext
        hasPrev
      }
    }
  }
`;

export const GET_SYSTEM_SETTING = gql`
  query GetSystemSetting($key: String!) {
    systemSetting(key: $key) {
      id
      key
      name
      description
      value
      default_value
      type
      category
      scope
      is_public
      is_readonly
      validation_rules
      options
      order_index
      group_name
      icon
      created
      updated
      updated_by
    }
  }
`;

export const GET_SETTINGS_BY_CATEGORY = gql`
  query GetSettingsByCategory($category: SettingCategory!) {
    settingsByCategory(category: $category) {
      id
      key
      name
      description
      value
      default_value
      type
      category
      scope
      is_public
      is_readonly
      validation_rules
      options
      order_index
      group_name
      icon
      created
      updated
      updated_by
    }
  }
`;

export const GET_SETTINGS_GROUPS = gql`
  query GetSettingsGroups {
    settingsGroups {
      category
      name
      description
      icon
      count
      settings {
        id
        key
        name
        description
        value
        type
        is_readonly
        validation_rules
        options
        order_index
        icon
      }
    }
  }
`;

export const GET_PUBLIC_SETTINGS = gql`
  query GetPublicSettings {
    publicSettings {
      id
      key
      name
      description
      value
      type
      category
      scope
      validation_rules
      options
      order_index
      group_name
      icon
    }
  }
`;

export const GET_ORDER_SETTINGS = gql`
  query GetOrderSettings {
    orderSettings {
      id
      setting_key
      setting_name
      setting_value
      setting_type
      description
      category
      created
      updated
    }
  }
`;

export const GET_ORDER_SETTING = gql`
  query GetOrderSetting($key: String!) {
    orderSetting(key: $key) {
      id
      setting_key
      setting_name
      setting_value
      setting_type
      description
      category
      created
      updated
    }
  }
`;

export const GET_PAYMENT_SETTINGS = gql`
  query GetPaymentSettings {
    paymentSettings {
      id
      provider
      name
      config
      is_enabled
      is_sandbox
      supported_currencies
      webhook_url
      created
      updated
    }
  }
`;

export const GET_NOTIFICATION_SETTINGS = gql`
  query GetNotificationSettings {
    notificationSettings {
      id
      type
      channel
      template
      is_enabled
      config
      created
      updated
    }
  }
`;

export const SEARCH_SETTINGS = gql`
  query SearchSettings($keyword: String!, $limit: Int = 10) {
    searchSettings(keyword: $keyword, limit: $limit) {
      id
      key
      name
      description
      value
      type
      category
      scope
      is_public
      icon
    }
  }
`;

export const VALIDATE_SETTING = gql`
  query ValidateSetting($key: String!, $value: String!) {
    validateSetting(key: $key, value: $value) {
      is_valid
      errors
      warnings
    }
  }
`;

// ========================= 系统设置相关变更 =========================

export const CREATE_SYSTEM_SETTING = gql`
  mutation CreateSystemSetting($input: SettingInput!) {
    createSystemSetting(input: $input) {
      id
      key
      name
      description
      value
      default_value
      type
      category
      scope
      is_public
      is_readonly
      validation_rules
      options
      order_index
      group_name
      icon
      created
      updated
      updated_by
    }
  }
`;

export const UPDATE_SYSTEM_SETTING = gql`
  mutation UpdateSystemSetting($key: String!, $input: SettingUpdateInput!) {
    updateSystemSetting(key: $key, input: $input) {
      id
      key
      name
      description
      value
      default_value
      type
      category
      scope
      is_public
      is_readonly
      validation_rules
      options
      order_index
      group_name
      icon
      created
      updated
      updated_by
    }
  }
`;

export const DELETE_SYSTEM_SETTING = gql`
  mutation DeleteSystemSetting($key: String!) {
    deleteSystemSetting(key: $key) {
      success
      message
    }
  }
`;

export const BATCH_UPDATE_SETTINGS = gql`
  mutation BatchUpdateSettings($input: BatchSettingUpdateInput!) {
    batchUpdateSettings(input: $input) {
      total
      successful
      failed
      errors
    }
  }
`;

export const RESET_SETTING_TO_DEFAULT = gql`
  mutation ResetSettingToDefault($key: String!) {
    resetSettingToDefault(key: $key) {
      id
      key
      name
      value
      default_value
      type
      updated
    }
  }
`;

export const UPDATE_ORDER_SETTING = gql`
  mutation UpdateOrderSetting($id: ID!, $value: String!) {
    updateOrderSetting(id: $id, value: $value) {
      id
      setting_key
      setting_name
      setting_value
      setting_type
      updated
    }
  }
`;

export const CREATE_PAYMENT_SETTING = gql`
  mutation CreatePaymentSetting($input: PaymentSettingInput!) {
    createPaymentSetting(input: $input) {
      id
      provider
      name
      config
      is_enabled
      is_sandbox
      supported_currencies
      webhook_url
      created
      updated
    }
  }
`;

export const UPDATE_PAYMENT_SETTING = gql`
  mutation UpdatePaymentSetting($id: ID!, $input: PaymentSettingInput!) {
    updatePaymentSetting(id: $id, input: $input) {
      id
      provider
      name
      config
      is_enabled
      is_sandbox
      supported_currencies
      webhook_url
      updated
    }
  }
`;

export const CREATE_NOTIFICATION_SETTING = gql`
  mutation CreateNotificationSetting($input: NotificationSettingInput!) {
    createNotificationSetting(input: $input) {
      id
      type
      channel
      template
      is_enabled
      config
      created
      updated
    }
  }
`;

export const UPDATE_NOTIFICATION_SETTING = gql`
  mutation UpdateNotificationSetting($id: ID!, $input: NotificationSettingInput!) {
    updateNotificationSetting(id: $id, input: $input) {
      id
      type
      channel
      template
      is_enabled
      config
      updated
    }
  }
`;

export const IMPORT_SETTINGS = gql`
  mutation ImportSettings($data: JSON!) {
    importSettings(data: $data) {
      total
      successful
      failed
      errors
    }
  }
`;

export const EXPORT_SETTINGS = gql`
  mutation ExportSettings($categories: [SettingCategory!]) {
    exportSettings(categories: $categories)
  }
`;

export const CLEAR_SETTINGS_CACHE = gql`
  mutation ClearSettingsCache {
    clearSettingsCache {
      success
      message
    }
  }
`; 