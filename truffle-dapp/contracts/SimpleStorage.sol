// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract SimpleStorage {

  uint256 storedData;

  event Change(string message, uint newVal);

  constructor (uint s) {
    storedData = s;
  }

  function set(uint x) public {
    require(x < 5000, 'Should be less than 5000');
    storedData = x;
    emit Change('set', x);
  }

  function get() public view returns (uint) {
    return storedData;
  }

}
