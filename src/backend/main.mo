import Map "mo:core/Map";
import Array "mo:core/Array";
import List "mo:core/List";
import Time "mo:core/Time";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // User Profile Type as required by frontend
  public type UserProfile = {
    name : Text;
    email : Text;
    phone : Text;
    joinDate : Time.Time;
    status : Text; // "ACTIVE", "INACTIVE", "SUSPENDED"
    referralCode : Text;
    referredBy : ?Principal;
  };

  type Product = {
    id : Nat;
    name : Text;
    description : Text;
    price : Nat;
    category : Text;
    createdAt : Time.Time;
    updatedAt : Time.Time;
  };

  type Order = {
    id : Nat;
    productId : Nat;
    associate : Principal;
    quantity : Nat;
    totalAmount : Nat;
    orderDate : Time.Time;
    status : Text; // "PENDING", "DELIVERED", "CANCELLED"
  };

  type Commission = {
    id : Nat;
    associate : Principal;
    orderId : Nat;
    amount : Nat;
    level : Nat; // 1 for direct, 2 for level 2, etc.
    timestamp : Time.Time;
  };

  type ReferralBonus = {
    id : Nat;
    associate : Principal;
    referralBy : Principal;
    amount : Nat;
    level : Nat; // Level 1-7 (fixed amounts)
    timestamp : Time.Time;
  };

  type PayoutRequest = {
    id : Nat;
    associate : Principal;
    amount : Nat;
    requestDate : Time.Time;
    status : Text; // "PENDING", "APPROVED", "REJECTED", "PAID"
    processedBy : ?Principal;
    processedDate : ?Time.Time;
  };

  type Wallet = {
    balance : Nat;
    totalEarned : Nat;
    totalWithdrawn : Nat;
    lastUpdated : Time.Time;
  };

  type Referral = {
    referrer : Principal;
    referee : Principal;
    timestamp : Time.Time;
  };

  type FixedReferralBonusSummary = {
    totalBonuses : Nat;
    totalAmount : Nat;
    level1Count : Nat;
    level2Count : Nat;
    level3Count : Nat;
    level4Count : Nat;
    level5Count : Nat;
    level6Count : Nat;
    level7Count : Nat;
    totalLevel1Amount : Nat;
    totalLevel2Amount : Nat;
    totalLevel3Amount : Nat;
    totalLevel4Amount : Nat;
    totalLevel5Amount : Nat;
    totalLevel6Amount : Nat;
    totalLevel7Amount : Nat;
    lastUpdated : Time.Time;
  };

  // Persistent storage
  let userProfiles = Map.empty<Principal, UserProfile>();
  let products = Map.empty<Nat, Product>();
  let orders = Map.empty<Nat, Order>();
  let wallets = Map.empty<Principal, Wallet>();
  let commissions = Map.empty<Nat, Commission>();
  let payoutRequests = Map.empty<Nat, PayoutRequest>();
  let referrals = Map.empty<Principal, Referral>(); // referee -> referral info
  let referralCodes = Map.empty<Text, Principal>(); // code -> principal
  let referralBonuses = Map.empty<Nat, ReferralBonus>();
  let idProduct = Map.empty<Nat, ()>();

  // Counters
  var nextProductId = 1 : Nat;
  var nextOrderId = 1 : Nat;
  var nextCommissionId = 1 : Nat;
  var nextPayoutRequestId = 1 : Nat;
  var nextReferralBonusId = 1 : Nat;

  // ============ USER PROFILE MANAGEMENT ============

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };

    // Validate referral code uniqueness
    switch (referralCodes.get(profile.referralCode)) {
      case (?existingOwner) {
        if (existingOwner != caller) {
          Runtime.trap("Referral code already in use");
        };
      };
      case (null) {
        referralCodes.add(profile.referralCode, caller);
      };
    };

    userProfiles.add(caller, profile);
  };

  // ============ REFERRAL SYSTEM ============

  public shared ({ caller }) func registerWithReferral(profile : UserProfile, referrerCode : Text) : async () {
    // Allow guests/anonymous users to register - no permission check needed
    // This is the entry point for new users

    // Check if already registered
    switch (userProfiles.get(caller)) {
      case (?_) { Runtime.trap("Already registered") };
      case (null) {};
    };

    // Find referrer
    let referrer = switch (referralCodes.get(referrerCode)) {
      case (null) { Runtime.trap("Invalid referral code") };
      case (?principal) { principal };
    };

    // Validate referral code uniqueness for new user
    switch (referralCodes.get(profile.referralCode)) {
      case (?_) { Runtime.trap("Referral code already in use") };
      case (null) {
        referralCodes.add(profile.referralCode, caller);
      };
    };

    // Create profile with referrer
    let newProfile : UserProfile = {
      name = profile.name;
      email = profile.email;
      phone = profile.phone;
      joinDate = Time.now();
      status = "ACTIVE";
      referralCode = profile.referralCode;
      referredBy = ?referrer;
    };
    userProfiles.add(caller, newProfile);

    // Record referral relationship
    let referralRecord : Referral = {
      referrer;
      referee = caller;
      timestamp = Time.now();
    };
    referrals.add(caller, referralRecord);
  };

  public query ({ caller }) func getDirectReferrals() : async [Principal] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view referrals");
    };

    let results = List.empty<Principal>();
    for ((referee, referral) in referrals.entries()) {
      if (referral.referrer == caller) {
        results.add(referee);
      };
    };
    results.toArray();
  };

  public query ({ caller }) func getDownlineStructure() : async {
    level1 : [Principal];
    level2 : [Principal];
    level1Count : Nat;
    level2Count : Nat;
  } {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view downline");
    };

    let level1List = List.empty<Principal>();
    let level2List = List.empty<Principal>();

    // Get level 1 (direct referrals)
    for ((referee, referral) in referrals.entries()) {
      if (referral.referrer == caller) {
        level1List.add(referee);
      };
    };

    let level1Array = level1List.toArray();

    // Get level 2 (referrals of direct referrals)
    for (level1Member in level1Array.vals()) {
      for ((referee, referral) in referrals.entries()) {
        if (referral.referrer == level1Member) {
          level2List.add(referee);
        };
      };
    };

    let level2Array = level2List.toArray();

    {
      level1 = level1Array;
      level2 = level2Array;
      level1Count = level1Array.size();
      level2Count = level2Array.size();
    };
  };

  // ============ PRODUCT CATALOG ============

  public shared ({ caller }) func createProduct(name : Text, desc : Text, price : Nat, category : Text) : async Product {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can create products");
    };

    let product : Product = {
      id = nextProductId;
      name;
      description = desc;
      price;
      category;
      createdAt = Time.now();
      updatedAt = Time.now();
    };
    products.add(nextProductId, product);
    nextProductId += 1;
    product;
  };

  public shared ({ caller }) func updateProduct(productId : Nat, name : Text, desc : Text, price : Nat, category : Text) : async Product {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can update products");
    };

    switch (products.get(productId)) {
      case (null) { Runtime.trap("Product not found") };
      case (?existing) {
        let updated : Product = {
          id = productId;
          name;
          description = desc;
          price;
          category;
          createdAt = existing.createdAt;
          updatedAt = Time.now();
        };
        products.add(productId, updated);
        updated;
      };
    };
  };

  public query ({ caller }) func getProduct(productId : Nat) : async Product {
    // Allow anyone including guests to view products for marketing purposes
    // No authorization check needed

    switch (products.get(productId)) {
      case (null) { Runtime.trap("Product not found") };
      case (?product) { product };
    };
  };

  public query ({ caller }) func getAllProducts() : async [Product] {
    // Allow anyone including guests to view products for marketing purposes
    // No authorization check needed

    products.values().toArray();
  };

  public query ({ caller }) func getProductsByCategory(category : Text) : async [Product] {
    // Allow anyone including guests to view products for marketing purposes
    // No authorization check needed

    let results = List.empty<Product>();
    for ((_, product) in products.entries()) {
      if (product.category == category) {
        results.add(product);
      };
    };
    results.toArray();
  };

  // ============ ORDER MANAGEMENT ============

  public shared ({ caller }) func placeOrder(productId : Nat, quantity : Nat) : async Order {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can place orders");
    };

    // Verify user has active profile
    switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("User profile not found") };
      case (?profile) {
        if (profile.status != "ACTIVE") {
          Runtime.trap("Account is not active");
        };
      };
    };

    switch (products.get(productId)) {
      case (null) { Runtime.trap("Product not found") };
      case (?product) {
        let total = product.price * quantity;

        let order : Order = {
          id = nextOrderId;
          productId;
          associate = caller;
          quantity;
          totalAmount = total;
          orderDate = Time.now();
          status = "PENDING";
        };
        orders.add(nextOrderId, order);
        nextOrderId += 1;
        order;
      };
    };
  };

  public query ({ caller }) func getOrderHistory(user : Principal) : async [Order] {
    if (caller != user and not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Can only view your own order history");
    };

    let results = List.empty<Order>();
    for ((_, order) in orders.entries()) {
      if (order.associate == user) {
        results.add(order);
      };
    };
    results.toArray();
  };

  public shared ({ caller }) func markOrderDelivered(orderId : Nat) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can mark orders as delivered");
    };

    switch (orders.get(orderId)) {
      case (null) { Runtime.trap("Order not found") };
      case (?order) {
        let updatedOrder : Order = {
          id = order.id;
          productId = order.productId;
          associate = order.associate;
          quantity = order.quantity;
          totalAmount = order.totalAmount;
          orderDate = order.orderDate;
          status = "DELIVERED";
        };
        orders.add(order.id, updatedOrder);

        // Trigger commission calculation
        calculateCommissions(order);

        // Trigger referral bonus calculation (7-level fixed bonuses)
        calculateReferralBonuses(order);
      };
    };
  };

  // ============ COMMISSION & EARNINGS ============

  private func calculateCommissions(order : Order) {
    let commissionRate1 = 10; // 10% for level 1
    let commissionRate2 = 5;  // 5% for level 2

    // Get the associate who placed the order
    switch (referrals.get(order.associate)) {
      case (null) {}; // No referrer, no commissions
      case (?referral) {
        // Level 1 commission (direct referrer)
        let level1Amount = (order.totalAmount * commissionRate1) / 100;
        let commission1 : Commission = {
          id = nextCommissionId;
          associate = referral.referrer;
          orderId = order.id;
          amount = level1Amount;
          level = 1;
          timestamp = Time.now();
        };
        commissions.add(nextCommissionId, commission1);
        nextCommissionId += 1;
        creditWallet(referral.referrer, level1Amount);

        // Level 2 commission (referrer's referrer)
        switch (referrals.get(referral.referrer)) {
          case (null) {}; // No level 2 referrer
          case (?referral2) {
            let level2Amount = (order.totalAmount * commissionRate2) / 100;
            let commission2 : Commission = {
              id = nextCommissionId;
              associate = referral2.referrer;
              orderId = order.id;
              amount = level2Amount;
              level = 2;
              timestamp = Time.now();
            };
            commissions.add(nextCommissionId, commission2);
            nextCommissionId += 1;
            creditWallet(referral2.referrer, level2Amount);
          };
        };
      };
    };
  };

  // --- Fixed 7-level Referral Bonus Calculation ---
  private func calculateReferralBonuses(order : Order) {
    // Only pay referral bonus when Associate-ID product is ordered
    switch (idProduct.get(order.productId)) {
      case (null) {};
      case (?_) {
        // Fixed amounts for each level in cents (7 levels)
        let bonusAmounts = [10000, 5000, 2500, 1000, 1000, 500, 500];

        // Traverse up the referral chain (up to 7 levels)
        var currentAssociate = order.associate;
        var level = 1;

        for (bonus in bonusAmounts.vals()) {
          switch (referrals.get(currentAssociate)) {
            case (null) {
              return; // No more referrers, stop traversal
            };
            case (?referral) {
              let bonusRecord : ReferralBonus = {
                id = nextReferralBonusId;
                associate = referral.referrer;
                referralBy = currentAssociate;
                amount = bonus;
                level;
                timestamp = Time.now();
              };
              referralBonuses.add(nextReferralBonusId, bonusRecord);
              nextReferralBonusId += 1;
              creditWallet(referral.referrer, bonus);

              currentAssociate := referral.referrer;
              level += 1; // Move to next level
            };
          };
        };
      };
    };
  };

  private func creditWallet(associate : Principal, amount : Nat) {
    let currentWallet = switch (wallets.get(associate)) {
      case (null) {
        {
          balance = 0;
          totalEarned = 0;
          totalWithdrawn = 0;
          lastUpdated = Time.now();
        };
      };
      case (?wallet) { wallet };
    };

    let updatedWallet : Wallet = {
      balance = currentWallet.balance + amount;
      totalEarned = currentWallet.totalEarned + amount;
      totalWithdrawn = currentWallet.totalWithdrawn;
      lastUpdated = Time.now();
    };
    wallets.add(associate, updatedWallet);
  };

  public query ({ caller }) func getWalletBalance() : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view wallet balance");
    };

    switch (wallets.get(caller)) {
      case (null) { 0 };
      case (?wallet) { wallet.balance };
    };
  };

  public query ({ caller }) func getEarningsDashboard() : async {
    balance : Nat;
    totalEarned : Nat;
    totalWithdrawn : Nat;
    commissionHistory : [Commission];
  } {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view earnings");
    };

    let wallet = switch (wallets.get(caller)) {
      case (null) {
        {
          balance = 0;
          totalEarned = 0;
          totalWithdrawn = 0;
          lastUpdated = Time.now();
        };
      };
      case (?w) { w };
    };

    let commissionList = List.empty<Commission>();
    for ((_, commission) in commissions.entries()) {
      if (commission.associate == caller) {
        commissionList.add(commission);
      };
    };

    {
      balance = wallet.balance;
      totalEarned = wallet.totalEarned;
      totalWithdrawn = wallet.totalWithdrawn;
      commissionHistory = commissionList.toArray();
    };
  };

  public query ({ caller }) func getFixedReferralBonusSummary() : async FixedReferralBonusSummary {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view referral summary");
    };

    let bonuses = referralBonuses.values().toArray();
    let userBonuses = bonuses.filter(func(b) { b.associate == caller });

    var totalBonuses = 0;
    var totalAmount = 0;
    var levelCounts = Array.tabulate(7, func(_) { 0 });
    var levelAmounts = Array.tabulate(7, func(_) { 0 });

    for (bonus in userBonuses.vals()) {
      totalBonuses += 1;
      totalAmount += bonus.amount;

      let idx = bonus.level - 1;
      if (idx < 7) {
        levelCounts := Array.tabulate(levelCounts.size(), func(i) {
          if (i == idx) { levelCounts[i] + 1 } else {
            levelCounts[i]; // levelAmounts[idx] += bonus.amount;
          };
        });
        levelAmounts := Array.tabulate(levelAmounts.size(), func(i) {
          if (i == idx) { levelAmounts[i] + bonus.amount } else {
            levelAmounts[i];
          };
        });
      };
    };

    {
      totalBonuses;
      totalAmount;
      level1Count = levelCounts[0];
      level2Count = levelCounts[1];
      level3Count = levelCounts[2];
      level4Count = levelCounts[3];
      level5Count = levelCounts[4];
      level6Count = levelCounts[5];
      level7Count = levelCounts[6];
      totalLevel1Amount = levelAmounts[0];
      totalLevel2Amount = levelAmounts[1];
      totalLevel3Amount = levelAmounts[2];
      totalLevel4Amount = levelAmounts[3];
      totalLevel5Amount = levelAmounts[4];
      totalLevel6Amount = levelAmounts[5];
      totalLevel7Amount = levelAmounts[6];
      lastUpdated = Time.now();
    };
  };

  public query ({ caller }) func getReferralBonusHistory() : async [ReferralBonus] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view referral bonus history");
    };

    let results = List.empty<ReferralBonus>();
    for ((_, bonus) in referralBonuses.entries()) {
      if (bonus.associate == caller) {
        results.add(bonus);
      };
    };
    results.toArray();
  };

  // ============ PAYOUT REQUESTS ============

  public shared ({ caller }) func requestPayout(amount : Nat) : async PayoutRequest {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can request payouts");
    };

    let wallet = switch (wallets.get(caller)) {
      case (null) { Runtime.trap("No wallet found") };
      case (?w) { w };
    };

    if (wallet.balance < amount) {
      Runtime.trap("Insufficient balance");
    };

    let request : PayoutRequest = {
      id = nextPayoutRequestId;
      associate = caller;
      amount;
      requestDate = Time.now();
      status = "PENDING";
      processedBy = null;
      processedDate = null;
    };
    payoutRequests.add(nextPayoutRequestId, request);
    nextPayoutRequestId += 1;
    request;
  };

  public query ({ caller }) func getMyPayoutRequests() : async [PayoutRequest] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view payout requests");
    };

    let results = List.empty<PayoutRequest>();
    for ((_, request) in payoutRequests.entries()) {
      if (request.associate == caller) {
        results.add(request);
      };
    };
    results.toArray();
  };

  public query ({ caller }) func getAllPayoutRequests() : async [PayoutRequest] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view all payout requests");
    };

    payoutRequests.values().toArray();
  };

  public shared ({ caller }) func processPayoutRequest(requestId : Nat, approved : Bool) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can process payout requests");
    };

    switch (payoutRequests.get(requestId)) {
      case (null) { Runtime.trap("Payout request not found") };
      case (?request) {
        if (request.status != "PENDING") {
          Runtime.trap("Request already processed");
        };

        let newStatus = if (approved) { "PAID" } else { "REJECTED" };

        let updatedRequest : PayoutRequest = {
          id = request.id;
          associate = request.associate;
          amount = request.amount;
          requestDate = request.requestDate;
          status = newStatus;
          processedBy = ?caller;
          processedDate = ?Time.now();
        };
        payoutRequests.add(requestId, updatedRequest);

        // Deduct from wallet if approved
        if (approved) {
          switch (wallets.get(request.associate)) {
            case (null) { Runtime.trap("Wallet not found") };
            case (?wallet) {
              if (wallet.balance < request.amount) {
                Runtime.trap("Insufficient balance");
              };
              let updatedWallet : Wallet = {
                balance = wallet.balance - request.amount;
                totalEarned = wallet.totalEarned;
                totalWithdrawn = wallet.totalWithdrawn + request.amount;
                lastUpdated = Time.now();
              };
              wallets.add(request.associate, updatedWallet);
            };
          };
        };
      };
    };
  };

  // ============ ADMIN FUNCTIONS ============

  public shared ({ caller }) func updateWalletBalance(associate : Principal, amount : Nat) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can update wallet balances");
    };

    creditWallet(associate, amount);
  };

  // ============ ID PRODUCT MANAGEMENT ============

  public shared ({ caller }) func designateIdProduct(productId : Nat) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can designate id-product");
    };

    switch (products.get(productId)) {
      case (null) { Runtime.trap("Product does not exist.") };
      case (?_) {
        if (idProduct.containsKey(productId)) {
          Runtime.trap("This product is already an id-product.");
        } else {
          idProduct.add(productId, ());
        };
      };
    };
  };

  public shared ({ caller }) func removeIdProduct(productId : Nat) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can remove id-product");
    };

    switch (products.get(productId)) {
      case (null) { Runtime.trap("Product does not exist.") };
      case (?_) {
        if (idProduct.containsKey(productId)) {
          idProduct.remove(productId);
        } else {
          Runtime.trap("This product is not an id-product.");
        };
      };
    };
  };

  public query ({ caller }) func getIdProducts() : async [Nat] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view id-products");
    };

    idProduct.keys().toArray();
  };
};
