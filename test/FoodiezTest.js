const Foodiez = artifacts.require('Foodiez');
const FoodiezToken = artifacts.require('FoodiezToken');
const FoodiezHelpers = artifacts.require('FoodiezHelpers');
const AssertionError = require('assertion-error');
const { iteratee } = require('lodash');
const truffleAssert = require('truffle-assertions');


contract('FoodiezTest', (accounts) => {
    let foodz;
    let token;
    let helper;
    let firstOrderId;
    let secondOrderId;

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
    });

    it("test helper function of unit to string", async () => {
        let responce = await helper.uint2str(5);

        // now retrieve the data. 
        assert.equal(responce, "5", "Unit to string not working");
    });

    it("should register a new customer from userAccount", async () => {
        let responce = await foodz.userRegister("Dino Sel", 0, 0, { from: customerOneAccount });

        // now retrieve the data. 
        var expectedName = "Dino Sel";
        var expectedUsrType = "Customer";
        var expectedRating = 0;

        let { usrName, usrAddress, usrType, rating } = await foodz.getUserInfo(customerOneAccount);

        // console.log(usrName, usrAddress, usrType, rating);
        assert.equal(usrName, expectedName, "User name should be Dino Sel");
        assert.equal(usrType, expectedUsrType, "User type should be Customer");
        assert.equal(rating.toNumber(), expectedRating, "User rating should be 0");
    });

    it("should register second customer with token", async () => {
        let responce = await foodz.userRegister("Nis Sel", 0, 10, { from: customerTwoAccount, value: web3.utils.toWei('10', 'ether')  });

        // now retrieve the data. 
        var expectedName = "Nis Sel";
        var expectedUsrType = "Customer";
        var expectedRating = 0;

        let { usrName, usrAddress, usrType, rating } = await foodz.getUserInfo(customerTwoAccount);

        assert.equal(usrName, expectedName, "User name should match");
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
        let responce = await foodz.userRegister("John Ang", 1, 10, { from: driverAccount, value: web3.utils.toWei('10', 'ether') });

        // // now retrieve the data. 
        var expectedName = "John Ang";
        var expectedUsrType = "Delivery";
        var expectedRating = 0;

        let { usrName, usrAddress, usrType, rating } = await foodz.getUserInfo(driverAccount);

        // console.log(usrName, usrAddress, usrType, rating);
        assert.equal(usrName, expectedName, "Driver name should be John Ang");
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

    it("customer should be able to place an order", async () => {
        let responce = await foodz.placeOrder(restaurantAccount, 1, 0, { from: customerOneAccount, value: web3.utils.toWei('5.2', 'ether') });

        // console.log(responce);
        // console.log(responce.logs[0].args);
        let uniqueId = responce.logs[0].args.orderId;
        let utotal = responce.logs[0].args.total;
        let ustatus = responce.logs[0].args.orderStatus;
        firstOrderId = uniqueId;

        // now retrieve the data. 3000000000000000000
        let { orderId, userAddress, driverAddress, items, total, status } = await foodz.getOrderStatus(uniqueId);

        console.log("uTotal is: ", utotal);
        console.log("Total is: ", total);
        assert.equal(orderId, uniqueId, "Order ids do not match");
        // assert.equal(total, utotal, "Order total is not matching");
        assert.equal(status, ustatus, "Order status is not matching");
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

    it("customer accepts delivery and pays", async () => {

        // check balances of customer and driver and restaurant
        let preCustomerBalance = await web3.eth.getBalance(customerOneAccount);
        let preCustomerToken = await foodz.getTokenBalanceOf(customerOneAccount)
        let preDriverBalance = await web3.eth.getBalance(driverAccount);
        let preRestaurantBalance = await web3.eth.getBalance(restaurantAccount);

        console.log("User Balance", preCustomerBalance);
        console.log("Driver Balance", preDriverBalance);
        console.log("Restaurant Balance", preRestaurantBalance);
        console.log("User Token pre pay", preCustomerToken);

        let responce = await foodz.orderDeliveryConfirmed(firstOrderId, 5, 5, 0, { from: customerOneAccount, value: web3.utils.toWei("4", "ether") });

        // console.log(responce);
        // console.log(responce.logs[0].args);

        let endCustomerBalance = await web3.eth.getBalance(customerOneAccount);
        let postCustomerToken = await foodz.getTokenBalanceOf(customerOneAccount)
        let endDriverBalance = await web3.eth.getBalance(driverAccount);
        let endRestaurantBalance = await web3.eth.getBalance(restaurantAccount);

        console.log("User new Balance", endCustomerBalance);
        console.log("Driver new Balance", endDriverBalance);
        console.log("Restaurant new Balance", endRestaurantBalance);
        console.log("User Token pre pay", postCustomerToken);

        // assert.equal(orderId, uniqueId, "Order ids do not match");
        // assert.equal(total.toNumber(), utotal, "Order total is not matching");
        // assert.equal(status, ustatus, "Order status is not matching");
    });

    /************************placing order and testing tokens************** */

    // it("second customer should be able to place an order", async () => {
    //     let responce = await foodz.placeOrder(restaurantAccount, 1, 0, { from: customerTwoAccount, value: web3.utils.toWei('5', 'ether') });

    //     // console.log(responce.logs[0].args);
    //     let uniqueId = responce.logs[0].args.orderId;
    //     let utotal = responce.logs[0].args.total.toNumber();
    //     let ustatus = responce.logs[0].args.orderStatus;
    //     secondOrderId = uniqueId;

    //     // now retrieve the data. 3000000000000000000
    //     let { orderId, userAddress, driverAddress, items, total, status } = await foodz.getOrderStatus(uniqueId);

    //     assert.equal(orderId, uniqueId, "Order ids do not match");
    //     assert.equal(total.toNumber(), utotal, "Order total is not matching");
    //     assert.equal(status, ustatus, "Order status is not matching");
    // });

    // it("second order should be assigned to driver", async () => {

    //     let responce = await foodz.assignToDriver(secondOrderId, { from: driverAccount });
    //     // console.log(responce.logs[0].args);

    //     let assignedDriverAddress = responce.logs[0].args.driverAddress;
    //     let newOrderStatus = responce.logs[0].args.orderStatus;

    //     // now retrieve the data. 
    //     let { orderId, userAddress, driverAddress, items, total, status } = await foodz.getOrderStatus(secondOrderId);

    //     assert.equal(driverAddress, assignedDriverAddress, "Driver address is asigned");
    //     assert.equal(status, newOrderStatus, "Order status is not matching");
    // });

    // it("second order should be delivered and status changed to delivered", async () => {
    //     let responce = await foodz.driverDelieveredOrder(secondOrderId, { from: driverAccount });

    //     // console.log(responce.logs[0].args);
    //     let newOrderStatus = responce.logs[0].args.orderStatus;

    //     // now retrieve the data.
    //     let { orderId, userAddress, driverAddress, items, total, status } = await foodz.getOrderStatus(secondOrderId);

    //     assert.equal(status, newOrderStatus, "Order status is not matching");
    // });

    // it("customer accepts second order delivery and pays and tips with token", async () => {

    //     // check balances of customer and driver and restaurant
    //     let preCustomerBalance = await web3.eth.getBalance(customerTwoAccount);
    //     let preCustomerToken = await foodz.getTokenBalanceOf(customerTwoAccount)
    //     let preDriverBalance = await web3.eth.getBalance(driverAccount);
    //     let preRestaurantBalance = await web3.eth.getBalance(restaurantAccount);

    //     console.log("User Balance", preCustomerBalance);
    //     console.log("Driver Balance", preDriverBalance);
    //     console.log("Restaurant Balance", preRestaurantBalance);
    //     console.log("User Token pre pay", preCustomerToken);

    //     let responce = await foodz.orderDeliveryConfirmed(secondOrderId, 5, 5, 2, { from: customerTwoAccount, value: web3.utils.toWei("4", "ether") });

    //     // console.log(responce);
    //     // console.log(responce.logs[0].args);

    //     let endCustomerBalance = await web3.eth.getBalance(customerTwoAccount);
    //     let postCustomerToken = await foodz.getTokenBalanceOf(customerTwoAccount)
    //     let endDriverBalance = await web3.eth.getBalance(driverAccount);
    //     let endRestaurantBalance = await web3.eth.getBalance(restaurantAccount);

    //     console.log("User new Balance", endCustomerBalance);
    //     console.log("Driver new Balance", endDriverBalance);
    //     console.log("Restaurant new Balance", endRestaurantBalance);
    //     console.log("User Token pre pay", postCustomerToken);

    //     // assert.equal(orderId, uniqueId, "Order ids do not match");
    //     // assert.equal(total.toNumber(), utotal, "Order total is not matching");
    //     // assert.equal(status, ustatus, "Order status is not matching");
    // });
});