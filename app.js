const CONTRACT_ADDRESS = "0xb5785b950D97413F5ab141768Fd1f41364dD30eD"


const CONTRACT_ABI = 
[
	{
		"inputs": [],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "id",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "finder",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "reward",
				"type": "uint256"
			}
		],
		"name": "BountyClaimed",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_itemId",
				"type": "uint256"
			}
		],
		"name": "cancelReport",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "id",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "refundedAmount",
				"type": "uint256"
			}
		],
		"name": "ItemCancelled",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "id",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "owner",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "title",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "reward",
				"type": "uint256"
			}
		],
		"name": "ItemReported",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_itemId",
				"type": "uint256"
			},
			{
				"internalType": "address payable",
				"name": "_finder",
				"type": "address"
			}
		],
		"name": "payFinder",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_title",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_description",
				"type": "string"
			}
		],
		"name": "reportLostItem",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "contractOwner",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_itemId",
				"type": "uint256"
			}
		],
		"name": "getItem",
		"outputs": [
			{
				"components": [
					{
						"internalType": "uint256",
						"name": "id",
						"type": "uint256"
					},
					{
						"internalType": "address payable",
						"name": "owner",
						"type": "address"
					},
					{
						"internalType": "string",
						"name": "title",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "description",
						"type": "string"
					},
					{
						"internalType": "uint256",
						"name": "rewardAmount",
						"type": "uint256"
					},
					{
						"internalType": "enum LostAndFound.Status",
						"name": "status",
						"type": "uint8"
					}
				],
				"internalType": "struct LostAndFound.Item",
				"name": "",
				"type": "tuple"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "itemCount",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "items",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "id",
				"type": "uint256"
			},
			{
				"internalType": "address payable",
				"name": "owner",
				"type": "address"
			},
			{
				"internalType": "string",
				"name": "title",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "description",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "rewardAmount",
				"type": "uint256"
			},
			{
				"internalType": "enum LostAndFound.Status",
				"name": "status",
				"type": "uint8"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];


let provider;
let signer;
let contract;

async function connectWallet() {
  if (!window.ethereum) {
    alert("MetaMask extension not detected!");
    return;
  }
  try {
    provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    signer = provider.getSigner();
    const userAddress = await signer.getAddress();
    const network = await provider.getNetwork();

    document.getElementById("walletStatus").innerText = 
      `Connected: ${userAddress} | Chain ID: ${network.chainId}`;
    document.getElementById("connectBtn").innerText = "Wallet Connected";

    contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
  } catch (err) {
    console.error(err);
    alert("Connection failed: " + err.message);
  }
}

async function reportItem() {
  if (!contract) return alert("Connect wallet first!");

  const title = document.getElementById("itemTitle").value;
  const desc = document.getElementById("itemDesc").value;
  const rewardEth = document.getElementById("itemReward").value;

  try {
    const rewardInWei = ethers.utils.parseEther(rewardEth || "0");
    const tx = await contract.reportLostItem(title, desc, { value: rewardInWei });
    
    document.getElementById("outputDisplay").innerText = "Transaction pending... Hash: " + tx.hash;
    await tx.wait();
    
    alert("Item reported successfully!");
    document.getElementById("outputDisplay").innerText = "Transaction confirmed! Block mined.";
  } catch (err) {
    console.error(err);
    const reason = err.data?.message || err.error?.message || err.message;
    alert("Transaction Reverted: " + reason);
    document.getElementById("outputDisplay").innerText = "Error: " + reason;
  }
}

async function payFinder() {
  if (!contract) return alert("Connect wallet first!");

  const itemId = document.getElementById("manageItemId").value;
  const finder = document.getElementById("finderAddress").value;

  try {
    const tx = await contract.payFinder(itemId, finder);
    document.getElementById("outputDisplay").innerText = "Processing payout... Hash: " + tx.hash;
    await tx.wait();
    
    alert("Bounty sent to finder!");
    document.getElementById("outputDisplay").innerText = "Finder paid successfully!";
  } catch (err) {
    console.error(err);
    const reason = err.data?.message || err.error?.message || err.message;
    alert("Transaction Reverted: " + reason);
    document.getElementById("outputDisplay").innerText = "Error: " + reason;
  }
}

async function cancelListing() {
  if (!contract) return alert("Connect wallet first!");

  const itemId = document.getElementById("manageItemId").value;

  try {
    const tx = await contract.cancelReport(itemId);
    document.getElementById("outputDisplay").innerText = "Processing refund... Hash: " + tx.hash;
    await tx.wait();
    
    alert("Listing cancelled and ETH refunded!");
    document.getElementById("outputDisplay").innerText = "Refund completed successfully!";
  } catch (err) {
    console.error(err);
    const reason = err.data?.message || err.error?.message || err.message;
    alert("Transaction Reverted: " + reason);
    document.getElementById("outputDisplay").innerText = "Error: " + reason;
  }
}

async function fetchItem() {
  if (!contract) return alert("Connect wallet first!");

  const itemId = document.getElementById("lookupId").value;
  const statusMap = ["Open", "Claimed", "Cancelled"];

  try {
    const item = await contract.getItem(itemId);
    const formattedData = {
      id: item.id.toString(),
      owner: item.owner,
      title: item.title,
      description: item.description,
      rewardInEth: ethers.utils.formatEther(item.rewardAmount),
      status: statusMap[item.status]
    };
    document.getElementById("outputDisplay").innerText = JSON.stringify(formattedData, null, 2);
  } catch (err) {
    console.error(err);
    const reason = err.data?.message || err.error?.message || err.message;
    document.getElementById("outputDisplay").innerText = "Fetch Failed: " + reason;
  }
}