// import Head from "next/head";
// // import Image from "next/image";
// import styles from "../styles/Home.module.css";
// import { useEffect, useState, useRef } from "react";
// import Web3Modal from "web3modal";
// import { providers, Contract, utils } from "ethers";
// import { abi, NFT_CONTRACT_ADDRESS } from "../constant";

// export default function Home() {
//   const [isOwner, setIsOwner] = useState(false);
//   const [walletConnected, setWalletConnected] = useState(false);
//   const [presaleStarted, setPresaleStarted] = useState(false);
//   const [presaleEnded, setPresaleEnded] = useState(false);
//   const web3ModalRef = useRef();

//   const getProviderOrSigner = async (needSigner = false) => {
//     //gain access to the provider/signer and connect wallet
//     const provider = await web3ModalRef.current.connect();
//     const web3Provider = new providers.Web3Provider(provider);

//     //if not connected on rinkeby, switch to rinkeby
//     const { chainId } = await web3Provider.getNetwork();
//     if (chainId !== 4) {
//       window.alert("Please switch to the rinkeby network");
//       throw new Error("Incorrect network");
//     }

//     if (needSigner) {
//       const signer = web3Provider.getSigner();
//       return signer;
//     }

//     return web3Provider;
//   };

//   const getOwner = async () => {
//     try {
//       const signer = await getProviderOrSigner(true);

//       //an instance of the nft contract
//       const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, signer);

//       const owner = await nftContract.owner();

//       const userAddress = await signer.getAddress();

//       if (owner.toLowerCase() === userAddress.toLowerCase()) {
//         setIsOwner(true);
//       }
//     } catch (error) {
//       console.error();
//     }
//   };

//   const connectWallet = async () => {
//     try {
//       // Get the provider from web3Modal, which in this case is MetaMask
//       await getProviderOrSigner();
//       setWalletConnected(true);
//     } catch (error) {
//       console.error(error.msg);
//     }
//   };

//   //   const startPresale = async () => {
//   //     try {
//   //       const signer = await getProviderOrSigner(true);

//   //       const whitelistContract = new Contract(abi, NFT_CONTRACT_ADDRESS, signer);

//   //       const txn = await whitelistContract.startPresale();
//   //       await txn.wait();
//   //       setPresaleStarted(true);
//   //       await checkIfPresaleStarted();
//   //     } catch (error) {
//   //       console.error(error);
//   //     }
//   //   };

//   const startPresale = async () => {
//     try {
//       // We need a Signer here since this is a 'write' transaction.
//       const signer = await getProviderOrSigner(true);
//       // Create a new instance of the Contract with a Signer, which allows
//       // update methods
//       const whitelistContract = new Contract(NFT_CONTRACT_ADDRESS, abi, signer);
//       // call the startPresale from the contract
//       const tx = await whitelistContract.startPresale();
//       setLoading(true);
//       // wait for the transaction to get mined
//       await tx.wait();
//       setLoading(false);
//       // set the presale started to true
//       await checkIfPresaleStarted();
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   const checkIfPresaleStarted = async () => {
//     try {
//       // Get the provider from web3Modal, which in this is MetaMask
//       // No need for the Signer here, as we are only reading state from the blockchain
//       const provider = await getProviderOrSigner();

//       //get an instance of your nft contract
//       const nftContract = new Contract(abi, NFT_CONTRACT_ADDRESS, provider);

//       const isPresaleStarted = await nftContract.presaleStarted();
//       if (!presaleStarted) {
//         await getOwner();
//       }
//       setPresaleStarted(isPresaleStarted);

//       return isPresaleStarted; //because states run async, i'm using return which is runs sync
//     } catch (error) {
//       console.error();
//       return false;
//     }
//   };
//   const checkIfPresaleEnded = async () => {
//     try {
//       // Get the provider from web3Modal, which in this is MetaMask
//       // No need for the Signer here, as we are only reading state from the blockchain
//       const provider = await getProviderOrSigner();

//       //get an instance of your nft contract
//       const nftContract = new Contract(abi, NFT_CONTRACT_ADDRESS, provider);

//       //this will return a BigNum, presaleEnded is a unit256
//       const presaleEndTime = await nftContract.presaleEnded();
//       //this will return a timestamp in seconds
//       const currentTimeInSeconds = Date.now() / 1000; //return date,now which is in millisecs to secs by / with 1000

//       //check if presaleIsEnded by comparing if presaleEndTime < currentTime. lt = less than for b
//       const hasPresaleEnded = presaleEndTime.lt(
//         Math.floor(currentTimeInSeconds)
//       );

//       setPresaleEnded(hasPresaleEnded);
//     } catch (error) {
//       console.error();
//     }
//   };

//   const onPageLoad = async () => {
//     await connectWallet();
//     await getOwner();
//     const presaleStarted = await checkIfPresaleStarted();
//     if (presaleStarted) {
//       await checkIfPresaleEnded();
//     }
//   };

//   useEffect(() => {
//     if (!walletConnected) {
//       web3ModalRef.current = new Web3Modal({
//         network: "rinkeby",
//         providerOptions: {},
//         disableInjectedProvider: false,
//       });

//       onPageLoad();
//     }
//   });
//   function renderBody() {
//     if (!walletConnected) {
//       return (
//         //render a connect wallet button to connect wallet
//         <button onClick={connectWallet} className={styles.button}>
//           Connect Wallet
//         </button>
//       );
//     }

//     if (isOwner && !presaleStarted) {
//       console.log(isOwner, presaleStarted);
//       console.log(userAddress, "this nft user");

//       return (
//         //render a start presale button to start the presale.
//         <button onClick={startPresale} className={styles.button}>
//           Start presale
//         </button>
//       );
//     }

//     if (!presaleStarted) {
//       return (
//         //display a come back later msg.
//         <div>
//           <span className={styles.description}>
//             Presale is yet to start, please come back later
//           </span>
//         </div>
//       );
//     }

//     if (presaleStarted && !presaleEnded) {
//       //allow users to mint at presale if whitelisted
//       return (
//         <div>
//           <span className={styles.description}>
//             Presale has started!, If your address is whitlisted, you can mint a
//             CryptoDev!
//           </span>
//           <button className={styles.button}>Presale Mint</button>
//         </div>
//       );
//     }

//     if (presaleEnded) {
//       //allow users to mint at public mint
//       return (
//         <div>
//           <span className={styles.description}>
//             Presale has ended!, You can mint a CryptoDev at public mint
//           </span>
//           <button className={styles.button}>Presale Mint</button>
//         </div>
//       );
//     }
//   }
//   return (
//     <div className={styles.container}>
//       <Head>
//         <title>Crypto Devs Nft</title>
//         <meta name="description" content="Generated by create next app" />
//         <link rel="icon" href="/favicon.ico" />
//       </Head>

//       <main className={styles.main}>{renderBody()}</main>

//       <footer className={styles.footer}></footer>
//     </div>
//   );
// }

import { Contract, providers, utils } from "ethers";
import Head from "next/head";
import React, { useEffect, useRef, useState } from "react";
import Web3Modal from "web3modal";
import { abi, NFT_CONTRACT_ADDRESS } from "../constant";
import styles from "../styles/Home.module.css";

export default function Home() {
  // walletConnected keep track of whether the user's wallet is connected or not
  const [walletConnected, setWalletConnected] = useState(false);
  // presaleStarted keeps track of whether the presale has started or not
  const [presaleStarted, setPresaleStarted] = useState(false);
  // presaleEnded keeps track of whether the presale ended
  const [presaleEnded, setPresaleEnded] = useState(false);
  // loading is set to true when we are waiting for a transaction to get mined
  const [loading, setLoading] = useState(false);
  // checks if the currently connected MetaMask wallet is the owner of the contract
  const [isOwner, setIsOwner] = useState(false);
  // tokenIdsMinted keeps track of the number of tokenIds that have been minted
  const [tokenIdsMinted, setTokenIdsMinted] = useState("0");
  // Create a reference to the Web3 Modal (used for connecting to Metamask) which persists as long as the page is open
  const web3ModalRef = useRef();

  /**
   * presaleMint: Mint an NFT during the presale
   */
  const presaleMint = async () => {
    try {
      // We need a Signer here since this is a 'write' transaction.
      const signer = await getProviderOrSigner(true);
      // Create a new instance of the Contract with a Signer, which allows
      // update methods
      const whitelistContract = new Contract(NFT_CONTRACT_ADDRESS, abi, signer);
      // call the presaleMint from the contract, only whitelisted addresses would be able to mint
      const tx = await whitelistContract.presaleMint({
        // value signifies the cost of one crypto dev which is "0.01" eth.
        // We are parsing `0.01` string to ether using the utils library from ethers.js
        value: utils.parseEther("0.01"),
      });
      setLoading(true);
      // wait for the transaction to get mined
      await tx.wait();
      setLoading(false);
      window.alert("You successfully minted a Crypto Dev!");
    } catch (err) {
      console.error(err);
    }
  };

  /**
   * publicMint: Mint an NFT after the presale
   */
  const publicMint = async () => {
    try {
      // We need a Signer here since this is a 'write' transaction.
      const signer = await getProviderOrSigner(true);
      // Create a new instance of the Contract with a Signer, which allows
      // update methods
      const whitelistContract = new Contract(NFT_CONTRACT_ADDRESS, abi, signer);
      // call the mint from the contract to mint the Crypto Dev
      const tx = await whitelistContract.mint({
        // value signifies the cost of one crypto dev which is "0.01" eth.
        // We are parsing `0.01` string to ether using the utils library from ethers.js
        value: utils.parseEther("0.01"),
      });
      setLoading(true);
      // wait for the transaction to get mined
      await tx.wait();
      setLoading(false);
      window.alert("You successfully minted a Crypto Dev!");
    } catch (err) {
      console.error(err);
    }
  };

  /*
      connectWallet: Connects the MetaMask wallet
    */
  const connectWallet = async () => {
    try {
      // Get the provider from web3Modal, which in our case is MetaMask
      // When used for the first time, it prompts the user to connect their wallet
      await getProviderOrSigner();
      setWalletConnected(true);
    } catch (err) {
      console.error(err);
    }
  };

  /**
   * startPresale: starts the presale for the NFT Collection
   */
  const startPresale = async () => {
    try {
      // We need a Signer here since this is a 'write' transaction.
      const signer = await getProviderOrSigner(true);
      // Create a new instance of the Contract with a Signer, which allows
      // update methods
      const whitelistContract = new Contract(NFT_CONTRACT_ADDRESS, abi, signer);
      // call the startPresale from the contract
      const tx = await whitelistContract.startPresale();
      setLoading(true);
      // wait for the transaction to get mined
      await tx.wait();
      setLoading(false);
      // set the presale started to true
      await checkIfPresaleStarted();
    } catch (err) {
      console.error(err);
    }
  };

  /**
   * checkIfPresaleStarted: checks if the presale has started by quering the `presaleStarted`
   * variable in the contract
   */
  const checkIfPresaleStarted = async () => {
    try {
      // Get the provider from web3Modal, which in our case is MetaMask
      // No need for the Signer here, as we are only reading state from the blockchain
      const provider = await getProviderOrSigner();
      // We connect to the Contract using a Provider, so we will only
      // have read-only access to the Contract
      const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, provider);
      // call the presaleStarted from the contract
      const _presaleStarted = await nftContract.presaleStarted();
      if (!_presaleStarted) {
        await getOwner();
      }
      setPresaleStarted(_presaleStarted);
      return _presaleStarted;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  /**
   * checkIfPresaleEnded: checks if the presale has ended by quering the `presaleEnded`
   * variable in the contract
   */
  const checkIfPresaleEnded = async () => {
    try {
      // Get the provider from web3Modal, which in our case is MetaMask
      // No need for the Signer here, as we are only reading state from the blockchain
      const provider = await getProviderOrSigner();
      // We connect to the Contract using a Provider, so we will only
      // have read-only access to the Contract
      const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, provider);
      // call the presaleEnded from the contract
      const _presaleEnded = await nftContract.presaleEnded();
      // _presaleEnded is a Big Number, so we are using the lt(less than function) instead of `<`
      // Date.now()/1000 returns the current time in seconds
      // We compare if the _presaleEnded timestamp is less than the current time
      // which means presale has ended
      const hasEnded = _presaleEnded.lt(Math.floor(Date.now() / 1000));
      if (hasEnded) {
        setPresaleEnded(true);
      } else {
        setPresaleEnded(false);
      }
      return hasEnded;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  /**
   * getOwner: calls the contract to retrieve the owner
   */
  const getOwner = async () => {
    try {
      // Get the provider from web3Modal, which in our case is MetaMask
      // No need for the Signer here, as we are only reading state from the blockchain
      const provider = await getProviderOrSigner();
      // We connect to the Contract using a Provider, so we will only
      // have read-only access to the Contract
      const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, provider);
      // call the owner function from the contract
      const _owner = await nftContract.owner();
      // We will get the signer now to extract the address of the currently connected MetaMask account
      const signer = await getProviderOrSigner(true);
      // Get the address associated to the signer which is connected to  MetaMask
      const address = await signer.getAddress();
      if (address.toLowerCase() === _owner.toLowerCase()) {
        setIsOwner(true);
      }
    } catch (err) {
      console.error(err.message);
    }
  };

  /**
   * getTokenIdsMinted: gets the number of tokenIds that have been minted
   */
  const getTokenIdsMinted = async () => {
    try {
      // Get the provider from web3Modal, which in our case is MetaMask
      // No need for the Signer here, as we are only reading state from the blockchain
      const provider = await getProviderOrSigner();
      // We connect to the Contract using a Provider, so we will only
      // have read-only access to the Contract
      const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, provider);
      // call the tokenIds from the contract
      const _tokenIds = await nftContract.tokenIds();
      //_tokenIds is a `Big Number`. We need to convert the Big Number to a string
      setTokenIdsMinted(_tokenIds.toString());
    } catch (err) {
      console.error(err);
    }
  };

  /**
   * Returns a Provider or Signer object representing the Ethereum RPC with or without the
   * signing capabilities of metamask attached
   *
   * A `Provider` is needed to interact with the blockchain - reading transactions, reading balances, reading state, etc.
   *
   * A `Signer` is a special type of Provider used in case a `write` transaction needs to be made to the blockchain, which involves the connected account
   * needing to make a digital signature to authorize the transaction being sent. Metamask exposes a Signer API to allow your website to
   * request signatures from the user using Signer functions.
   *
   * @param {*} needSigner - True if you need the signer, default false otherwise
   */
  const getProviderOrSigner = async (needSigner = false) => {
    // Connect to Metamask
    // Since we store `web3Modal` as a reference, we need to access the `current` value to get access to the underlying object
    const provider = await web3ModalRef.current.connect();
    const web3Provider = new providers.Web3Provider(provider);

    // If user is not connected to the Rinkeby network, let them know and throw an error
    const { chainId } = await web3Provider.getNetwork();
    if (chainId !== 4) {
      window.alert("Change the network to Rinkeby");
      throw new Error("Change network to Rinkeby");
    }

    if (needSigner) {
      const signer = web3Provider.getSigner();
      return signer;
    }
    return web3Provider;
  };

  // useEffects are used to react to changes in state of the website
  // The array at the end of function call represents what state changes will trigger this effect
  // In this case, whenever the value of `walletConnected` changes - this effect will be called
  useEffect(() => {
    // if wallet is not connected, create a new instance of Web3Modal and connect the MetaMask wallet
    if (!walletConnected) {
      // Assign the Web3Modal class to the reference object by setting it's `current` value
      // The `current` value is persisted throughout as long as this page is open
      web3ModalRef.current = new Web3Modal({
        network: "rinkeby",
        providerOptions: {},
        disableInjectedProvider: false,
      });
      connectWallet();

      // Check if presale has started and ended
      const _presaleStarted = checkIfPresaleStarted();
      if (_presaleStarted) {
        checkIfPresaleEnded();
      }

      getTokenIdsMinted();

      // Set an interval which gets called every 5 seconds to check presale has ended
      const presaleEndedInterval = setInterval(async function () {
        const _presaleStarted = await checkIfPresaleStarted();
        if (_presaleStarted) {
          const _presaleEnded = await checkIfPresaleEnded();
          if (_presaleEnded) {
            clearInterval(presaleEndedInterval);
          }
        }
      }, 5 * 1000);

      // set an interval to get the number of token Ids minted every 5 seconds
      setInterval(async function () {
        await getTokenIdsMinted();
      }, 5 * 1000);
    }
  }, [walletConnected]);

  /*
      renderButton: Returns a button based on the state of the dapp
    */
  const renderButton = () => {
    // If wallet is not connected, return a button which allows them to connect their wllet
    if (!walletConnected) {
      return (
        <button onClick={connectWallet} className={styles.button}>
          Connect your wallet
        </button>
      );
    }

    // If we are currently waiting for something, return a loading button
    if (loading) {
      return <button className={styles.button}>Loading...</button>;
    }

    // If connected user is the owner, and presale hasnt started yet, allow them to start the presale
    if (isOwner && !presaleStarted) {
      return (
        <button className={styles.button} onClick={startPresale}>
          Start Presale!
        </button>
      );
    }

    // If connected user is not the owner but presale hasn't started yet, tell them that
    if (!presaleStarted) {
      return (
        <div>
          <div className={styles.description}>Presale hasnt started!</div>
        </div>
      );
    }

    // If presale started, but hasn't ended yet, allow for minting during the presale period
    if (presaleStarted && !presaleEnded) {
      return (
        <div>
          <div className={styles.description}>
            Presale has started!!! If your address is whitelisted, Mint a Crypto
            Dev 🥳
          </div>
          <button className={styles.button} onClick={presaleMint}>
            Presale Mint 🚀
          </button>
        </div>
      );
    }

    // If presale started and has ended, its time for public minting
    if (presaleStarted && presaleEnded) {
      return (
        <button className={styles.button} onClick={publicMint}>
          Public Mint 🚀
        </button>
      );
    }
  };

  return (
    <div>
      <Head>
        <title>Crypto Devs</title>
        <meta name="description" content="Whitelist-Dapp" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.main}>
        <div>
          <h1 className={styles.title}>Welcome to Crypto Devs!</h1>
          <div className={styles.description}>
            Its an NFT collection for developers in Crypto.
          </div>
          <div className={styles.description}>
            {tokenIdsMinted}/20 have been minted
          </div>
          {renderButton()}
        </div>
        <div>
          <img className={styles.image} src="./cryptodevs/0.svg" />
        </div>
      </div>

      <footer className={styles.footer}>
        Made with &#10084; by Crypto Devs
      </footer>
    </div>
  );
}
