import {Input} from "@nextui-org/react";
import {
    Card,
    Col,
    Row,
    Button,
    Text,
    Modal,
    useModal,
    Avatar,
    Grid,
    Spacer
} from "@nextui-org/react";
import {useState, useEffect} from "react";
//import Web3Modal from "web3modal";
import { ethers } from "ethers";
import { useWeb3React } from "@web3-react/core";
import { CoinGecko } from "coingecko-api";
import Select from "react-select";
import { EthereumClient, w3mConnectors, w3mProvider } from '@web3modal/ethereum'
import { Web3Modal } from '@web3modal/react'
import { configureChains, createClient, WagmiConfig } from 'wagmi'
import { arbitrum, mainnet, polygon } from 'wagmi/chains'

const chains = [arbitrum, mainnet, polygon]
const projectId = 'YOUR_PROJECT_ID'

const { provider } = configureChains(chains, [w3mProvider({ projectId })])
const wagmiClient = createClient({
autoConnect: true,
connectors: w3mConnectors({ projectId, version: 1, chains }),
provider
})
const ethereumClient = new EthereumClient(wagmiClient, chains)



export default function Swap() {
    useEffect(() => {
        const { account, library } = useWeb3React();
    const [fromToken, setFromToken] = useState(null);
    const [toToken, setToToken] = useState(null);
    const [amount, setAmount] = useState("");
    const [showFromTokenModal, setShowFromTokenModal] = useState(false);
    const [fromTokenList, setFromTokenList] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    
    const handleFromTokenClick = async () => {
        setShowFromTokenModal(true);
        const { data } = await CoinGeckoClient.coins.list();
        const tokenList = data.map((coin) => {
        return {
            value: coin.id,
            label: `${coin.name} (${coin.symbol.toUpperCase()})`,
        };
        });
        setFromTokenList(tokenList);
    };

    const handleFromTokenSelect = (token) => {
        setFromToken(token);
        setShowFromTokenModal(false);
    };

    const handleAmountChange = (event) => {
        setAmount(event.target.value);
    };

    const handleSwap = async (event) => {
        event.preventDefault();
        if (!fromToken || !toToken || !amount) {
        return;
        }
        const provider = new ethers.providers.Web3Provider(library.provider);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(
        "0xdef1c0ded9bec7f1a1670819833240f027b25eff",
        [
            "function fillQuote(address _fromToken, address _toToken, uint256 _fromAmount, uint256 _minToAmount) external returns (uint256 toAmount)",
        ],
        signer
        );
        const fromAmount = ethers.utils.parseUnits(amount, fromToken.decimals);
        const toAmount = await contract.fillQuote(
        fromToken.value,
        toToken.value,
        fromAmount,
        0
        );
        alert(
        `Swapped ${amount} ${fromToken.label} for ${ethers.utils.formatUnits(
            toAmount,
            toToken.decimals
        )} ${toToken.label}`
        );
    };

    const handleConnectWallet = async () => {
        await web3Modal.connect();
    };

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };

    const filteredTokenList = fromTokenList.filter((token) =>
        token.label.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 7);


    },[]);
  
    return (
        <div>
        <WagmiConfig client={wagmiClient}>

        <h1>Swap Tokens</h1>
        <form onSubmit={handleSwap}>
            <div>
            <label>From Token</label>
            <button onClick={handleFromTokenClick}>
                {fromToken ? `${fromToken.label}` : "Select Token"}
            </button>
            {showFromTokenModal && (
                <div>
                <input
                    type="text"
                    placeholder="Search Tokens"
                    value={searchTerm}
                    onChange={handleSearchChange}
                />
                <ul>
                    {filteredTokenList.map((token) => (
                    <li key={token.value}>
                        <button onClick={() => handleFromTokenSelect(token)}>
                        {token.label}
                        </button>
                    </li>
                    ))}
                </ul>
                </div>
            )}
            </div>
            <div>
            <label>To Token</label>
            <button onClick={handleToTokenClick}>
                {toToken ? `${toToken.label}` : "Select Token"}
            </button>
            {showToTokenModal && (
                <div>
                <input
                    type="text"
                    placeholder="Search Tokens"
                    value={searchTerm}
                    onChange={handleSearchChange}
                />
                <ul>
                    {filteredTokenList.map((token) => (
                    <li key={token.value}>
                        <button onClick={() => handleToTokenSelect(token)}>
                        {token.label}
                        </button>
                    </li>
                    ))}
                </ul>
                </div>
            )}
            </div>
            <div>
            <label>Amount</label>
            <input type="number" value={amount} onChange={handleAmountChange} />
            </div>
            <div>
            {account ? (
                <button type="submit">Swap</button>
            ) : (
                <button onClick={handleConnectWallet}>Connect Wallet</button>
            )}
            </div>
        </form>
        </WagmiConfig>
        <Web3Modal projectId={projectId} ethereumClient={ethereumClient} />


        </div>
    );
  
}
    