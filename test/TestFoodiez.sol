pragma solidity 0.7.6;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
// import "../contracts/MetaCoin.sol";
import "../contracts/parent.sol";
import "../contracts/registration.sol";
import "../contracts/orders.sol";
import "../contracts/helpers.sol";
import "../contracts/token.sol";

contract TestFoodiez {

    Foodiez foodz;
    FoodiezRegistration fdregister;
    FoodiezOrders fdorders;
    FoodiezHelpers fdhelpers;
    FoodiezToken fdtoken;

    function beforeEach() public {

        fdtoken = FoodiezToken(DeployedAddresses.FoodiezToken());
        fdhelpers = FoodiezHelpers(DeployedAddresses.FoodiezHelpers());
        fdorders = FoodiezOrders(DeployedAddresses.FoodiezOrders());
        fdregister = FoodiezRegistration(DeployedAddresses.FoodiezRegistration());
        foodz = Foodiez(DeployedAddresses.Foodiez());
    }
    
    function testInitialUserRegistration() public {
        // string memory expectedName = "Dinesh";
        // string memory expectedUsrType = "Customer";
        // uint expectedRating = 0;

        // foodz.userRegister("Dinesh", 0, 5);

        // string memory name; address userAdd; string memory usrType; uint rating;

        // (name, userAdd, usrType, rating) = foodz.getUserInfo();
        
        Assert.equal(DeployedAddresses.Foodiez(),fdregister.parentContractAddress, "Parent address matches" );

        // Assert.equal(name,expectedName, "Expected name matches" );
        // Assert.equal(usrType,expectedUsrType, "Expected User Type matches" );
        // Assert.equal(rating,expectedRating, "Expected rating matches" );
    }

}
