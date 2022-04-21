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

import { Contract, providers, utils } from "ethers";
import Head from "next/head";
import React, { useEffect, useRef, useState } from "react";
import Web3Modal from "web3modal";
import { abi, NFT_CONTRACT_ADDRESS } from "../constant";
import styles from "../styles/Home.module.css";

export default function Home() {
  const [walletConnected, setWalletConnected] = useState(false);
  const [presaleStarted, setPresaleStarted] = useState(false);
  const [presaleEnded, setPresaleEnded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [tokenIdsMinted, setTokenIdsMinted] = useState("0");

  const web3ModalRef = useRef();

  const presaleMint = async () => {
    try {
      const signer = await getProviderOrSigner(true);
      const whitelistContract = new Contract(NFT_CONTRACT_ADDRESS, abi, signer);
      const tx = await whitelistContract.presaleMint({
        value: utils.parseEther("0.01"),
      });
      setLoading(true);
      await tx.wait();
      setLoading(false);

      window.alert("You successfully minted a Crypto Dev!");
    } catch (err) {
      console.error(err);
    }
  };

  const publicMint = async () => {
    try {
      const signer = await getProviderOrSigner(true);
      const whitelistContract = new Contract(NFT_CONTRACT_ADDRESS, abi, signer);
      const tx = await whitelistContract.mint({
        value: utils.parseEther("0.01"),
      });
      setLoading(true);
      await tx.wait();
      setLoading(false);
      window.alert("You successfully minted a Crypto Dev!");
    } catch (err) {
      console.error(err);
    }
  };

  const connectWallet = async () => {
    try {
      await getProviderOrSigner();
      setWalletConnected(true);
    } catch (err) {
      console.error(err);
    }
  };

  const startPresale = async () => {
    try {
      const signer = await getProviderOrSigner(true);
      const whitelistContract = new Contract(NFT_CONTRACT_ADDRESS, abi, signer);
      const tx = await whitelistContract.startPresale();
      setLoading(true);
      await tx.wait();
      setLoading(false);
      await checkIfPresaleStarted();
    } catch (err) {
      console.error(err);
    }
  };

  const checkIfPresaleStarted = async () => {
    try {
      const provider = await getProviderOrSigner();
      const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, provider);
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

  const checkIfPresaleEnded = async () => {
    try {
      const provider = await getProviderOrSigner();
      const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, provider);
      const _presaleEnded = await nftContract.presaleEnded();

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

  const getOwner = async () => {
    try {
      const provider = await getProviderOrSigner();
      const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, provider);
      const _owner = await nftContract.owner();
      const signer = await getProviderOrSigner(true);
      const address = await signer.getAddress();
      if (address.toLowerCase() === _owner.toLowerCase()) {
        setIsOwner(true);
      }
    } catch (err) {
      console.error(err.message);
    }
  };

  const getTokenIdsMinted = async () => {
    try {
      const provider = await getProviderOrSigner();

      const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, provider);
      const _tokenIds = await nftContract.tokenIds();

      setTokenIdsMinted(_tokenIds.toString());
    } catch (err) {
      console.error(err);
    }
  };

  const getProviderOrSigner = async (needSigner = false) => {
    const provider = await web3ModalRef.current.connect();
    const web3Provider = new providers.Web3Provider(provider);

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

  useEffect(() => {
    if (!walletConnected) {
      web3ModalRef.current = new Web3Modal({
        network: "rinkeby",
        providerOptions: {},
        disableInjectedProvider: false,
      });
      connectWallet();

      const _presaleStarted = checkIfPresaleStarted();
      if (_presaleStarted) {
        checkIfPresaleEnded();
      }

      getTokenIdsMinted();

      const presaleEndedInterval = setInterval(async function () {
        const _presaleStarted = await checkIfPresaleStarted();
        if (_presaleStarted) {
          const _presaleEnded = await checkIfPresaleEnded();
          if (_presaleEnded) {
            clearInterval(presaleEndedInterval);
          }
        }
      }, 5 * 1000);

      setInterval(async function () {
        await getTokenIdsMinted();
      }, 5 * 1000);
    }
  }, [walletConnected]);

  const renderButton = () => {
    if (!walletConnected) {
      return (
        <button onClick={connectWallet} className={styles.button}>
          Connect your wallet
        </button>
      );
    }

    if (loading) {
      return <button className={styles.button}>Loading...</button>;
    }

    if (isOwner && !presaleStarted) {
      return (
        <button className={styles.button} onClick={startPresale}>
          Start Presale!
        </button>
      );
    }

    if (!presaleStarted) {
      return (
        <div>
          <div className={styles.description}>Presale hasnt started!</div>
        </div>
      );
    }

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
        Made with &#10084; by CryptoDevs
      </footer>
    </div>
  );
}
