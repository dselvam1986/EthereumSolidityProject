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

        // truffleAssert.eventEmitted(responce, 'User Registered', (ev) => {
        //     return ev == true;
        // });

        // now retrieve the data. 
        var expectedName = "Dino Sel";
        var expectedUsrType = "Customer";
        var expectedRating = 0;

        let result = await foodz.getUserInfo({ from: userAccount, value: 0 });

        // truffleAssert.eventEmitted(result, 'User Registered', (ev) => {
        //     return ev.name === expectedName && ev.usrType === expectedUsrType && ev.rating === expectedRating;
        // });
    });

    it("should register a new driver from driverAccount", async () => {
        let responce = await foodz.userRegister("John Ang", 1, 10, { from: driverAccount, value: web3.utils.toWei('10', 'ether') });

        // truffleAssert.eventEmitted(responce, 'Driver Registered', (ev) => {
        //     return ev == true;
        // });

        // // now retrieve the data. 
        // var expectedName = "John Ang";
        // var expectedUsrType = "Driver";
        // var expectedRating = 0;

        // let result = foodz.getUserInfo({ from: driverAccount});

        // truffleAssert.eventEmitted(result, 'User Registered', (ev) => {
        //     return ev.name === expectedName && ev.usrType === expectedUsrType && ev.rating === expectedRating;
        // });
    });

    it("should register a new restaurant", async () => {
        let responce = await foodz.registerRestaurant("Shakti Restaurant", "shakti", 10, { from: restaurantAccount, value: web3.utils.toWei('10', 'ether') });

        // truffleAssert.eventEmitted(responce, 'Restaurant Registered', (ev) => {
        //     return ev == true;
        // });

        // now retrieve the data. 
        // var expectedName = "John Ang";
        // var expectedUsrType = "Driver";
        // var expectedRating = 0;

        // let result = foodz.getUserInfo({ from: driverAccount });

        // truffleAssert.eventEmitted(result, 'User Registered', (ev) => {
        //     return ev.name === expectedName && ev.usrType === expectedUsrType && ev.rating === expectedRating;
        // });
    });

});