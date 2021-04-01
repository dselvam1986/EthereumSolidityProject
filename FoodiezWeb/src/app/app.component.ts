import { Component } from '@angular/core';
import { VirtualTimeScheduler } from 'rxjs';
import { EthcontractService } from './ethContract.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'app';
  public currentAccount :any;

  public registerAsUser = false;
  public registerAsRestaurant = false;

  public userViewOn = false;
  public userTypeCustomer = true;
  public restViewOn = false;

  userRegisterObj = {
    fname: '',
    lname: '',
    type: null,
    token: 0,
    nameError: false,
    typeError: false,
    tokenError: false
  }

  userViewObj = {
    name: '',
    type: '',
    token: 0,
    amount: 0,
    rating: 0
  }

  restaurantRegisterObj = {
    name:"",
    id: "",
    token: 0,
    nameError: false,
    idError: false, 
    tokenError: false
  }

  restViewObj = {
    id: '',
    items: 0,
    token: 0,
    amount: 0,
    rating: 0
  }

  menuItemRegisterObj = {
    name: "",
    type: "",
    price: ""
  }

  userTypeOption = [
    { id: 0, name: "Customer" },
    { id: 1, name: "Driver" },
  ];

  menuItemType = [
    { id: 0, name: "Appetizer" },
    { id: 1, name: "Main" },
    { id: 2, name: "Desert" }
  ];

  menuItemArray = [];

  constructor(private ethService: EthcontractService){}

  public async ngOnInit(){
    this.ethService.accountChanged.subscribe((value) => {
      if(value != '' && value != undefined && this.ethService.ethereumConnected){
        this.currentAccount = value;
        this.checkAddressRegistration(value);
        console.log(value);
      }
    });
  }

  public connectToMetaMask(){
    console.log("Connect to MetaMask clicked")
    this.ethService.connectToMetaMask();
  }

  public async getBalance(){
    let result = await this.ethService.getAccountsBalance();
    console.log(result);
  }

  /********************************Registration methods******************************************************************************************** */
  public registerAddress(type){
    if(type == 'user'){
      this.registerAsUser = true;
      this.registerAsRestaurant = false;
    }else{
      this.registerAsUser = false;
      this.registerAsRestaurant = true;
    }
  }
  public setUserType(typeNum){
    this.userRegisterObj.type = typeNum;
  }

  public setMenuType(typeNum) {
    this.menuItemRegisterObj.type = typeNum;
  }

  public async checkAddressRegistration(address){
    if (address != '' && address != undefined){
      await this.ethService.checkAddressRegistration(address, true).then(async (data)=>{
        if (data.usrName !=undefined){
          // user identified. update view to User view based on type
          // console.log(data);
          this.userViewObj.name = data.usrName;
          this.userViewObj.type = data.usrType;
          this.userViewObj.rating = data.rating;
          this.userViewObj.token = await this.ethService.getTokenBalance(address);
          
          if(data.usrType == 'Customer'){
            this.userTypeCustomer = true;
          }else{
            this.userTypeCustomer = false;
          }
          this.userViewOn = true;
          this.restViewOn = false;

        }else{
          await this.ethService.checkAddressRegistration(address, false).then( async(data) => {
            
            // let res = this.errorHandler(data);
            if (data.rId != undefined){
              // console.log(data);
              this.restViewObj.id = data.rId;
              this.restViewObj.items = data.rItems;
              this.restViewObj.rating = data.rating;
              this.restViewObj.token = await this.ethService.getTokenBalance(address);

              this.restViewOn = true;
              this.userViewOn = false;

            }else{
              let res = this.errorHandler(data);
              if (res.code == -32000){
                console.log("Restaurant not Found")
                this.userViewOn = false;
                this.restViewOn = false;
                this.registerAsRestaurant = false;
                this.registerAsUser = false;
              }
            }
            

            // restaurant identified. change view to restaurant.
          })
        }
      })
    }
  }

  public async getAddressDetails() {
    console.log(this.currentAccount);
    await this.ethService.checkAddressRegistration(this.currentAccount, true).then((data)=>{
      console.log(data);
    });
  }

  public async registerUser() {

    // check to make sure all fields are valid
    if (this.userRegisterObj.fname.trim() == '' || this.userRegisterObj.lname.trim() == ''){
      this.userRegisterObj.nameError = true;
      return;
    }

    if(this.userRegisterObj.type == null){
      this.userRegisterObj.typeError = true;
      return;
    }

    if(this.userRegisterObj.type == 1 && this.userRegisterObj.token < 10){
      this.userRegisterObj.tokenError = true;
      return;
    }

    let fullName = this.userRegisterObj.fname + this.userRegisterObj.lname;

    if (this.userRegisterObj.type == 1){
      await this.ethService.registerDriver(fullName, this.userRegisterObj.type, this.userRegisterObj.token).then( async (result) => {
        if(result.status != undefined){
          this.checkAddressRegistration(result.from);
        }
        console.log("Driver Registey", result);
      });
    }else{
      await this.ethService.registerUser(fullName, this.userRegisterObj.type, this.userRegisterObj.token).then( async (result) => {
        if (result.status != undefined) {
          this.checkAddressRegistration(result.from);
        }
        console.log("User Registry: ",result);
      });
    }
  }

  public async registerRestaurant(){
    if (this.restaurantRegisterObj.name.trim() == '' ) {
      this.restaurantRegisterObj.nameError = true;
      return;
    }

    if (this.restaurantRegisterObj.id.trim() == '') {
      this.restaurantRegisterObj.idError = true;
      return;
    }

    if (this.restaurantRegisterObj.token < 10) {
      this.restaurantRegisterObj.tokenError = true;
      return;
    }

    await this.ethService.registerRestaurant(this.restaurantRegisterObj.name, this.restaurantRegisterObj.id, this.restaurantRegisterObj.token).then( async (result)=>{
      if (result.status != undefined){
        console.log(result);
        this.checkAddressRegistration(result.from);
      }else{
        // error
        console.log("Error", result);
      }
    })
  }

  // public async createMenuItemRestaurant() {
  //   await this.ethService.registerRestaurant("Shakti Restaurant", "shakti", 10).then((result) => {
  //     console.log(result);
  //   })
  // }

  public errorHandler(errorMessage) {
    let string = errorMessage.toString();
    let objIndex = string.indexOf('{');
    let objStr = string.substring(objIndex).trim()
    return JSON.parse(objStr);
  }
}
