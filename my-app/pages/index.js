import Head from "next/head";
import { Contract, providers, utils } from "ethers";
import React, { useEffect, useRef, useState } from "react";
import Web3Modal from "web3modal";
import Image from "next/image";
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
  // checks if the currently connected MetaMask wallet is the owner of the
  // contract
  const [isOwner, setIsOwner] = useState(false);
  // tokenIdsMinted keeps track of the number of tokenIds that have been minted
  const [tokenIdsMinted, setTokenIdsMinted] = useState("0");
  // Create a reference to the Web3 Modal (used for connecting to Metamask) which
  // persists as long as the page is open
  const web3ModalRef = useRef();

  const getTokenIdsMinted = async () => {
    try {
      // Get the provider from web3Modal, which in our case is MetaMask No need for
      // the Signer here, as we are only reading state from the blockchain
      const provider = await getProviderOrSigner();
      // We connect to the Contract using a Provider, so we will only have read-only
      // access to the Contract
      const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, provider);
      // call the tokenIds from the contract
      const _tokenIds = await nftContract.tokenIds();
      //_tokenIds is a `Big Number`. We need to convert the Big Number to a string
      setTokenIdsMinted(_tokenIds.toString());
    } catch (err) {
      console.error(err);
    }
  };

  const presaleMint = async () => {
    try {
      // We need a Signer here since this is a 'write' transaction.
      const signer = await getProviderOrSigner(true);
      // Create a new instance of the Contract with a Signer, which allows update
      // methods
      const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, signer);
      // call the presaleMint from the contract, only whitelisted addresses would be
      // able to mint
      const tx = await nftContract.presaleMint({
        // value signifies the cost of one crypto dev which is "0.01" eth. We are
        // parsing `0.01` string to ether using the utils library from ethers.js
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

  const publicMint = async () => {
    try {
      // We need a Signer here since this is a 'write' transaction.
      const signer = await getProviderOrSigner(true);
      // Create a new instance of the Contract with a Signer, which allows update
      // methods
      const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, signer);
      // call the mint from the contract to mint the Crypto Dev
      const tx = await nftContract.mint({
        // value signifies the cost of one crypto dev which is "0.01" eth. We are
        // parsing `0.01` string to ether using the utils library from ethers.js
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

  const startPresale = async () => {
    try {
      // We need a Signer here since this is a 'write' transaction.
      const signer = await getProviderOrSigner(true);
      // Create a new instance of the Contract with a Signer, which allows update
      // methods
      const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, signer);
      // call the startPresale from the contract
      const tx = await nftContract.startPresale();
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
      //get nft contract instance
      const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, provider);
      // call the presaleEnded from the contract, it's going to return a bigNum
      const presaleEndTime = await nftContract.presaleEnded();
      // Date.now()/1000 returns the current time in seconds
      //   const currentTimeInSeconds = Math.floor(Date.now() / 1000);
      // We compare if the presaleEndTime timestamp is less than the current time lt
      // (less than function) used on bigNum.
      const hasPresaleEnded = presaleEndTime.lt(Math.floor(Date.now() / 1000));

      setPresaleEnded(hasPresaleEnded);
      return hasPresaleEnded;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const getOwner = async () => {
    try {
      //get provider from web3Modal == metamask.
      const provider = await getProviderOrSigner();
      //an instance of nft contract
      const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, provider);
      // get the owner from the contract
      const _owner = await nftContract.owner();
      //get the address of the current user from the signer
      const signer = await getProviderOrSigner(true);
      const userAddress = await signer.getAddress();

      if (userAddress.toLowerCase() === _owner.toLowerCase()) {
        setIsOwner(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getProviderOrSigner = async (needSigner = false) => {
    try {
      //connect to MetaMask
      const provider = await web3ModalRef.current.connect();
      const web3Provider = new providers.Web3Provider(provider);

      // If user is not connected to the Rinkeby network, let them know and throw an
      // error
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
    } catch (err) {
      console.error(err);
    }
  };

  const connectWallet = async () => {
    try {
      //get provider from web3Modal == metamask.
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

    await getTokenIdsMinted();

    //track in real time the numOfMintedToken
    setInterval(async () => {
      await getTokenIdsMinted();
    }, 5 * 1000);

    //track in real time the status of presale
    setInterval(async () => {
      const presaleStarted = await checkIfPresaleStarted();
      if (presaleStarted) {
        await checkIfPresaleEnded();
      }
    }, 5 * 1000);
  };

  useEffect(() => {
    if (!walletConnected) {
      // Assign the Web3Modal class to the reference object by setting it's `current`
      // value The `current` value is persisted throughout as long as this page is
      // open
      web3ModalRef.current = new Web3Modal({
        network: "rinkeby",
        providerOptions: {},
        disableInjectedProvider: false,
      });
      onPageLoad();
    }
  });

  const renderButton = () => {
    if (loading) {
      return <button className={styles.button}>Loading.......</button>;
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
