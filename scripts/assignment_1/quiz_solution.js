// Ethers JS: Quiz Contract.
////////////////////////////

// Note: this script includes reading from command-line and it might not
// work well with Code Runner. Please run inside a terminal.

// Load dependencies.
/////////////////////

const path = require("path");

const ethers = require("ethers");

// Adjust path to your .env file.
const pathToDotEnv = path.join(__dirname, "..", "..", ".env");
// console.log(pathToDotEnv);
require("dotenv").config({ path: pathToDotEnv });

const { getUserAnswer, extractQuestion } =
    require(path.join(__dirname, "quiz_helper.js"));

// Create Signer and Contract.
//////////////////////////////

const providerKey = process.env.ALCHEMY_KEY;
const sepoliaUrl = `${process.env.ALCHEMY_SEPOLIA_API_URL}${providerKey}`;
// console.log(sepoliaUrl);
const sepoliaProvider = new ethers.JsonRpcProvider(sepoliaUrl);

const signer = new ethers.Wallet(
    process.env.METAMASK_1_PRIVATE_KEY,
    sepoliaProvider
);

const quizABI = require(path.join(__dirname, "quiz_abi"));

// The address of the Quiz contract.
const contractAddress = "0x01FaE6a3E15b8cf2cb89C259b2d6e5bf7cf94782";

const quizContract = new ethers.Contract(contractAddress, quizABI, signer);

async function main() {

    // A. Ask question and get a transaction receipt.
    // Hint: method `askQuestion()`

    console.log("Asking question...");

    // Check if the contract is already deployed.
    const askQuestionTx = await quizContract.askQuestion();
    // console.log(askQuestionTx);

    // Wait for the transaction receipt.
    const receipt = await askQuestionTx.wait();
    console.log(receipt);

    // Check if the event is found
    const { text, id } = extractQuestion(quizContract, receipt);

    console.log(`Question #${id}: ${text}`);

    // Capture user input from the terminal
    const userAnswer = await getUserAnswer();

    // B. Send the answer to the smart contract.
    // Hint: method `answerQuestion`.

    console.log("Sending answer...");

    // Call the answerQuestion function
    const answerQuestionTx = await quizContract.answerQuestion(
        id,
        userAnswer
    );
    await answerQuestionTx.wait();


    // C. Optional. Verify that the answer is correctly stored.
    // Hint: method `getAnswer(questionId)`

    console.log("Checking stored answer...");

    const [storedAnswer, isCorrect] = await quizContract.getAnswer(id);

    const isCorrectStr = isCorrect ? "correct" : "NOT correct";
    console.log(
        `Stored answer for "${text}": ${storedAnswer} (${isCorrectStr}!)`
    );
}


main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
