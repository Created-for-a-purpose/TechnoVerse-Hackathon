import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import charityABI from './../abis/charity.json'
import donationABI from './../abis/donation.json'
import config from './config.json'
import "./DonatePage.scss";
import { useNavigate } from "react-router-dom";

const DonatePage = (props) => {
  const [background, setBackground] = useState({
    background: "white",
  });
  const id=props.id;

  const [donation, setDonation] = useState('0');

    const navigate = useNavigate();
    const handleNavigate = () => {
        navigate("/donation-list/"+id);
    }

    // console.log(donation);
  useEffect(() => {
    const call = async () => {
      const response = await fetch(`https://beige-asleep-chinchilla-881.mypinata.cloud/ipfs/QmWF2vsEyJ7MJsemiPzupvcsidn6VANL6EYkrsSPSjZ7zK/${id}.json`);
      const data = await response.json();
      // console.log(data.image);
      const url = "https://beige-asleep-chinchilla-881.mypinata.cloud/ipfs/"+data.image.slice(7);
      const newBackground = {
        ...background,
        background: `url(${url})`,
        backgroundSize: "contain",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center center",
      };
      setBackground(newBackground);
      await loadBlockchainData();
    };
    call();
  }, []);

  const [provider, setProvider] = useState(null);
  const [account, setAccount] = useState(null);
  const [connectButton, setConnectButton] = useState('Connect to MetaMask');
  const [charity, setCharity] = useState(null);
  const [donationContract, setDonationContract] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  const loadBlockchainData = async () => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    setProvider(provider);
    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
    setAccount(accounts[0]);

    const charityAddress =config["charity"];
    const donationAddress =config["donation"];
    const signer = await provider.getSigner();
    // console.log(signer);
    const charity = new ethers.Contract(charityAddress, charityABI, signer);
    const donationC = new ethers.Contract(donationAddress, donationABI, signer);

    setCharity(charity);
    setDonationContract(donationC);
    
  }

  const handleDonationChange = (e) => {
    const inputValue = e.target.value;
    if (/^\d*\.?\d*$/.test(inputValue)) {
      setDonation(inputValue);
    }
  };

  const handleConnect = async () => {
    setConnectButton('Connecting...');
    await window.ethereum.request({ method: "eth_requestAccounts" });
    // console.log(typeof account);
    setConnectButton(account.slice(0,5)+'...'+account.slice(-4));
    setIsConnected(true);
    return;
  }

  const handleDonation = async () => {
    if(!isConnected){
      alert('Please connect to MetaMask first');
      return;
    }
    if(provider && charity && donationContract){
      const donationAmount = ethers.parseEther(donation);
      // console.log(typeof donation);
      const uri = donation+" ETH"
      await donationContract.donate(uri, id, {value: donationAmount});

    }

  };

  return (
    <div className="donate_container">
      <div className="donate_card_container">
        <div className="card" style={background}></div>
      </div>
      <div className="content">
        {
          isConnected && <button className="connect_button"><a href={`${config["blockExplorer"]}/address/${account}`}>
            {connectButton}{' -->'}</a></button>
        }
        {
          !isConnected && 
          <button className="connect_button" onClick={handleConnect}>{connectButton}</button>
        }
        <input
          className="donation_input"
          type="text"
          placeholder="Enter donation amount in ETH"
          // value={donation}
          onChange={handleDonationChange}
        />
        <button className="donate_button" onClick={handleDonation}>Make Donation</button>
        <button className="donation_list_button" onClick={handleNavigate}>
          View Donation List
        </button>
      </div>
    </div>
  );
};

export default DonatePage;
