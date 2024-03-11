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

// console.log(pathToDotEnv);

/*
this line of code imports the getUserAnswer and extractQuestion functions from 
the "quiz_helper.js" module and assigns them to constants with the same names, 
making them available for use in the current script or module.
*/
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

    const receipt = await quizContract.askQuestion();

    console.log("waiting for the transaction approval...")

    const receipt2 = await sepoliaProvider.waitForTransaction(receipt.hash);

    // console.log("Transaction receipt: ", receipt);
    // console.log("receipt2: ", receipt2);


    // From the transaction receipt we can extract useful information, such as
    // as the question's text and id that were stored in the logs
    // (we will understand logs in detail later in the course).
    const { text, id } = extractQuestion(quizContract, receipt2);

    console.log('Question text: ', text);
    console.log("Question ID: ", id);

    // Now YOU answer the question!
    // Capture user input from the terminal.
    const userAnswer = await getUserAnswer();

    // B. Send the answer to the smart contract.
    // Hint: method `answerQuestion`.

    const answer = await quizContract.answerQuestion(id, userAnswer);

    // console.log("answer: ", answer);
    // C. Optional. Verify that the answer is correctly stored.
    // Hint: method `getAnswer(questionId)`

    const verify = await quizContract.getAnswer(id);
    console.log("your answer: ", verify[0]);
    console.log("the answer is correct? ", verify[1]);
}


main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
