const Foodiez = artifacts.require('Foodiez');
const FoodiezToken = artifacts.require('FoodiezToken');
const AssertionError = require('assertion-error');
const { iteratee } = require('lodash');
const truffleAssert = require('truffle-assertions');

contract('FoodiezTest', (accounts) => {
    let foodz;
    let token;
    let customer;
    let driver;
    let restaurant;
    const FoodzAccount = accounts[0];
    const userAccount = accounts[1];
    const driverAccount = accounts[2];
    const restaurantAccount = accounts[3];

    web3.eth.defaultAccount = web3.eth.accounts[0];

    beforeEach(async () => {
        foodz = await Foodiez.deployed();
        token = await FoodiezToken.deployed();

        // approve foodz to allow transfer of tokens
        token.approve(foodz.address, 100, { from: FoodzAccount });
    });

    it("should register a new customer from userAccount", async () => {
        let responce = await foodz.userRegister("Dino Sel", 0, 0, { from: userAccount });

        // now retrieve the data. 
        var expectedName = "Dino Sel";
        var expectedUsrType = "Customer";
        var expectedRating = 0;

        let { usrName, usrAddress, usrType, rating } = await foodz.getUserInfo(userAccount);

        // console.log(usrName, usrAddress, usrType, rating);
        assert.equal(usrName, expectedName, "User name should be Dino Sel");
        assert.equal(usrType, expectedUsrType, "User type should be Customer");
        assert.equal(rating.toNumber(), expectedRating, "User rating should be 0");
        // truffleAssert.eventEmitted(responce, "User registered", (ev)=>{
        //     return ev.usrName == expectedName && ev.usrType == expectedUsrType;
        // });

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

    it("should register a new restaurant", async () => {
        let responce = await foodz.registerRestaurant("Shakti Restaurant", "shakti", 10, { from: restaurantAccount, value: web3.utils.toWei('10', 'ether') });

        // now retrieve the data. 
        let { rId, rAddress, rItems, rating } = await foodz.getrestaurantInfo(restaurantAccount);
        assert.equal(rId, "shakti", "Restaurant Id not matching");
        assert.equal(rating.toNumber(), 0, "Restaurant rating should be 0");
    });

    it("should add item to restaurant", async () => {
        let responce = await foodz.addMenuItems("Chicken Sixty Five", 0, 3, { from: restaurantAccount });

        // now retrieve the data. 3000000000000000000
        let result = await foodz.getRestaurantMenu(restaurantAccount, 0);
        // console.log(result);

        let { itemName, itemType, itemPrice } = await foodz.getRestaurantMenu(restaurantAccount, 0);
        assert.equal(itemName, "Chicken Sixty Five", "Item name is not matching");
        assert.equal(itemType, "Appetizer", "Item type is not matching");
        // assert.equal(itemPrice.toNumber(), 3, "Item price is not matching");
    });

    // placing orders

    it("customer should be able to place an order", async () => {
        // let { uOrderId, orderItemName, orderTotal, orderStatus } = await foodz.placeOrder(restaurantAccount, 0, 0, { from: userAccount, value: 3});

        let responce = await foodz.placeOrder(restaurantAccount, 0, 0, { from: userAccount, value: 3 });

        // console.log(responce.logs[0].args);
        let uniqueId = responce.logs[0].args.orderId;
        let utotal = responce.logs[0].args.total.toNumber();
        let ustatus = responce.logs[0].args.orderStatus;

        // now retrieve the data. 3000000000000000000
        let { orderId, userAddress, driverAddress, items, total, status } = await foodz.getOrderStatus(uniqueId);

        assert.equal(orderId, uniqueId, "Order ids do not match");
        assert.equal(total.toNumber(), utotal, "Order total is not matching");
        assert.equal(status, ustatus, "Order status is not matching");
    });

});