  // SPDX-License-Identifier: MIT
  pragma solidity ^0.8.4;

  import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
  import "@openzeppelin/contracts/access/Ownable.sol";
  import "./IntWhitelist.sol";

/**
* @dev _baseTokenURI for computing {tokenURI}. If set, the resulting URI for each
* token will be the concatenation of the `baseURI` and the `tokenId`.
*/
  string _baseTokenURI; 

//   Whitelist contract instance
  IntWhitelist whitelist;

 // boolean to keep track of whether presale started or not
      bool public presaleStarted;

// timestamp for when presale would end
      uint256 public presaleEnded;

//  max number of CryptoDevs
      uint256 public maxTokenIds = 20;

//   total number of tokenIds minted
      uint256 public tokenIds;

// price of an Nft
  uint256 public _price = 0.1 ether;

 // _paused is used to pause the contract in case of an emergency
  bool  public _paused


  modifier onlyWhenNotPaused() {
      require(!_paused, 'Contract currently paused');
      _
  }

  contract CryptoDevs is ERC721Enumerable, Ownable{
      constructor(string memory baseURI, address whitelistContract ) ERC721('Crypto Devs', 'CD'){

    _baseTokenURI = baseURI;
    whitelist = IntWhitelist(whitelistContract)
      }

 /**
    * @dev startPresale starts a presale for the whitelisted addresses
 */
      function startPresale() public onlyOwner {
          _presaleStarted = true;
          // Set presaleEnded time as current timestamp + 5 minutes
          // Solidity has cool syntax for timestamps (seconds, minutes, hours, days, years)
          _presaleEnded = block.timestamp + 5 minutes;
      }


      /**
       * @dev presaleMint allows a user to mint one NFT per transaction during the presale.
       */
      function presaleMint() public payable onlyWhenNotPaused {
          require(_presaleStarted && block.timestamp < _presaleEnded, "Presale is not running");
          require(whitelist.whitelistedAddresses(msg.sender), "You are not whitelisted");
          require(tokenIds < maxTokenIds, "Exceeded maximum Crypto Devs supply");
          require(msg.value >= _price, "Ether sent is not correct");
          tokenIds += 1;
          //_safeMint is a safer version of the _mint function as it ensures that
          // if the address being minted to is a contract, then it knows how to deal with ERC721 tokens
          // If the address being minted to is not a contract, it works the same way as _mint
          _safeMint(msg.sender, tokenIds);
      }

      function mint() public payable {
          require(presaleStarted && block.timestamp >= presaleEnded)
             require(tokenId < maxTokenIds, 'Exceeded the limit');
          require(msg.value >= _price, 'Ether sent is not correct');
      }

    function _baseURI() internal view virtual override returns (string memory) {
          return _baseTokenURI;
      }
      
      /**
      * @dev withdraw sends all the ether in the contract
      * to the owner of the contract
       */
   function withdraw() public onlyOwner  {
          address _owner = owner();
          uint256 amount = address(this).balance;
          (bool sent, ) =  _owner.call{value: amount}("");
          require(sent, "Failed to send Ether");
      }

      /**
      * @dev setPaused makes the contract paused or unpaused
       */
      function setPaused(bool val) public onlyOwner {
          _paused = val;
      }
      
      receive() external payable()
      fallback()  external payable()
  }  