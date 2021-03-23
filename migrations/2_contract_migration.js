const FoodiezParent = artifacts.require("Foodiez");
const FoodiezRegistration = artifacts.require("FoodiezRegistration");
const FoodiezRegistrationInterface = artifacts.require("FoodiezRegistrationInterface");
const FoodiezOrders = artifacts.require("FoodiezOrders");
const FoodiezOrdersInterface = artifacts.require("FoodiezOrdersInterface");
const FoodiezHelpers = artifacts.require("FoodiezHelpers");
const FoodiezHelpersInterface = artifacts.require("FoodiezHelpersInterface");
const FoodiezToken = artifacts.require("FoodiezToken");

module.exports = async function (deployer) {

    let FToken;
    await deployer.deploy(FoodiezToken, "Foodiez", "FDZ", 10).then(function(instance){
        FToken = instance;
    });
    // console.log("Deployed Token", FToken.address);
    const FHelper = await deployer.deploy(FoodiezHelpers);
    // console.log("Deployed Helpers", FHelper.address);
    const FOrder = await deployer.deploy(FoodiezOrders);
    // console.log("Deployed Orders", FOrder.address);
    await deployer.deploy(FoodiezRegistration, FHelper.address, FOrder.address).then(function(instance){
        // console.log("Deployed Helper", FHelper.address);
        // console.log("Deployed Order", FOrder.address);
        // console.log("Deployed register", instance.address);
        // console.log("Deployed Token", FToken.address);
        deployer.deploy(FoodiezParent, instance.address, FHelper.address, FOrder.address, FToken.address);
    });
}