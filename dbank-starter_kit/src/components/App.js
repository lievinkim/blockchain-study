import { Tabs, Tab } from "react-bootstrap";
import dBank from "../abis/dBank.json";
import React, { Component } from "react";
import Token from "../abis/Token.json";
import dbank from "../dbank.png";
import Web3 from "web3";
import "./App.css";

//h0m3w0rk - add new tab to check accrued interest

class App extends Component {
  async componentWillMount() {
    await this.loadBlockchainData(this.props.dispatch);
  }

  async loadBlockchainData(dispatch) {
    //check if MetaMask exists
    //if MetaMask not exists push alert
    if (typeof window.ethereum !== "undefined") {
      //assign to values to variables: web3, netId, accounts
      //check if account is detected, then load balance&setStates, elsepush alert
      //in try block load contracts
      const web3 = new Web3(window.ethereum);
      const netId = await web3.eth.net.getId();
      const accounts = await web3.eth.getAccounts();

      if (typeof accounts[0] !== "undefined") {
        const balance = await web3.eth.getBalance(accounts[0]);
        this.setState({ account: accounts[0], balance: balance, web3: web3 });
      } else {
        window.alert("Please login with MetaMask.");
      }

      try {
        const token = new web3.eth.Contract(
          Token.abi,
          Token.networks[netId].address
        );
        const dbank = new web3.eth.Contract(
          dBank.abi,
          dBank.networks[netId].address
        );
        const dBankAddress = dBank.networks[netId].address;
        const interests = web3.utils.fromWei(
          await token.methods.balanceOf(this.state.account).call()
        );

        this.setState({
          token: token,
          dbank: dbank,
          dBankAddress: dBankAddress,
          interests: interests,
        });
      } catch (error) {
        console.log("Error", error);
        window.alert("Contracts not deployed to the current network");
      }
    } else {
      window.alert("Please install MetaMask.");
    }
  }

  async deposit(amount) {
    //check if this.state.dbank is ok
    //in try block call dBank deposit();
    if (this.state.dbank !== "undefined") {
      try {
        await this.state.dbank.methods.deposit().send({
          value: amount.toString(),
          from: this.state.account,
        });
      } catch (error) {
        console.log("Error, deposit: ", error);
      }
    }
  }

  async withdraw(e) {
    //prevent button from default click
    //check if this.state.dbank is ok
    //in try block call dBank withdraw();
    e.preventDefault();
    if (this.state.dbank !== "undefined") {
      try {
        await this.state.dbank.methods
          .withdraw()
          .send({ from: this.state.account });
      } catch (error) {
        console.log("Error, withdraw: ", error);
      }
    }
  }

  constructor(props) {
    super(props);
    this.state = {
      web3: "undefined",
      account: "",
      token: null,
      dbank: null,
      balance: 0,
      dBankAddress: null,
      interests: 0,
    };
  }

  render() {
    return (
      <div className="text-monospace">
        <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
          <a
            className="navbar-brand col-sm-3 col-md-2 mr-0"
            href="http://www.dappuniversity.com/bootcamp"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img src={dbank} className="App-logo" alt="logo" height="32" />
            <b>dBank</b>
          </a>
        </nav>
        <div className="container-fluid mt-5 text-center">
          <br></br>
          <h1>Welcome to dBank</h1>
          <h2>{this.state.account}</h2>
          <br></br>
          <div className="row">
            <main role="main" className="col-lg-12 d-flex text-center">
              <div className="content mr-auto ml-auto">
                <Tabs defaultActiveKey="profile" id="uncontrolled-tab-example">
                  <Tab eventKey="deposit" title="Deposit">
                    <div>
                      <br></br>
                      How much do you want to deposit?
                      <br></br>
                      (min. amount is 0.01 ETH)
                      <br></br>
                      (1 deposit is possible at the time)
                      <br></br>
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          let amount = this.depositAmount.value;
                          amount = amount * 10 ** 18; // convert to wei
                          this.deposit(amount);
                        }}
                      >
                        <div className="form-group mr-sm-2">
                          <br></br>
                          <input
                            id="depositAmount"
                            step="0.01"
                            type="number"
                            className="form-control form-control-md"
                            placeholder="amount..."
                            required
                            ref={(input) => {
                              this.depositAmount = input;
                            }}
                          />
                        </div>
                        <button type="submit" className="btn btn-primary">
                          DEPOSIT
                        </button>
                      </form>
                    </div>
                  </Tab>
                  <Tab eventKey="withdraw" title="Withdraw">
                    <br></br>
                    Do you want to withdraw + take interests?
                    <br></br>
                    <br></br>
                    <div>
                      <button
                        type="submit"
                        className="btn btn-primary"
                        onClick={(e) => this.withdraw(e)}
                      >
                        WITHDRAW
                      </button>
                    </div>
                  </Tab>
                  <Tab eventKey="interests" title="Interests">
                    <br></br>
                    Below is the accrued interests you earned.
                    <br></br>
                    <br></br>
                    <div>
                      <h5>{this.state.interests}</h5>
                    </div>
                  </Tab>
                </Tabs>
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
