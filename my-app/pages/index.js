import Head from "next/head";
// import Image from "next/image";
import styles from "../styles/Home.module.css";
import { useEffect, useState, useRef } from "react";
import web3Modal from "web3modal";
import { providers, Contract, signer } from "ethers";
import { abi, NFT_CONTRACT_ADDRESS } from "../constant";

export default function Home() {
  const [isOwner, setIsOwner] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);
  const [presaleStarted, setPresaleStarted] = useState(false);
  const [presaleEnded, setPresaleEnded] = useState(false);
  const web3ModalRef = useRef();

  const getOwner = async () => {
    try {
      const signer = await getProviderOrSigner(true);

      //an instance of the nft contract
      const nftContract = new Contract({
        NFT_CONTRACT_ADDRESS,
        abi,
        signer,
      });

      const owner = await nftContract.owner();
      console.log(owner, "this nft owner");

      const userAddress = await signer.getAddress();
      console.log(userAddress, "this nft user");

      if (owner.toLowerCase() === userAddress.toLowerCase()) {
        setIsOwner(true);
      }
    } catch (error) {
      console.error();
    }
  };
  const connectWallet = async () => {
    try {
      // Get the provider from web3Modal, which in this case is MetaMask
      await getProviderOrSigner();
      setWalletConnected(true);
    } catch (error) {
      console.error(error.msg);
    }
  };
  const startPresale = async () => {
    try {
      const signer = await getProviderOrSigner(true);

      const nftContract = new Contract(abi, NFT_CONTRACT_ADDRESS, signer);

      const txn = await nftContract.startPresale();
      await txn.wait();
      setPresaleStarted(true);
    } catch (error) {
      console.error(error);
    }
  };
  const checkIfPresaleStarted = async () => {
    try {
      // Get the provider from web3Modal, which in this is MetaMask
      // No need for the Signer here, as we are only reading state from the blockchain
      const provider = await getProviderOrSigner();

      //get an instance of your nft contract
      const nftContract = new Contract(abi, NFT_CONTRACT_ADDRESS, provider);

      const isPresaleStarted = await nftContract.presaleStarted();
      setPresaleStarted(isPresaleStarted);

      return isPresaleStarted; //because states run async, i'm using return which is runs sync
    } catch (error) {
      console.error();
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

  const getProviderOrSigner = async (needSigner = false) => {
    //gain access to the provider/signer and connect wallet
    const provider = await web3ModalRef.current.connect();
    const web3Provider = new providers.Web3Provider(provider);

    //if not connected on rinkeby, switch to rinkeby
    const { chainId } = await web3Provider.getNetwork();
    if (chainId !== 4) {
      window.alert("Please switch to the rinkeby network");
      throw new Error("Incorrect network");
    }

    if (needSigner) {
      const signer = web3Provider.getSigner();
      return signer;
    }

    return web3Provider;
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
      web3ModalRef.current = new web3Modal({
        network: "rinkeby",
        providerOptions: {},
        disableInjectedProvider: false,
      });

      onPageLoad();
    }
  });
  function renderBody() {
    if (!walletConnected) {
      return (
        //render a connect wallet button to connect wallet
        <button onClick={connectWallet} className={styles.button}>
          Connect Wallet
        </button>
      );
    }

    if (!presaleStarted) {
      console.log(isOwner, presaleStarted);
      //   console.log(userAddress, "this nft user");

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
    0x6433812ddee51e2cbb2fbe45e97979daec613f12;
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
            Presale has ended!, You can mint a CryptoDev at public mint
          </span>
          <button className={styles.button}>Presale Mint</button>
        </div>
      );
    }
  }
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
