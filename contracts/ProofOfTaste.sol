
 // SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract ProofOfTaste {
    struct Prediction {
        address predictor;
        uint256 artistId;
        bool predictsBreakout;
        uint256 timestamp;
        bool resolved;
        bool wasCorrect;
    }

    address public owner;
    uint256 public nextPredictionId;

    mapping(uint256 => Prediction) public predictions;
    mapping(address => uint256) public predictionCount;

    event PredictionMade(
        uint256 indexed predictionId,
        address indexed predictor,
        uint256 indexed artistId,
        bool predictsBreakout
    );

    event PredictionResolved(
        uint256 indexed predictionId,
        bool artistBrokeOut,
        bool wasCorrect
    );

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function makePrediction(
        uint256 artistId,
        bool predictsBreakout
    ) external returns (uint256 predictionId) {
        predictionId = nextPredictionId++;

        predictions[predictionId] = Prediction({
            predictor: msg.sender,
            artistId: artistId,
            predictsBreakout: predictsBreakout,
            timestamp: block.timestamp,
            resolved: false,
            wasCorrect: false
        });

        predictionCount[msg.sender]++;

        emit PredictionMade(
            predictionId,
            msg.sender,
            artistId,
            predictsBreakout
        );
    }

    function resolvePrediction(
        uint256 predictionId,
        bool artistBrokeOut
    ) external onlyOwner {
        Prediction storage prediction = predictions[predictionId];

        require(prediction.predictor != address(0), "Prediction not found");
        require(!prediction.resolved, "Already resolved");

        prediction.resolved = true;
        prediction.wasCorrect =
            prediction.predictsBreakout == artistBrokeOut;

        emit PredictionResolved(
            predictionId,
            artistBrokeOut,
            prediction.wasCorrect
        );
    }

    function getPrediction(
        uint256 predictionId
    ) external view returns (Prediction memory) {
        require(
            predictions[predictionId].predictor != address(0),
            "Prediction not found"
        );

        return predictions[predictionId];
    }
}
