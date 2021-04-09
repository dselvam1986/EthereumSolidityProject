const Foodiez = artifacts.require('Foodiez');
const FoodiezToken = artifacts.require('FoodiezToken');
const FoodiezHelpers = artifacts.require('FoodiezHelpers');
const AssertionError = require('assertion-error');
const { iteratee, subtract, add } = require('lodash');
const truffleAssert = require('truffle-assertions');


contract('FoodiezTest', (accounts) => {
    let foodz;
    let token;
    let helper;
    let firstOrderId;
    let secondOrderId;
    let firstOrderTotal;
    let secondOrderTotal;

    const FoodzAccount = accounts[0];
    const customerOneAccount = accounts[1];
    const customerTwoAccount = accounts[2];
    const driverAccount = accounts[3];
    const restaurantAccount = accounts[4];

    web3.eth.defaultAccount = web3.eth.accounts[0];

    beforeEach(async () => {
        foodz = await Foodiez.deployed();
        token = await FoodiezToken.deployed();
        helper = await FoodiezHelpers.deployed();

        // approve foodz to allow transfer of tokens
        token.approve(foodz.address, 100, { from: FoodzAccount });
        token.approve(foodz.address, 100, { from: customerOneAccount });
        token.approve(foodz.address, 100, { from: customerTwoAccount });
        token.approve(foodz.address, 100, { from: driverAccount });
        token.approve(foodz.address, 100, { from: restaurantAccount });
    });

    it("test helper function of unit to string", async () => {
        let responce = await helper.uint2str(5);

        // now retrieve the data. 
        assert.equal(responce, "5", "Unit to string not working");
    });

    it("should register a new customer from userAccount", async () => {
        let responce = await foodz.userRegister("Dino Sel", "dino", 0, 0, { from: customerOneAccount });

        // now retrieve the data. 
        var expectedName = "Dino Sel";
        var expectedUserId = "dino"
        var expectedUsrType = "Customer";
        var expectedRating = 0;
        var expectedToken = 10;

        let { usrName, usrId, usrType, rating } = await foodz.getUserInfo(customerOneAccount);

        assert.equal(usrName, expectedName, "User name should be Dino Sel");
        assert.equal(usrId, expectedUserId, "User Id should be dino");
        assert.equal(usrType, expectedUsrType, "User type should be Customer");
        assert.equal(rating.toNumber(), expectedRating, "User rating should be 0");
    });

    it("should register second customer with token", async () => {
        let responce = await foodz.userRegister("Nis Sel", "nsel", 0, 10, { from: customerTwoAccount, value: web3.utils.toWei('10', 'ether')  });

        // now retrieve the data. 
        var expectedName = "Nis Sel";
        var expectedUserId = "nsel";
        var expectedUsrType = "Customer";
        var expectedRating = 0;

        let { usrName, usrId, usrType, rating } = await foodz.getUserInfo(customerTwoAccount);

        assert.equal(usrName, expectedName, "User name should match");
        assert.equal(usrId, expectedUserId, "User Id should match");
        assert.equal(usrType, expectedUsrType, "User type should be Customer");
        assert.equal(rating.toNumber(), expectedRating, "User rating should be 0");
    });

    it("customer should have 10 tokens in accounts", async () =>{
        var expectedToken = 10;
        let result = await foodz.getTokenBalanceOf(customerTwoAccount);
        let userToken = result.toNumber();
        assert.equal(userToken, expectedToken, "Token should match");
    });

    it("should register a new driver from driverAccount", async () => {
        let responce = await foodz.userRegister("John Ang", "jang", 1, 10, { from: driverAccount, value: web3.utils.toWei('10', 'ether') });

        // // now retrieve the data. 
        var expectedName = "John Ang";
        var expectedUserId = "jang";
        var expectedUsrType = "Delivery";
        var expectedRating = 0;

        let { usrName, usrId, usrType, rating } = await foodz.getUserInfo(driverAccount);

        // console.log(usrName, usrAddress, usrType, rating);
        assert.equal(usrName, expectedName, "Driver name should be John Ang");
        assert.equal(usrId, expectedUserId, "Driver userId should be jang");
        assert.equal(usrType, expectedUsrType, "User type should be Delivery");
        assert.equal(rating.toNumber(), expectedRating, "Driver rating should be 0");
    });

    it("driver should have 10 tokens in accounts", async () => {
        var expectedToken = 10;
        let result = await foodz.getTokenBalanceOf(driverAccount);
        let userToken = result.toNumber();
        assert.equal(userToken, expectedToken, "Token should match");
    });

    it("should register a new restaurant", async () => {
        let responce = await foodz.registerRestaurant("Shakti Restaurant", "shakti", 10, { from: restaurantAccount, value: web3.utils.toWei('10', 'ether') });

        // now retrieve the data. 
        let { rId, rAddress, rItems, rating } = await foodz.getrestaurantInfo(restaurantAccount);
        assert.equal(rId, "shakti", "Restaurant Id not matching");
        assert.equal(rating.toNumber(), 0, "Restaurant rating should be 0");
    });

    it("should add appetezier item to restaurant", async () => {
        let responce = await foodz.addMenuItems("Chicken Sixty Five", 0, web3.utils.toWei('3', 'ether'), { from: restaurantAccount });

        // now retrieve the data. 
        let { itemName, itemType, itemPrice } = await foodz.getRestaurantMenu(restaurantAccount, 0);
        assert.equal(itemName, "Chicken Sixty Five", "Item name is not matching");
        assert.equal(itemType, "Appetizer", "Item type is not matching");
        assert.equal(itemPrice, web3.utils.toWei('3', 'ether'), "Item price is not matching");
    });
    
    it("should add Main Dish item to restaurant", async () => {
        let responce = await foodz.addMenuItems("Chicken Briyani", 1, web3.utils.toWei('5', 'ether'), { from: restaurantAccount });

        // now retrieve the data. 
        let { itemName, itemType, itemPrice } = await foodz.getRestaurantMenu(restaurantAccount, 1);
        assert.equal(itemName, "Chicken Briyani", "Item name is not matching");
        assert.equal(itemType, "Main", "Item type is not matching");
        assert.equal(itemPrice, web3.utils.toWei('5', 'ether'), "Item price is not matching");
    });

    it("should add Desert items to restaurant", async () => {
        let responce = await foodz.addMenuItems("Kulfi", 2, web3.utils.toWei('2', 'ether'), { from: restaurantAccount });

        // now retrieve the data. 
        let { itemName, itemType, itemPrice } = await foodz.getRestaurantMenu(restaurantAccount, 2);
        assert.equal(itemName, "Kulfi", "Item name is not matching");
        assert.equal(itemType, "Desert", "Item type is not matching");
        assert.equal(itemPrice, web3.utils.toWei('2', 'ether'), "Item price is not matching");
    });

    it("restaurant should have 3 items", async () => {
        let { rId, rAddress, rItems, rating } = await foodz.getrestaurantInfo(restaurantAccount);
        assert.equal(rItems.toNumber(), 3, "Restaurant noOfItems should be 3");
    });

    /***********placing orders*****************************************/

    it("customer one should be able to get order total", async () => {
        
        // test with apps and desert. price is 3 and 2 respectively. total 5.2 with fees. 
        var items = [];
        items.push(web3.utils.toBN(0));
        items.push(web3.utils.toBN(2));

        let orderTotal = await foodz.orderTotal(restaurantAccount, items, { from: customerOneAccount });
        // console.log("Order total should be 5.2 and is: ", web3.utils.fromWei(orderTotal) );

        firstOrderTotal = web3.utils.fromWei(orderTotal, 'ether');
        var expectedTotal = 5.2
        assert.equal(web3.utils.fromWei(orderTotal, 'ether'), expectedTotal, "Order total should be 5.2");
    });

    it("customer one should be able to place an order", async () => {
        var itemNames = [];
        itemNames.push("Chicken Sixty Five");
        itemNames.push("Kulfi");

        var totalPrice = web3.utils.toWei('5.2', 'ether');
        var tokenPay = 0;

        var expectedId = "dino0";
        var expectedStatus = "Ordered";
        let response = await foodz.placeOrder(restaurantAccount, itemNames, totalPrice, tokenPay, { from: customerOneAccount, value: totalPrice });
        // console.log(response.logs);
        var uOrderId = response.logs[0].args.orderId;
        var orderStatus = response.logs[0].args.orderStatus;
        
        firstOrderId = response.logs[0].args.orderId; // set to use in next test. 
        assert.equal(uOrderId, expectedId, "Order ids do not match");
        assert.equal(orderStatus, expectedStatus, "Order status do not match");
    });

    it("order should be assigned to driver", async () => {
        
        let responce = await foodz.assignToDriver(firstOrderId, { from: driverAccount });
        // console.log(responce.logs[0].args);

        let assignedDriverAddress = responce.logs[0].args.driverAddress;
        let newOrderStatus = responce.logs[0].args.orderStatus;

        // now retrieve the data. 
        let { orderId, userAddress, driverAddress, items, total, status } = await foodz.getOrderStatus(firstOrderId);

        assert.equal(driverAddress, assignedDriverAddress, "Driver address is asigned");
        assert.equal(status, newOrderStatus, "Order status is not matching");
    });

    it("order should be delivered and status changed to delivered", async () => {
        let responce = await foodz.driverDelieveredOrder(firstOrderId, { from: driverAccount });

        // console.log(responce.logs[0].args);
        let newOrderStatus = responce.logs[0].args.orderStatus;

        // now retrieve the data.
        let { orderId, userAddress, driverAddress, items, total, status } = await foodz.getOrderStatus(firstOrderId);

        assert.equal(status, newOrderStatus, "Order status is not matching");
    });

    // it("customer accepts delivery and pays", async () => {

    //     // check balances of customer and driver and restaurant
    //     let preCustomerBalance = await web3.eth.getBalance(customerOneAccount) ;
    //     let preDriverBalance = web3.utils.fromWei(await web3.eth.getBalance(driverAccount));
    //     let preRestaurantBalance = web3.utils.fromWei(await web3.eth.getBalance(restaurantAccount));

    //     let userTip = 3;

    //     // console.log("User Balance", preCustomerBalance);
    //     // console.log("Driver Balance", preDriverBalance);
    //     // console.log("Restaurant Balance", preRestaurantBalance);

    //     let responce = await foodz.orderDeliveryConfirmed(firstOrderId, 5, 5, 0, { from: customerOneAccount, value: web3.utils.toWei('3', 'ether') });

    //     let restaurantTotal = web3.utils.fromWei(web3.utils.toWei(web3.utils.fromWei(responce.logs[0].args.restaurantTotal, 'ether')));
    //     let deliveryTotal = web3.utils.fromWei(web3.utils.toWei(web3.utils.fromWei(responce.logs[0].args.deliveryTotal, 'ether')));
    //     // let deliveryFee = subtract(deliveryTotal, web3.utils.toWei('3', 'ether') );
    //     // let serviceFee = subtract(deliveryTotal, web3.utils.toWei('3', 'ether') );
    //     // let totalFees = add(deliveryFee, serviceFee);

    //     // console.log("Full Total:", total)
    //     // console.log("Rest total:",restaurantTotal);
    //     // console.log("total fees:", totalFees);

        
    //     let expectedDriverBalance = add(preDriverBalance, deliveryTotal);
    //     let expectedRestBalance = add(preRestaurantBalance, restaurantTotal);

    //     let endDriverBalance = web3.utils.fromWei(await web3.eth.getBalance(driverAccount));
    //     let endRestaurantBalance = web3.utils.fromWei(await web3.eth.getBalance(restaurantAccount));

    //     // console.log("User new Balance", expectedCustomerBalance);
    //     // // console.log("Driver new Balance", endDriverBalance);
    //     // // console.log("Restaurant new Balance", endRestaurantBalance);

    //     // assert.equal(endCustomerBalance, expectedCustomerBalance, "Customer Balance must match");
    //     assert.equal(endDriverBalance, expectedDriverBalance, "Driver Balance must match");
    //     assert.equal(endRestaurantBalance, expectedRestBalance, "Restaurant Balance must match");
        
    // });

    /************************placing order and testing tokens************** */
    it("customer two should be able to get order total", async () => {

        // test with apps and desert. price is 3 and 2 respectively. total 5.2 with fees. 
        var items = [];
        items.push(web3.utils.toBN(0));
        items.push(web3.utils.toBN(2));

        let orderTotal = await foodz.orderTotal(restaurantAccount, items, { from: customerTwoAccount });
        // console.log("Order total should be 5.2 and is: ", web3.utils.fromWei(orderTotal) );

        secondOrderTotal = web3.utils.fromWei(orderTotal, 'ether');
        var expectedTotal = 5.2
        assert.equal(web3.utils.fromWei(orderTotal, 'ether'), expectedTotal, "Order total should be 5.2");
    });

    it("customer two should be able to place an order", async () => {
        var itemNames = [];
        itemNames.push("Chicken Sixty Five");
        itemNames.push("Kulfi");

        var totalPrice = web3.utils.toWei('5.2', 'ether');
        var tokenPay = 0;

        var expectedId = "nsel0";
        var expectedStatus = "Ordered";
        let response = await foodz.placeOrder(restaurantAccount, itemNames, totalPrice, tokenPay, { from: customerTwoAccount, value: totalPrice });
        // console.log(response.logs);
        var uOrderId = response.logs[0].args.orderId;
        var orderStatus = response.logs[0].args.orderStatus;

        secondOrderId = response.logs[0].args.orderId; // set to use in next test.
        assert.equal(uOrderId, expectedId, "Order ids do not match");
        assert.equal(orderStatus, expectedStatus, "Order status do not match");
    });

    it("second order should be assigned to driver", async () => {

        let responce = await foodz.assignToDriver(secondOrderId, { from: driverAccount });
        // console.log(responce.logs[0].args);

        let assignedDriverAddress = responce.logs[0].args.driverAddress;
        let newOrderStatus = responce.logs[0].args.orderStatus;

        // now retrieve the data. 
        let { orderId, userAddress, driverAddress, items, total, status } = await foodz.getOrderStatus(secondOrderId);

        assert.equal(driverAddress, assignedDriverAddress, "Driver address is asigned");
        assert.equal(status, newOrderStatus, "Order status is not matching");
    });

    it("second order should be delivered and status changed to delivered", async () => {
        let responce = await foodz.driverDelieveredOrder(secondOrderId, { from: driverAccount });

        // console.log(responce.logs[0].args);
        let newOrderStatus = responce.logs[0].args.orderStatus;

        // now retrieve the data.
        let { orderId, userAddress, driverAddress, items, total, status } = await foodz.getOrderStatus(secondOrderId);

        assert.equal(status, newOrderStatus, "Order status is not matching");
    });

    it("customer accepts second order delivery and pays and tips with token", async () => {

        // check balances of customer and driver and restaurant
        let preCustomerToken = await foodz.getTokenBalanceOf(customerTwoAccount);
        let preDriverToken = await foodz.getTokenBalanceOf(driverAccount);

        // console.log("User Token", preCustomerToken);
        // console.log("Driver Token", preDriverToken);

        let responce = await foodz.orderDeliveryConfirmed(secondOrderId, 5, 5, 2, { from: customerTwoAccount });


        var expectedCustomerToken = 8;
        var expectedDriverToken = 12;

        let postCustomerToken = await foodz.getTokenBalanceOf(customerTwoAccount);
        let endDriverToken = await foodz.getTokenBalanceOf(driverAccount);

        assert.equal(postCustomerToken, expectedCustomerToken, "Customer Token should match");
        assert.equal(endDriverToken, expectedDriverToken, "Driver token should match");
    });
});