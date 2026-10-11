import { useState } from "react";
import "./App.css";

const CONTRACT_ADDRESS = "0xa34C3c87289007b897F46D74EA4A647De6b5cB05";

const CONTRACT_ABI = [
  "function makePrediction(uint256 artistId, bool predictsBreakout) returns (uint256 predictionId)",
  "function nextPredictionId() view returns (uint256)",
  "function getPrediction(uint256 predictionId) view returns (tuple(address predictor, uint256 artistId, bool predictsBreakout, uint256 timestamp, bool resolved, bool wasCorrect))",
"function resolvePrediction(uint256 predictionId, bool artistBrokeOut)"];

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
  const [status, setStatus] = useState("");
  const [predictions, setPredictions] = useState({});
  const [predictionHistory, setPredictionHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  async function connectWallet() {
    if (!window.ethereum) {
      setStatus("Please install MetaMask to connect your wallet.");
      return;
    }

    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      setWalletAddress(accounts[0]);
      setStatus("Wallet connected.");
    } catch {
      setStatus("Wallet connection cancelled.");
    }
  }

  async function makePrediction(artistId, predictsBreakout) {
    if (!window.ethereum) {
      setStatus("MetaMask was not found.");
      return;
    }

    if (!walletAddress) {
      setStatus("Connect your MetaMask wallet first.");
      return;
    }

    try {
      setStatus("Please confirm the prediction in MetaMask...");

      const { BrowserProvider, Contract } = await import("ethers");
      const provider = new BrowserProvider(window.ethereum);
      const network = await provider.getNetwork();

      if (network.chainId !== 10143n) {
        setStatus("Please switch MetaMask to Monad Testnet.");
        return;
      }

      const signer = await provider.getSigner();
      const contract = new Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        signer
      );

      const tx = await contract.makePrediction(
        artistId,
        predictsBreakout
      );

      setStatus("Transaction sent. Waiting for confirmation...");
      await tx.wait();

      setPredictions((previous) => ({
        ...previous,
        [artistId]: predictsBreakout,
      }));

      setStatus("Prediction recorded on Monad Testnet!");
    } catch (error) {
      console.error(error);
      setStatus("Prediction failed or was cancelled in MetaMask.");
    }
  }

  async function loadPredictionHistory() {
    if (!window.ethereum) {
      setStatus("Please install MetaMask first.");
      return;
    }

    setHistoryLoading(true);

    try {
      const { BrowserProvider, Contract } = await import("ethers");
      const provider = new BrowserProvider(window.ethereum);
      const network = await provider.getNetwork();

      if (network.chainId !== 10143n) {
        setStatus("Please switch MetaMask to Monad Testnet.");
        return;
      }

      const contract = new Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        provider
      );

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
      setStatus(`Loaded ${history.length} on-chain predictions.`);
    } catch (error) {
      console.error(error);
      setStatus(
        "Could not load history. Check the contract address and network."
      );
    } finally {
      setHistoryLoading(false);
    }
  }

  const myHistory = walletAddress
    ? predictionHistory.filter(
        (p) =>
          p.predictor.toLowerCase() === walletAddress.toLowerCase()
      )
    : [];

  const resolvedCount = myHistory.filter((p) => p.resolved).length;

  const correctCount = myHistory.filter(
    (p) => p.resolved && p.wasCorrect
  ).length;

  const scoutScore = correctCount * 10;
  return (
    <main className="app">
      <nav className="navbar">
        <a className="brand" href="#">
          <span className="brand-mark">✳</span> PROOF OF TASTE
        </a>

        <span className="network-label">MONAD TESTNET</span>

        <button className="wallet-button" onClick={connectWallet}>
          {walletAddress
            ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
            : "Connect Wallet"}
        </button>
      </nav>

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

          <span className="catalogue-label">
            CURATED LAUNCH CATALOGUE
          </span>
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
                <p className="artist-description">
                  {artist.description}
                </p>

                <div className="prediction-question">
                  <span>Will they break out?</span>
                  <span className="rising-label">
                    {artist.listeners}
                  </span>
                </div>

                {predictions[artist.id] === undefined ? (
                  <div className="prediction-buttons">
                    <button
                      onClick={() =>
                        makePrediction(artist.id, true)
                      }
                    >
                      Yes, breakout ↗
                    </button>

                    <button
                      onClick={() =>
                        makePrediction(artist.id, false)
                      }
                    >
                      Not yet
                    </button>
                  </div>
                ) : (
                  <div className="prediction-confirmation">
                    ✓ Your pick:{" "}
                    {predictions[artist.id]
                      ? "Breakout"
                      : "Not yet"}

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
          Curated launch catalogue · Predictions are recorded on Monad
          Testnet.
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
            onClick={loadPredictionHistory}
            disabled={historyLoading}
          >
            {historyLoading
              ? "Loading..."
              : "Load On-chain History"}
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
                <p className="artist-origin">
                  RESOLVED PREDICTIONS
                </p>
                <h3>{resolvedCount}</h3>
                <p className="artist-description">
                  Predictions with an on-chain outcome.
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
            Click “Load On-chain History” to fetch records directly
            from Monad Testnet.
          </p>
        ) : (
          <div className="artist-grid">
            {predictionHistory.map((prediction) => {
              const artist = artists.find(
                (item) => item.id === prediction.artistId
              );

              return (
                <article className="artist-card" key={prediction.id}>
                  <div className="artist-info">
                    <p className="artist-origin">
                      PREDICTION #{prediction.id}
                    </p>

                    <h3>
                      {artist
                        ? artist.name
                        : `Artist #${prediction.artistId}`}
                    </h3>

                    <p className="artist-description">
                      Pick:{" "}
                      {prediction.predictsBreakout
                        ? "Breakout"
                        : "Not yet"}
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
                      {new Date(
                        prediction.timestamp * 1000
                      ).toLocaleString()}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        )}
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
