import Head from "next/head";
// import Image from "next/image";
import styles from "../styles/Home.module.css";
import { useEffect, useState, useRef } from "react";
import Web3Modal from "web3modal";
import { providers, Contract, utils } from "ethers";
import { abi, NFT_CONTRACT_ADDRESS } from "../constant";

// export default function Home() {
//   const [isOwner, setIsOwner] = useState(false);
//   const [walletConnected, setWalletConnected] = useState(false);
//   const [presaleStarted, setPresaleStarted] = useState(false);
//   const [presaleEnded, setPresaleEnded] = useState(false);
//   const web3ModalRef = useRef();

//   const getOwner = async () => {
//     try {
//       const signer = await getProviderOrSigner(true);

//       //an instance of the nft contract
//       const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, signer);

//       const owner = await nftContract.owner();
//       console.log(owner, "this nft owner");

//       const userAddress = await signer.getAddress();
//       console.log(userAddress, "this nft user");

//       if (owner.toLowerCase() === userAddress.toLowerCase()) {
//         setIsOwner(true);
//       }
//     } catch (error) {
//       console.error(error.msg);
//     }
//   };

//   const getProviderOrSigner = async (needSigner = false) => {
//     // Connect to Metamask
//     // Since we store `web3Modal` as a reference, we need to access the `current` value to get access to the underlying object
//     const provider = await web3ModalRef.current.connect();
//     const web3Provider = new providers.Web3Provider(provider);

//     // If user is not connected to the Rinkeby network, let them know and throw an error
//     const { chainId } = await web3Provider.getNetwork();
//     if (chainId !== 4) {
//       window.alert("Change the network to Rinkeby");
//       throw new Error("Change network to Rinkeby");
//     }

//     if (needSIgner) {
//       const signer = web3Provider.getSigner();
//       return signer;
//     }
//     return web3Provider;
//   };

//   const connectWallet = async () => {
//     try {
//       await getProviderOrSigner();
//       setWalletConnected(true);
//     } catch (error) {
//       console.error(error.msg);
//     }
//   };

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
//     } catch (error) {
//       console.error(error.msg);
//     }
//   };

//   const checkIfPresaleStarted = async () => {
//     try {
//       //get provider
//       const provider = await getProviderOrSigner();
//       const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, provider);

//       const isPresaleStarted = await nftContract.presaleStarted();
//       if (!isPresaleStarted) {
//         await getOwner();
//       }
//       setPresaleStarted(isPresaleStarted);
//     } catch (error) {
//       console.error(error.msg);
//     }
//   };

//   //   const checkIfPresaleEnded = async () => {
//   //     try {
//   //       const provider = await getProviderOrSigner();
//   //       const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, provider);
//   //       const isPresaleEnded = await nftContract.presaleEnded();

//   //       const hasEnded = isPresaleEnded.lt(Math.floor(date.now() / 1000));
//   //       if (hasEnded) {
//   //         setPresaleEnded(true);
//   //       } else {
//   //         setPresaleEnded(false);
//   //       }
//   //       return hasEnded;
//   //     } catch (error) {
//   //       console.error(error.msg);
//   //       return false;
//   //     }
//   //   };

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
//     // if wallet is not connected, create a new instance of Web3Modal and connect the MetaMask wallet
//     if (!walletConnected) {
//       // Assign the Web3Modal class to the reference object by setting it's `current` value
//       // The `current` value is persisted throughout as long as this page is open
//       web3ModalRef.current = new Web3Modal({
//         network: "rinkeby",
//         providerOptions: {},
//         disableInjectedProvider: false,
//       });

//       onPageLoad();
//     }
//   });

//   const renderBody = () => {
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
//     //   0x6433812ddee51e2cbb2fbe45e97979daec613f12;
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
//   };

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

export default function Home() {
  const [isOwner, setIsOwner] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);
  const [presaleStarted, setPresaleStarted] = useState(false);
  const [presaleEnded, setPresaleEnded] = useState(false);
  const web3ModalRef = useRef();

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
  /**
   * getOwner: calls the contract to retrieve the owner
   */
  const getOwner1 = async () => {
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

  const getOwner = async () => {
    try {
      const signer = await getProviderOrSigner(true);
      const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, signer);

      const _owner = await nftContract.owner();
      const userAddress = await signer.getAddress();

      if (_owner.toLowerCase() === userAddress.toLowerCase()) {
        setIsOwner(true);
      }
    } catch (error) {
      console.error(error);
    }
  };

  /**
   * checkIfPresaleStarted: checks if the presale has started by quering the `presaleStarted`
   * variable in the contract
   */
  const checkIfPresaleStarted1 = async () => {
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

  const checkIfPresaleStarted = async () => {
    try {
      const provider = await getProviderOrSigner();

      // get an instance of nft contract
      const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, provider);
      const isPresaleStarted = await nftContract.presaleStarted();
      setPresaleStarted(isPresaleStarted);
    } catch (error) {
      console.error(error);
    }
  };

  const checkIfPresaleEnded1 = async () => {
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

  const checkIfPresaleEnded = async () => {
    try {
      // Get the provider from web3Modal, which in this is MetaMask
      // No need for the Signer here, as we are only reading state from the blockchain
      const provider = await getProviderOrSigner();

      //get an instance of your nft contract
      const nftContract = new Contract(abi, NFT_CONTRACT_ADDRESS, provider);

      //this will return a BigNum, presaleEnded is a unit256
      const presaleEndTime = await nftContract.presaleEnded();
      //this will return a timestamp in seconds
      const currentTimeInSeconds = Date.now() / 1000; //return date,now which is in millisecs to secs by / with 1000

      //check if presaleIsEnded by comparing if presaleEndTime < currentTime. lt = less than for b
      const hasPresaleEnded = presaleEndTime.lt(
        Math.floor(currentTimeInSeconds)
      );

      setPresaleEnded(hasPresaleEnded);
    } catch (error) {
      console.error();
    }
  };
  const startPresale = async () => {
    try {
      const signer = getProviderOrSigner(true);
      const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, signer);
      const txn = await nftContract.startPresale();
      await txn.wait();
      setPresaleStarted(true);
    } catch (error) {
      console.error(error);
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

  const onPageLoad = async () => {
    await connectWallet();
    await getOwner();
    const presaleStarted = await checkIfPresaleStarted();

    if (presaleStarted) {
      await checkIfPresaleEnded();
    }
  };

  useEffect(() => {
    if (!walletConnected) {
      web3ModalRef.current = new Web3Modal({
        network: "rinkeby",
        providerOptions: {},
        disableInjectedProvider: false,
      });
      onPageLoad();
    }
  });

  const renderBody = () => {
    if (!walletConnected) {
      return (
        //render a connect wallet button to connect wallet
        <button onClick={connectWallet} className={styles.button}>
          Connect Wallet
        </button>
      );
    }

    if (isOwner && !presaleStarted) {
      console.log(isOwner, presaleStarted);
      console.log(userAddress, "this nft user");

      return (
        //render a start presale button to start the presale.
        <button onClick={startPresale} className={styles.button}>
          Start presale
        </button>
      );
    }

    if (!presaleStarted) {
      return (
        //display a come back later msg.
        <div>
          <span className={styles.description}>
            Presale is yet to start, please come back later
          </span>
        </div>
      );
    }

    if (presaleStarted && !presaleEnded) {
      //allow users to mint at presale if whitelisted
      return (
        <div>
          <span className={styles.description}>
            Presale has started!, If your address is whitlisted, you can mint a
            CryptoDev!
          </span>
          <button className={styles.button}>Presale Mint</button>
        </div>
      );
    }

    if (presaleEnded) {
      //allow users to mint at public mint
      return (
        <div>
          <span className={styles.description}>
            Presale has ended!, You can mint a CryptoDev at public mint{" "}
          </span>
          <button className={styles.button}>Presale Mint</button>
        </div>
      );
    }
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Crypto Devs Nft</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>{renderBody()}</main>

      <footer className={styles.footer}></footer>
    </div>
  );
}
