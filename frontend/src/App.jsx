import { useEffect, useState } from "react";

import "./App.css";

const CONTRACT_ADDRESS = "0xa34C3c87289007b897F46D74EA4A647De6b5cB05";

const MONAD_CHAIN_ID = 10143n;

const CONTRACT_ABI = [
  "function owner() view returns (address)",

  "function makePrediction(uint256 artistId, bool predictsBreakout) returns (uint256 predictionId)",

  "function nextPredictionId() view returns (uint256)",

  "function getPrediction(uint256 predictionId) view returns (tuple(address predictor, uint256 artistId, bool predictsBreakout, uint256 timestamp, bool resolved, bool wasCorrect))",

  "function resolvePrediction(uint256 predictionId, bool artistBrokeOut)",
];

const artists = [
  {
    id: 1,

    name: "The Last Dinner Party",

    genre: "INDIE ROCK",

    origin: "United Kingdom",

    description: "Theatrical indie rock with a bold, distinctive sound.",

    listeners: "Rising",

    image: "🎸",
  },

  {
    id: 2,

    name: "Asha Banks",

    genre: "ALT POP",

    origin: "United Kingdom",

    description: "An emerging voice blending intimate songwriting and pop.",

    listeners: "Emerging",

    image: "🎤",
  },

  {
    id: 3,

    name: "Good Neighbours",

    genre: "INDIE POP",

    origin: "Global",

    description: "Anthemic melodies built for a new generation of listeners.",

    listeners: "Rising",

    image: "🌙",
  },
];

function App() {
  const [walletAddress, setWalletAddress] = useState("");

  const [isOwner, setIsOwner] = useState(false);

  const [status, setStatus] = useState("");

  const [predictions, setPredictions] = useState({});

  const [predictionHistory, setPredictionHistory] = useState([]);

  const [historyLoading, setHistoryLoading] = useState(false);

  const [transactionLoading, setTransactionLoading] = useState(false);

  const [correctNetwork, setCorrectNetwork] = useState(false);

  function clearWalletState() {
    setWalletAddress("");

    setIsOwner(false);

    setPredictions({});
  }

  async function checkNetwork() {
    if (!window.ethereum) {
      setCorrectNetwork(false);

      return false;
    }

    const chainId = await window.ethereum.request({
      method: "eth_chainId",
    });

    const isMonad = BigInt(chainId) === MONAD_CHAIN_ID;

    setCorrectNetwork(isMonad);

    return isMonad;
  }

  async function getConnectedContract(withSigner = false) {
    const { BrowserProvider, Contract } = await import("ethers");

    if (!window.ethereum) {
      throw new Error("Please install MetaMask first.");
    }

    const networkOkay = await checkNetwork();

    if (!networkOkay) {
      clearWalletState();

      throw new Error(
        "Wrong network. Please switch MetaMask to Monad Testnet (Chain ID 10143).",
      );
    }

    const provider = new BrowserProvider(window.ethereum);

    const network = await provider.getNetwork();

    if (network.chainId !== MONAD_CHAIN_ID) {
      clearWalletState();

      setCorrectNetwork(false);

      throw new Error("Wrong network. Please switch to Monad Testnet.");
    }

    const runner = withSigner ? await provider.getSigner() : provider;

    return {
      provider,

      contract: new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, runner),
    };
  }

  useEffect(() => {
    let active = true;
    let lastNetworkState = null;
    let checking = false;
    async function verifyNetwork() {
      if (checking || !active) return;
      checking = true;
      try {
        if (!window.ethereum) {
          if (active) {
            setCorrectNetwork(false);
            clearWalletState();
            setStatus("Install MetaMask to use Proof of Taste.");
          }
          return;
        }
        const chainId = await window.ethereum.request({
          method: "eth_chainId",
        });
        if (!active) return;
        const isMonad = BigInt(chainId) === MONAD_CHAIN_ID;
        setCorrectNetwork(isMonad);
        if (lastNetworkState !== isMonad) {
          lastNetworkState = isMonad;
          clearWalletState();
          setStatus(
            isMonad
              ? "Monad Testnet detected. Connect your wallet to continue."
              : "Wrong network detected. Switch MetaMask to Monad Testnet (Chain ID 10143).",
          );
        }
      } catch {
        if (active) {
          setCorrectNetwork(false);
          clearWalletState();
          setStatus("Could not verify your network. Check MetaMask.");
        }
      } finally {
        checking = false;
      }
    }
    function handleChainChanged() {
      lastNetworkState = null;
      clearWalletState();
      verifyNetwork();
    }
    function handleAccountsChanged(accounts) {
      clearWalletState();
      setStatus(
        accounts && accounts.length
          ? "Wallet account changed. Reconnect to verify your wallet."
          : "Wallet disconnected. Connect your wallet to continue.",
      );
    }
    verifyNetwork();
    const intervalId = window.setInterval(verifyNetwork, 1500);
    window.ethereum?.on?.("chainChanged", handleChainChanged);
    window.ethereum?.on?.("accountsChanged", handleAccountsChanged);
    return () => {
      active = false;
      window.clearInterval(intervalId);
      window.ethereum?.removeListener?.("chainChanged", handleChainChanged);
      window.ethereum?.removeListener?.(
        "accountsChanged",
        handleAccountsChanged,
      );
    };
  }, []);

  async function connectWallet() {
    if (!window.ethereum) {
      setStatus("Please install MetaMask to connect your wallet.");

      return;
    }

    try {
      const networkOkay = await checkNetwork();

      if (!networkOkay) {
        clearWalletState();

        setStatus(
          "Wrong network. Open MetaMask and switch to Monad Testnet (Chain ID 10143), then connect again.",
        );

        return;
      }

      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      if (!accounts || accounts.length === 0) {
        clearWalletState();

        setStatus("No wallet account was selected.");

        return;
      }

      // Verify the network again in case it changed during connection.

      const stillOnMonad = await checkNetwork();

      if (!stillOnMonad) {
        clearWalletState();

        setStatus(
          "Network changed during connection. Switch to Monad Testnet and try again.",
        );

        return;
      }

      const address = accounts[0];

      const { contract } = await getConnectedContract();

      const ownerAddress = await contract.owner();

      setWalletAddress(address);

      setIsOwner(address.toLowerCase() === ownerAddress.toLowerCase());

      setStatus("Wallet connected and verified on Monad Testnet.");
    } catch (error) {
      console.error(error);

      clearWalletState();

      setStatus(
        error?.shortMessage ||
          error?.reason ||
          error?.message ||
          "Could not connect wallet.",
      );
    }
  }

  async function makePrediction(artistId, predictsBreakout) {
    if (!walletAddress) {
      setStatus("Connect your MetaMask wallet first.");

      return;
    }

    setTransactionLoading(true);

    try {
      const { contract } = await getConnectedContract(true);

      setStatus("Please confirm the prediction in MetaMask...");

      const tx = await contract.makePrediction(artistId, predictsBreakout);

      setStatus("Transaction sent. Waiting for confirmation...");

      await tx.wait();

      setPredictions((previous) => ({
        ...previous,

        [artistId]: predictsBreakout,
      }));

      setStatus("Prediction recorded on Monad Testnet!");

      await loadPredictionHistory(true);
    } catch (error) {
      console.error(error);

      setStatus(
        error?.shortMessage ||
          error?.reason ||
          error?.message ||
          "Prediction failed or was cancelled.",
      );
    } finally {
      setTransactionLoading(false);
    }
  }

  async function loadPredictionHistory(silent = false) {
    if (!window.ethereum) {
      setStatus("Please install MetaMask first.");

      return;
    }

    setHistoryLoading(true);

    try {
      const { contract } = await getConnectedContract();

      const total = Number(await contract.nextPredictionId());

      const history = [];

      for (let id = 0; id < total; id += 1) {
        const p = await contract.getPrediction(id);

        history.push({
          id,

          predictor: p.predictor,

          artistId: Number(p.artistId),

          predictsBreakout: p.predictsBreakout,

          timestamp: Number(p.timestamp),

          resolved: p.resolved,

          wasCorrect: p.wasCorrect,
        });
      }

      setPredictionHistory(history);

      if (!silent) {
        setStatus(`Loaded ${history.length} on-chain predictions.`);
      }
    } catch (error) {
      console.error(error);

      if (!silent) {
        setStatus(
          error?.shortMessage ||
            error?.reason ||
            error?.message ||
            "Could not load history. Check your network and contract.",
        );
      }
    } finally {
      setHistoryLoading(false);
    }
  }

  async function resolvePrediction(predictionId, artistBrokeOut) {
    if (!walletAddress || !isOwner) {
      setStatus("Only the contract owner can resolve predictions.");

      return;
    }

    const confirmed = window.confirm(
      `DEMO / MANUAL RESOLUTION\n\n` +
        `Prediction #${predictionId}\n` +
        `Outcome: ${artistBrokeOut ? "Breakout" : "Not yet"}\n\n` +
        `This outcome is manually entered for the demo, not independently verified. ` +
        `The resolution is permanent. Continue?`,
    );

    if (!confirmed) return;

    setTransactionLoading(true);

    try {
      const { contract } = await getConnectedContract(true);

      setStatus("Confirm the resolution transaction in MetaMask...");

      const tx = await contract.resolvePrediction(
        predictionId,

        artistBrokeOut,
      );

      setStatus("Waiting for resolution confirmation...");

      await tx.wait();

      await loadPredictionHistory(true);

      setStatus(`Prediction #${predictionId} resolved on Monad Testnet.`);
    } catch (error) {
      console.error(error);

      setStatus(
        error?.shortMessage ||
          error?.reason ||
          error?.message ||
          "Resolution failed. Only the contract owner can resolve.",
      );
    } finally {
      setTransactionLoading(false);
    }
  }

  const myHistory = walletAddress
    ? predictionHistory.filter(
        (p) => p.predictor.toLowerCase() === walletAddress.toLowerCase(),
      )
    : [];

  const resolvedCount = myHistory.filter((p) => p.resolved).length;

  const correctCount = myHistory.filter(
    (p) => p.resolved && p.wasCorrect,
  ).length;

  const scoutScore = correctCount * 10;

  const leaderboardMap = {};

  predictionHistory.forEach((prediction) => {
    const address = prediction.predictor;

    const key = address.toLowerCase();

    if (!leaderboardMap[key]) {
      leaderboardMap[key] = {
        address,

        totalPredictions: 0,

        resolvedPredictions: 0,

        correctPicks: 0,

        score: 0,
      };
    }

    const scout = leaderboardMap[key];

    scout.totalPredictions += 1;

    if (prediction.resolved) {
      scout.resolvedPredictions += 1;

      if (prediction.wasCorrect) {
        scout.correctPicks += 1;

        scout.score += 10;
      }
    }
  });

  const leaderboard = Object.values(leaderboardMap).sort(
    (a, b) =>
      b.score - a.score ||
      b.correctPicks - a.correctPicks ||
      b.resolvedPredictions - a.resolvedPredictions,
  );

  return (
    <main className="app">
      <nav className="navbar">
        <a className="brand" href="#">
          <span className="brand-mark">✳</span> PROOF OF TASTE
        </a>

        <span className="network-label">
          {correctNetwork ? "MONAD TESTNET" : "WRONG NETWORK"}
        </span>

        <button className="wallet-button" onClick={connectWallet}>
          {walletAddress
            ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
            : "Connect Wallet"}
        </button>
      </nav>

      {!correctNetwork && (
        <div className="status-message" role="alert">
          Switch MetaMask to Monad Testnet (Chain ID 10143) to use the app.
        </div>
      )}

      <section className="hero">
        <p className="eyebrow">THE NEXT WAVE STARTS HERE</p>

        <h1>
          Spot the next big thing.
          <br />
          <span>Prove you saw it first.</span>
        </h1>

        <p className="hero-description">
          Discover emerging artists. Predict who will break out. Build a
          reputation for having exceptional taste.
        </p>

        <a className="explore-button" href="#discover">
          Explore artists <span>↘</span>
        </a>
      </section>

      <section className="stats">
        <div>
          <strong>01</strong>

          <span>DISCOVER</span>
        </div>

        <div>
          <strong>02</strong>

          <span>PREDICT</span>
        </div>

        <div>
          <strong>03</strong>

          <span>BUILD YOUR SCOUT SCORE</span>
        </div>
      </section>

      <section className="discover" id="discover">
        <div className="section-heading">
          <div>
            <p className="eyebrow">YOUR TASTE, YOUR EDGE</p>

            <h2>
              Artists to watch<span>.</span>
            </h2>
          </div>

          <span className="catalogue-label">CURATED LAUNCH CATALOGUE</span>
        </div>

        <div className="artist-grid">
          {artists.map((artist) => (
            <article className="artist-card" key={artist.id}>
              <div className="artist-art">
                <span className="artist-emoji">{artist.image}</span>

                <span className="artist-tag">{artist.genre}</span>

                <span className="artist-number">
                  #{String(artist.id).padStart(2, "0")}
                </span>
              </div>

              <div className="artist-info">
                <p className="artist-origin">{artist.origin}</p>

                <h3>{artist.name}</h3>

                <p className="artist-description">{artist.description}</p>

                <div className="prediction-question">
                  <span>Will they break out?</span>

                  <span className="rising-label">{artist.listeners}</span>
                </div>

                {predictions[artist.id] === undefined ? (
                  <div className="prediction-buttons">
                    <button
                      disabled={
                        transactionLoading || !walletAddress || !correctNetwork
                      }

                      onClick={() => makePrediction(artist.id, true)}
                    >
                      Yes, breakout ↗
                    </button>

                    <button
                      disabled={
                        transactionLoading || !walletAddress || !correctNetwork
                      }

                      onClick={() => makePrediction(artist.id, false)}
                    >
                      Not yet
                    </button>
                  </div>
                ) : (
                  <div className="prediction-confirmation">
                    ✓ Your pick:{" "}
                    {predictions[artist.id] ? "Breakout" : "Not yet"}
                    <button
                      onClick={() =>
                        setPredictions((previous) => {
                          const next = { ...previous };

                          delete next[artist.id];

                          return next;
                        })
                      }
                    >
                      Change
                    </button>
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>

        <p className="demo-note">
          Curated launch catalogue · Predictions are recorded on Monad Testnet.
        </p>
      </section>

      <section className="discover" id="history">
        <div className="section-heading">
          <div>
            <p className="eyebrow">YOUR TRACK RECORD</p>

            <h2>
              On-chain history<span>.</span>
            </h2>
          </div>

          <button
            className="wallet-button"

            onClick={() => loadPredictionHistory()}

            disabled={historyLoading || transactionLoading || !correctNetwork}
          >
            {historyLoading ? "Loading..." : "Load On-chain History"}
          </button>
        </div>

        {walletAddress ? (
          <div className="artist-grid">
            <article className="artist-card">
              <div className="artist-info">
                <p className="artist-origin">SCOUT SCORE</p>

                <h3>{scoutScore} points</h3>

                <p className="artist-description">
                  10 points per correct resolved prediction.
                </p>
              </div>
            </article>

            <article className="artist-card">
              <div className="artist-info">
                <p className="artist-origin">RESOLVED PREDICTIONS</p>

                <h3>{resolvedCount}</h3>

                <p className="artist-description">
                  Your predictions with an on-chain outcome.
                </p>
              </div>
            </article>

            <article className="artist-card">
              <div className="artist-info">
                <p className="artist-origin">CORRECT PICKS</p>

                <h3>{correctCount}</h3>

                <p className="artist-description">
                  Correct among your resolved predictions.
                </p>
              </div>
            </article>
          </div>
        ) : (
          <p className="demo-note">
            Connect your wallet to see your Scout Score.
          </p>
        )}

        {predictionHistory.length === 0 ? (
          <p className="demo-note">
            Click “Load On-chain History” to fetch records directly from Monad
            Testnet.
          </p>
        ) : (
          <div className="artist-grid">
            {predictionHistory.map((prediction) => {
              const artist = artists.find(
                (item) => item.id === prediction.artistId,
              );

              return (
                <article className="artist-card" key={prediction.id}>
                  <div className="artist-info">
                    <p className="artist-origin">PREDICTION #{prediction.id}</p>

                    <h3>
                      {artist ? artist.name : `Artist #${prediction.artistId}`}
                    </h3>

                    <p className="artist-description">
                      Pick:{" "}
                      {prediction.predictsBreakout ? "Breakout" : "Not yet"}
                      {" · "}
                      {prediction.resolved
                        ? prediction.wasCorrect
                          ? "Resolved: correct"
                          : "Resolved: incorrect"
                        : "Unresolved"}
                    </p>

                    <p className="artist-origin">
                      Scout: {prediction.predictor.slice(0, 6)}...
                      {prediction.predictor.slice(-4)}
                    </p>

                    <p className="artist-origin">
                      {new Date(prediction.timestamp * 1000).toLocaleString()}
                    </p>

                    {isOwner && !prediction.resolved && (
                      <div className="prediction-buttons">
                        <button
                          disabled={transactionLoading || !correctNetwork}

                          onClick={() => resolvePrediction(prediction.id, true)}
                        >
                          Demo outcome: Breakout
                        </button>

                        <button
                          disabled={transactionLoading || !correctNetwork}

                          onClick={() =>
                            resolvePrediction(prediction.id, false)
                          }
                        >
                          Demo outcome: Not yet
                        </button>
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section className="discover" id="leaderboard">
        <div className="section-heading">
          <div>
            <p className="eyebrow">THE SCOUT RANKINGS</p>

            <h2>
              Leaderboard<span>.</span>
            </h2>
          </div>

          <span className="catalogue-label">MONAD TESTNET</span>
        </div>

        <p className="demo-note">
          Scouts are ranked by correct resolved predictions. Each correct pick
          earns 10 points. Load on-chain history above to refresh these
          rankings.
        </p>

        {predictionHistory.length === 0 ? (
          <p className="demo-note">
            Load on-chain history to see the leaderboard.
          </p>
        ) : leaderboard.length === 0 ? (
          <p className="demo-note">
            No scouts found in the loaded prediction records yet.
          </p>
        ) : (
          <div className="artist-grid">
            {leaderboard.map((scout, index) => {
              const isCurrentScout =
                walletAddress &&
                scout.address.toLowerCase() === walletAddress.toLowerCase();

              return (
                <article className="artist-card" key={scout.address}>
                  <div className="artist-info">
                    <p className="artist-origin">
                      RANK #{index + 1}
                      {isCurrentScout ? " · YOU" : ""}
                    </p>

                    <h3>
                      {scout.address.slice(0, 6)}...
                      {scout.address.slice(-4)}
                    </h3>

                    <p className="artist-description">
                      Scout Score: <strong>{scout.score}</strong> points
                    </p>

                    <p className="artist-description">
                      Correct picks: {scout.correctPicks}
                      {" · "}
                      Resolved: {scout.resolvedPredictions}
                    </p>

                    <p className="artist-origin">
                      Total predictions: {scout.totalPredictions}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        <p className="demo-note">
          Rankings include wallets found in the contract's loaded prediction
          history; they are not a complete registry of all wallet users.
        </p>
      </section>

      <footer className="footer">
        <span>✳ PROOF OF TASTE</span>

        <span>Rewarding taste, not follower counts.</span>
      </footer>

      {status && (
        <div className="status-message" role="status">
          {status}

          <button onClick={() => setStatus("")}>×</button>
        </div>
      )}
    </main>
  );
}

export default App;
