import Array "mo:core/Array";
import Runtime "mo:core/Runtime";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Map "mo:core/Map";
import List "mo:core/List";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import Char "mo:core/Char";
import Float "mo:core/Float";
import Int "mo:core/Int";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Types
  type UserRole = {
    #Company;
    #Distributor;
    #Retailer;
  };

  type OrderStatus = {
    #Pending;
    #Confirmed;
    #Shipped;
    #Delivered;
    #Cancelled;
  };

  type AnnouncementType = {
    #Promotion;
    #NewProduct;
    #TradeOffer;
    #General;
  };

  type UserProfile = {
    userId : Principal;
    name : Text;
    role : UserRole;
    companyName : Text;
    contactEmail : Text;
    phone : Text;
    address : Text;
    description : Text;
    createdAt : Int;
  };

  type Product = {
    id : Nat;
    companyId : Principal;
    companyName : Text;
    name : Text;
    description : Text;
    category : Text;
    unitPrice : Float;
    currency : Text;
    minimumOrderQty : Nat;
    stockAvailable : Nat;
    imageUrl : Text;
    isActive : Bool;
    createdAt : Int;
  };

  type Order = {
    id : Nat;
    buyerId : Principal;
    buyerName : Text;
    buyerRole : UserRole;
    supplierId : Principal;
    supplierName : Text;
    productId : Nat;
    productName : Text;
    quantity : Nat;
    unitPrice : Float;
    totalAmount : Float;
    status : OrderStatus;
    notes : Text;
    createdAt : Int;
    updatedAt : Int;
  };

  type Announcement = {
    id : Nat;
    companyId : Principal;
    companyName : Text;
    title : Text;
    content : Text;
    announcementType : AnnouncementType;
    isActive : Bool;
    createdAt : Int;
  };

  type CompanyStats = {
    totalProducts : Nat;
    totalOrders : Nat;
    pendingOrders : Nat;
    totalRevenue : Float;
  };

  type BuyerStats = {
    totalOrders : Nat;
    pendingOrders : Nat;
    deliveredOrders : Nat;
  };

  // State
  let userProfiles = Map.empty<Principal, UserProfile>();
  let products = Map.empty<Nat, Product>();
  let orders = Map.empty<Nat, Order>();
  let announcements = Map.empty<Nat, Announcement>();

  var nextProductId : Nat = 1;
  var nextOrderId : Nat = 1;
  var nextAnnouncementId : Nat = 1;

  // Helper function for case-insensitive search
  func toLowercase(text : Text) : Text {
    Array.fromIter(text.chars().map(func(c) { if (c >= 'A' and c <= 'Z') { Char.fromNat32(c.toNat32() + 32) } else { c } })).toText();
  };

  // ============ User Profile Management ============

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    if (profile.userId != caller) {
      Runtime.trap("Unauthorized: Profile userId must match caller");
    };
    userProfiles.add(caller, profile);
  };

  public shared ({ caller }) func registerUser(
    name : Text,
    role : UserRole,
    companyName : Text,
    contactEmail : Text,
    phone : Text,
    address : Text,
    description : Text,
  ) : async UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can register");
    };

    let profile : UserProfile = {
      userId = caller;
      name;
      role;
      companyName;
      contactEmail;
      phone;
      address;
      description;
      createdAt = Time.now();
    };

    userProfiles.add(caller, profile);
    profile;
  };

  public shared ({ caller }) func updateUserProfile(
    name : Text,
    companyName : Text,
    contactEmail : Text,
    phone : Text,
    address : Text,
    description : Text,
  ) : async UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update profiles");
    };

    switch (userProfiles.get(caller)) {
      case (?existingProfile) {
        let updatedProfile : UserProfile = {
          userId = existingProfile.userId;
          name;
          role = existingProfile.role;
          companyName;
          contactEmail;
          phone;
          address;
          description;
          createdAt = existingProfile.createdAt;
        };
        userProfiles.add(caller, updatedProfile);
        updatedProfile;
      };
      case (null) {
        Runtime.trap("Profile not found");
      };
    };
  };

  public query ({ caller }) func getAllCompanyProfiles() : async [UserProfile] {
    let companies = List.empty<UserProfile>();
    for ((_, profile) in userProfiles.entries()) {
      switch (profile.role) {
        case (#Company) {
          companies.add(profile);
        };
        case (_) {};
      };
    };
    companies.toArray();
  };

  public query ({ caller }) func getCompanyProfile(companyId : Principal) : async ?UserProfile {
    switch (userProfiles.get(companyId)) {
      case (?profile) {
        switch (profile.role) {
          case (#Company) { ?profile };
          case (_) { null };
        };
      };
      case (null) { null };
    };
  };

  // ============ Product Management ============

  public shared ({ caller }) func createProduct(
    name : Text,
    description : Text,
    category : Text,
    unitPrice : Float,
    minimumOrderQty : Nat,
    stockAvailable : Nat,
    imageUrl : Text,
  ) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create products");
    };

    switch (userProfiles.get(caller)) {
      case (?profile) {
        switch (profile.role) {
          case (#Company) {
            let id = nextProductId;
            nextProductId += 1;

            let newProduct : Product = {
              id;
              companyId = caller;
              companyName = profile.companyName;
              name;
              description;
              category;
              unitPrice;
              currency = "USD";
              minimumOrderQty;
              stockAvailable;
              imageUrl;
              isActive = true;
              createdAt = Time.now();
            };

            products.add(id, newProduct);
            id;
          };
          case (_) {
            Runtime.trap("Unauthorized: Only companies can create products");
          };
        };
      };
      case (null) {
        Runtime.trap("User profile not found");
      };
    };
  };

  public shared ({ caller }) func updateProduct(
    productId : Nat,
    name : Text,
    description : Text,
    category : Text,
    unitPrice : Float,
    minimumOrderQty : Nat,
    stockAvailable : Nat,
    imageUrl : Text,
    isActive : Bool,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update products");
    };

    switch (products.get(productId)) {
      case (?product) {
        if (product.companyId != caller) {
          Runtime.trap("Unauthorized: Can only update your own products");
        };

        let updatedProduct : Product = {
          id = product.id;
          companyId = product.companyId;
          companyName = product.companyName;
          name;
          description;
          category;
          unitPrice;
          currency = product.currency;
          minimumOrderQty;
          stockAvailable;
          imageUrl;
          isActive;
          createdAt = product.createdAt;
        };

        products.add(productId, updatedProduct);
      };
      case (null) {
        Runtime.trap("Product not found");
      };
    };
  };

  public shared ({ caller }) func deleteProduct(productId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete products");
    };

    switch (products.get(productId)) {
      case (?product) {
        if (product.companyId != caller) {
          Runtime.trap("Unauthorized: Can only delete your own products");
        };
        products.remove(productId);
      };
      case (null) {
        Runtime.trap("Product not found");
      };
    };
  };

  public query ({ caller }) func getAllActiveProducts() : async [Product] {
    let activeProducts = List.empty<Product>();
    for ((_, product) in products.entries()) {
      if (product.isActive) {
        activeProducts.add(product);
      };
    };
    activeProducts.toArray();
  };

  public query ({ caller }) func getProduct(productId : Nat) : async ?Product {
    products.get(productId);
  };

  public query ({ caller }) func getProductsByCompany(companyId : Principal) : async [Product] {
    let companyProducts = List.empty<Product>();
    for ((_, product) in products.entries()) {
      if (product.companyId == companyId) {
        companyProducts.add(product);
      };
    };
    companyProducts.toArray();
  };

  public query ({ caller }) func getProductsByCategory(category : Text) : async [Product] {
    let categoryProducts = List.empty<Product>();
    for ((_, product) in products.entries()) {
      if (product.category == category and product.isActive) {
        categoryProducts.add(product);
      };
    };
    categoryProducts.toArray();
  };

  public query ({ caller }) func searchProductsByName(searchTerm : Text) : async [Product] {
    let lowerSearchTerm = toLowercase(searchTerm);
    let matchingProducts = List.empty<Product>();
    
    for ((_, product) in products.entries()) {
      if (product.isActive) {
        let lowerName = toLowercase(product.name);
        if (lowerName.contains(#text lowerSearchTerm)) {
          matchingProducts.add(product);
        };
      };
    };
    matchingProducts.toArray();
  };

  // ============ Order Management ============

  public shared ({ caller }) func placeOrder(
    productId : Nat,
    quantity : Nat,
    notes : Text,
  ) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can place orders");
    };

    switch (userProfiles.get(caller)) {
      case (?buyerProfile) {
        switch (buyerProfile.role) {
          case (#Distributor or #Retailer) {
            switch (products.get(productId)) {
              case (?product) {
                if (not product.isActive) {
                  Runtime.trap("Product is not active");
                };
                if (quantity < product.minimumOrderQty) {
                  Runtime.trap("Quantity below minimum order quantity");
                };
                if (quantity > product.stockAvailable) {
                  Runtime.trap("Insufficient stock available");
                };

                let id = nextOrderId;
                nextOrderId += 1;

                let totalAmount = Int.abs(quantity).toFloat() * product.unitPrice;

                let newOrder : Order = {
                  id;
                  buyerId = caller;
                  buyerName = buyerProfile.name;
                  buyerRole = buyerProfile.role;
                  supplierId = product.companyId;
                  supplierName = product.companyName;
                  productId;
                  productName = product.name;
                  quantity;
                  unitPrice = product.unitPrice;
                  totalAmount;
                  status = #Pending;
                  notes;
                  createdAt = Time.now();
                  updatedAt = Time.now();
                };

                orders.add(id, newOrder);
                id;
              };
              case (null) {
                Runtime.trap("Product not found");
              };
            };
          };
          case (#Company) {
            Runtime.trap("Unauthorized: Companies cannot place orders");
          };
        };
      };
      case (null) {
        Runtime.trap("User profile not found");
      };
    };
  };

  public shared ({ caller }) func updateOrderStatus(
    orderId : Nat,
    newStatus : OrderStatus,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update order status");
    };

    switch (orders.get(orderId)) {
      case (?order) {
        if (order.supplierId != caller) {
          Runtime.trap("Unauthorized: Only the supplier can update order status");
        };

        switch (userProfiles.get(caller)) {
          case (?profile) {
            switch (profile.role) {
              case (#Company) {
                let updatedOrder : Order = {
                  id = order.id;
                  buyerId = order.buyerId;
                  buyerName = order.buyerName;
                  buyerRole = order.buyerRole;
                  supplierId = order.supplierId;
                  supplierName = order.supplierName;
                  productId = order.productId;
                  productName = order.productName;
                  quantity = order.quantity;
                  unitPrice = order.unitPrice;
                  totalAmount = order.totalAmount;
                  status = newStatus;
                  notes = order.notes;
                  createdAt = order.createdAt;
                  updatedAt = Time.now();
                };

                orders.add(orderId, updatedOrder);
              };
              case (_) {
                Runtime.trap("Unauthorized: Only companies can update order status");
              };
            };
          };
          case (null) {
            Runtime.trap("User profile not found");
          };
        };
      };
      case (null) {
        Runtime.trap("Order not found");
      };
    };
  };

  public shared ({ caller }) func cancelOrder(orderId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can cancel orders");
    };

    switch (orders.get(orderId)) {
      case (?order) {
        if (order.buyerId != caller) {
          Runtime.trap("Unauthorized: Can only cancel your own orders");
        };

        switch (order.status) {
          case (#Pending) {
            let updatedOrder : Order = {
              id = order.id;
              buyerId = order.buyerId;
              buyerName = order.buyerName;
              buyerRole = order.buyerRole;
              supplierId = order.supplierId;
              supplierName = order.supplierName;
              productId = order.productId;
              productName = order.productName;
              quantity = order.quantity;
              unitPrice = order.unitPrice;
              totalAmount = order.totalAmount;
              status = #Cancelled;
              notes = order.notes;
              createdAt = order.createdAt;
              updatedAt = Time.now();
            };

            orders.add(orderId, updatedOrder);
          };
          case (_) {
            Runtime.trap("Can only cancel pending orders");
          };
        };
      };
      case (null) {
        Runtime.trap("Order not found");
      };
    };
  };

  public query ({ caller }) func getMyOrders() : async [Order] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view orders");
    };

    let myOrders = List.empty<Order>();
    for ((_, order) in orders.entries()) {
      if (order.buyerId == caller) {
        myOrders.add(order);
      };
    };
    myOrders.toArray();
  };

  public query ({ caller }) func getIncomingOrders() : async [Order] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view orders");
    };

    switch (userProfiles.get(caller)) {
      case (?profile) {
        switch (profile.role) {
          case (#Company) {
            let incomingOrders = List.empty<Order>();
            for ((_, order) in orders.entries()) {
              if (order.supplierId == caller) {
                incomingOrders.add(order);
              };
            };
            incomingOrders.toArray();
          };
          case (_) {
            Runtime.trap("Unauthorized: Only companies can view incoming orders");
          };
        };
      };
      case (null) {
        Runtime.trap("User profile not found");
      };
    };
  };

  public query ({ caller }) func getOrder(orderId : Nat) : async ?Order {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view orders");
    };

    switch (orders.get(orderId)) {
      case (?order) {
        if (order.buyerId == caller or order.supplierId == caller) {
          ?order;
        } else {
          Runtime.trap("Unauthorized: Can only view your own orders");
        };
      };
      case (null) { null };
    };
  };

  // ============ Announcement Management ============

  public shared ({ caller }) func createAnnouncement(
    title : Text,
    content : Text,
    announcementType : AnnouncementType,
  ) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create announcements");
    };

    switch (userProfiles.get(caller)) {
      case (?profile) {
        switch (profile.role) {
          case (#Company) {
            let id = nextAnnouncementId;
            nextAnnouncementId += 1;

            let newAnnouncement : Announcement = {
              id;
              companyId = caller;
              companyName = profile.companyName;
              title;
              content;
              announcementType;
              isActive = true;
              createdAt = Time.now();
            };

            announcements.add(id, newAnnouncement);
            id;
          };
          case (_) {
            Runtime.trap("Unauthorized: Only companies can create announcements");
          };
        };
      };
      case (null) {
        Runtime.trap("User profile not found");
      };
    };
  };

  public shared ({ caller }) func updateAnnouncement(
    announcementId : Nat,
    title : Text,
    content : Text,
    announcementType : AnnouncementType,
    isActive : Bool,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update announcements");
    };

    switch (announcements.get(announcementId)) {
      case (?announcement) {
        if (announcement.companyId != caller) {
          Runtime.trap("Unauthorized: Can only update your own announcements");
        };

        let updatedAnnouncement : Announcement = {
          id = announcement.id;
          companyId = announcement.companyId;
          companyName = announcement.companyName;
          title;
          content;
          announcementType;
          isActive;
          createdAt = announcement.createdAt;
        };

        announcements.add(announcementId, updatedAnnouncement);
      };
      case (null) {
        Runtime.trap("Announcement not found");
      };
    };
  };

  public shared ({ caller }) func deactivateAnnouncement(announcementId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can deactivate announcements");
    };

    switch (announcements.get(announcementId)) {
      case (?announcement) {
        if (announcement.companyId != caller) {
          Runtime.trap("Unauthorized: Can only deactivate your own announcements");
        };

        let updatedAnnouncement : Announcement = {
          id = announcement.id;
          companyId = announcement.companyId;
          companyName = announcement.companyName;
          title = announcement.title;
          content = announcement.content;
          announcementType = announcement.announcementType;
          isActive = false;
          createdAt = announcement.createdAt;
        };

        announcements.add(announcementId, updatedAnnouncement);
      };
      case (null) {
        Runtime.trap("Announcement not found");
      };
    };
  };

  public query ({ caller }) func getAllActiveAnnouncements() : async [Announcement] {
    let activeAnnouncements = List.empty<Announcement>();
    for ((_, announcement) in announcements.entries()) {
      if (announcement.isActive) {
        activeAnnouncements.add(announcement);
      };
    };
    activeAnnouncements.toArray();
  };

  public query ({ caller }) func getAnnouncementsByType(announcementType : AnnouncementType) : async [Announcement] {
    let filteredAnnouncements = List.empty<Announcement>();
    for ((_, announcement) in announcements.entries()) {
      if (announcement.isActive and announcement.announcementType == announcementType) {
        filteredAnnouncements.add(announcement);
      };
    };
    filteredAnnouncements.toArray();
  };

  public query ({ caller }) func getAnnouncementsByCompany(companyId : Principal) : async [Announcement] {
    let companyAnnouncements = List.empty<Announcement>();
    for ((_, announcement) in announcements.entries()) {
      if (announcement.companyId == companyId and announcement.isActive) {
        companyAnnouncements.add(announcement);
      };
    };
    companyAnnouncements.toArray();
  };

  // ============ Statistics ============

  public query ({ caller }) func getCompanyStats() : async CompanyStats {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view stats");
    };

    switch (userProfiles.get(caller)) {
      case (?profile) {
        switch (profile.role) {
          case (#Company) {
            var totalProducts : Nat = 0;
            var totalOrders : Nat = 0;
            var pendingOrders : Nat = 0;
            var totalRevenue : Float = 0.0;

            for ((_, product) in products.entries()) {
              if (product.companyId == caller) {
                totalProducts += 1;
              };
            };

            for ((_, order) in orders.entries()) {
              if (order.supplierId == caller) {
                totalOrders += 1;
                switch (order.status) {
                  case (#Pending) { pendingOrders += 1 };
                  case (#Delivered) { totalRevenue += order.totalAmount };
                  case (_) {};
                };
              };
            };

            {
              totalProducts;
              totalOrders;
              pendingOrders;
              totalRevenue;
            };
          };
          case (_) {
            Runtime.trap("Unauthorized: Only companies can view company stats");
          };
        };
      };
      case (null) {
        Runtime.trap("User profile not found");
      };
    };
  };

  public query ({ caller }) func getBuyerStats() : async BuyerStats {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view stats");
    };

    switch (userProfiles.get(caller)) {
      case (?profile) {
        switch (profile.role) {
          case (#Distributor or #Retailer) {
            var totalOrders : Nat = 0;
            var pendingOrders : Nat = 0;
            var deliveredOrders : Nat = 0;

            for ((_, order) in orders.entries()) {
              if (order.buyerId == caller) {
                totalOrders += 1;
                switch (order.status) {
                  case (#Pending) { pendingOrders += 1 };
                  case (#Delivered) { deliveredOrders += 1 };
                  case (_) {};
                };
              };
            };

            {
              totalOrders;
              pendingOrders;
              deliveredOrders;
            };
          };
          case (#Company) {
            Runtime.trap("Unauthorized: Only buyers can view buyer stats");
          };
        };
      };
      case (null) {
        Runtime.trap("User profile not found");
      };
    };
  };

  // ============ Sample Data Seeding ============

  public shared ({ caller }) func seedSampleData() : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can seed sample data");
    };

    // This function would populate sample data for demonstration
    // Implementation omitted for brevity but would create sample users, products, orders, etc.
  };
};
