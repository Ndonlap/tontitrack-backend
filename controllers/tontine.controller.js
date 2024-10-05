const UserModel = require('../models/User.js')
const TontineModel = require('../models/Tontine.js')
const axios = require('axios')

const permanentAccessToken = 'a5c515b79ca4bcfe4df9a539ac914d1bedb458fd';

function generateRandom6DigitNumber() {
    const min = 100000; // Minimum 6-digit number
    const max = 999999; // Maximum 6-digit number
    const randomNum = Math.floor(Math.random() * (max - min + 1)) + min;
    return randomNum;

}
// Create a tontine
const createTontine = async (req, res) => {
    try {
        const tontineData = req.body;
        const connected_user_id = req.userId;
        // Validate the tontine data (optional)
        if (!tontineData.name ||
            !tontineData.contributionAmount ||
            !tontineData.paymentSchedule) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Create a new tontine instance
        const newTontine = new TontineModel({
            name: tontineData.name,
            description: tontineData.description,
            contributionAmount: tontineData.contributionAmount,
            paymentSchedule: tontineData.paymentSchedule,
            presidentId: connected_user_id
        });
        newTontine.members.push(connected_user_id)

        // Save the tontine
        await newTontine.save();

        res.status(201).json({ message: 'Tontine created successfully', tontine: newTontine });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create tontine' });
    }
};

// Join a tontine
const joinTontine = async (req, res) => {
    try {
        const code = req.body.code;
        const userId = req.userId;

        // Find the tontine and user
        const tontine = await TontineModel.findOne({ referencialCode: code });
        const user = await UserModel.findById(userId);

        if (!tontine) {
            return res.status(404).json({ error: 'Tontine Code not more valid' });
        }

        // Check if the user is already in the tontine
        if (tontine.members.includes(userId)) {
            return res.status(400).json({ error: 'User is already in the tontine' });
        }

        // Add the user to the tontine's members array
        tontine.members.push(userId);
        // to destory the codes
        user.tontineNumber = user.tontineNumber + 1
        tontine.referencialCode = null;

        // Save the updated tontine
        await tontine.save();
        await user.save();

        res.status(200).json({ message: 'User joined tontine successfully', tontine: tontine });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to join tontine' });
    }
};
// Leave a tontine
const leaveTontine = async (req, res) => {
    try {
        const tontineId = req.params.id;
        const userId = req.userId;

        // Find the tontine and user
        const tontine = await TontineModel.findById(tontineId);
        const user = await UserModel.findById(userId);

        if (!tontine || !user) {
            return res.status(404).json({ error: 'Tontine or user not found' });
        }

        // Check if the user is in the tontine
        if (!tontine.members.includes(userId)) {
            return res.status(400).json({ error: 'User is not in the tontine' });
        }

        // Remove the user from the tontine's members array
        tontine.members = tontine.members.filter(member => member !== userId);

        // Save the updated tontine
        await tontine.save();

        res.status(200).json({ message: 'User left tontine successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to leave tontine' });
    }
};
// generate code
const generateTontineCode = async (req, res) => {
    try {
        const tontineId = req.params.id;
        const userId = req.userId;
        console.log("here")

        // Find the tontine and user
        const tontine = await TontineModel.findById(tontineId);
        const user = await UserModel.findById(userId);

        if (!tontine) {
            return res.status(404).json({ error: 'Tontine not found' });
        }

        // Check if the user is in the tontine
        // if (tontine.presidentId === userId) {
        //     return res.status(400).json({ error: 'You must be the president of the tontine to generate code' });
        // }

        let code = generateRandom6DigitNumber()
        tontine.referencialCode = code
        // Save the updated tontine
        await tontine.save();

        res.status(200).json({ message: 'User left tontine successfully', referencialCode: code });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to leave tontine' });
    }
};
const getTontineByID = async (req, res) => {
    try {
        const tontineId = req.params.id;
        // Find the tontine 
        const tontine = await TontineModel.findById(tontineId);
        if (!tontine) {
            return res.status(404).json({ error: 'Tontine not found' });
        }
        // console.log(tontine.presidentId)

        let president = await UserModel.findById(tontine.presidentId._id)
        let memberList = []
        // console.log(tontine.members.length)

        for (i = 0; i < tontine.members.length; i++) {
            // console.log(tontine.members[i]._id)
            let member = await UserModel.findById(tontine.members[i]._id)
            // console.log(member)

            memberList.push(member)
        }

        res.status(200).json({
            tontine: tontine,
            president: president,
            memberList: memberList
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server tontine' });
    }
};
// get all tontine
const getTontineByMember = async (req, res) => {
    try {
        // const tontineId = req.params.id;
        // Find the tontine 
        console.log(req.userId)
        const tontine = await TontineModel.find();
        // if (!tontine) {
        //     return res.status(404).json({ error: 'Tontine not found' });
        // }
        const tontineList = []
        tontine.map((item) => {
            item.members.map((opt) => {
                if (opt._id.toString() === req.userId)
                    tontineList.push(item)
            })
        })

        res.status(200).json({
            tontine: tontineList,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to leave tontine' });
    }
};
// Add a secretary to a tontine
const addSecretaryToTontine = async (req, res) => {
    try {
        const tontineId = req.params.id;
        const secretaryId = req.body.secretaryId;

        // Find the tontine and user
        const tontine = await TontineModel.findById(tontineId);
        const secretary = await UserModel.findById(secretaryId);

        if (!tontine || !secretary) {
            return res.status(404).json({ error: 'Tontine or secretary not found' });
        }

        // Check if the user is already in the tontine
        if (!tontine.members.includes(secretaryId)) {
            return res.status(400).json({ error: 'Secretary must in the tontine join it first' });
        }

        // Add the secretary to the tontine's secretary field
        tontine.secretary = secretaryId;

        // Save the updated tontine
        await tontine.save();

        res.status(200).json({ message: 'Secretary added to tontine successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to add secretary to tontine' });
    }
};
// Delete a tontine
const deleteTontine = async (req, res) => {
    try {
        const tontineId = req.params.id;

        // Find and delete the tontine
        const deletedTontine = await TontineModel.findByIdAndDelete(tontineId);

        if (!deletedTontine) {
            return res.status(404).json({ error: 'Tontine not found' });
        }

        res.status(200).json({ message: 'Tontine deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete tontine' });
    }
};
// Update tontine details
const updateTontineDetails = async (req, res) => {
    try {
        const tontineId = req.params.id;
        const updatedTontineData = req.body;

        // Validate the updated data (optional)
        if (!updatedTontineData.name ||
            !updatedTontineData.description ||
            !updatedTontineData.contributionAmount ||
            !updatedTontineData.paymentSchedule) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Find the tontine
        const tontine = await TontineModel.findByIdAndUpdate(tontineId, updatedTontineData, { new: true });

        if (!tontine) {
            return res.status(404).json({ error: 'Tontine not found' });
        }

        res.status(200).json(tontine);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update tontine details' });
    }
};

const processContributions = async (req, res) => {
    try {
        // Find the tontine by ID 
        const tontineId = req.params.id;
        console.log("here")
        // console.log(res.params)
        // Find the tontine 
        const tontine = await TontineModel.findById(tontineId);
        if (!tontine) {
            return res.status(404).json({ error: 'Tontine not found' });
        }
        function getCurrentMonth() {
            const date = new Date();
            const options = { month: 'long' }; // Use 'short' for abbreviated month names
            return date.toLocaleString('default', options);
        }

        // Example usage
        const currentMonth = getCurrentMonth();
        // Loop through each member
        let amountCollected = 0
        let memberNumber = tontine.members.length
        let expectedAmount = tontine.contributionAmount * memberNumber
        for (const memberRef of tontine.members) {
            // console.log(memberRef._id)
            const user = await UserModel.findById(memberRef._id);

            if (user) {
                if (user.balance >= tontine.contributionAmount) {
                    // Process contribution
                    user.balance -= tontine.contributionAmount;
                    user.contribution += tontine.contributionAmount;
                    amountCollected += tontine.contributionAmount;
                    // Add contribution to the tontine
                    tontine.contributionsList.push({
                        amount: tontine.contributionAmount,
                        createdDate: Date.now(),
                        userId: user._id,
                    });
                    // Update contributions per month
                    const contributionEntry = user.contributionsPerMonth.find(entry => entry.month === currentMonth);
                    if (contributionEntry) {
                        contributionEntry.contribution += tontine.contributionAmount;
                    } else {
                        user.contributionsPerMonth.push({
                            month: currentMonth,
                            contribution: tontine.contributionAmount,
                        });
                    }
                    // Add notification for contribution
                    user.notifications.push({
                        message: `Contribution of ${tontine.contributionAmount} made successfully for 
                        tontine ${tontine.name}.`,
                        createdDate: Date.now(),
                    });
                } else {
                    // Create a sanction
                    const sanctionAmount = tontine.contributionAmount * 1.10; // 10% of contributionAmount
                    user.sanctions += tontine.contributionAmount * 1.10
                    // Add sanction to the tontine
                    tontine.sanctionsList.push({
                        amount: sanctionAmount,
                        reason: 'Insufficient balance for contribution',
                        done: false,
                        createdDate: Date.now(),
                        userId: user._id,
                    });
                    // Update sanctions per month
                    const sanctionEntry = user.sanctionsPerMonth.find(entry => entry.month === currentMonth);
                    if (sanctionEntry) {
                        sanctionEntry.contribution += sanctionAmount;
                    } else {
                        user.sanctionsPerMonth.push({
                            month: currentMonth,
                            contribution: sanctionAmount,
                        });
                    }
                    // Add notification for sanction
                    user.notifications.push({
                        message: `Sanction applied for insufficient balance. Amount: ${sanctionAmount} for 
                        tontine ${tontine.name}.`,
                        createdDate: Date.now(),
                    });
                }
                // Save the user and the tontine
                await user.save();
                await tontine.save();
            }
        }
        const user = await UserModel.findById(tontine.members[tontine.payoutIndex]._id);
        tontine.payoutIndex = (tontine.payoutIndex + 1) % memberNumber;
        for (const sanction of tontine.sanctionsList) {
            if (sanction.userId.toString() === user._id.toString()) {
                if (!sanction.done) {
                    if (expectedAmount > sanction.amount) {
                        expectedAmount -= sanction.amount
                        sanction.done = true
                        user.notifications.push({
                            message: `Sanction of ${sanction.amount} be set successfully for 
                            tontine ${tontine.name}.`,
                            createdDate: Date.now(),
                        });
                    }
                }
                await user.save()
                await tontine.save()
            }
        }
        console.log(expectedAmount)
        user.balance += expectedAmount;
        user.payouts += tontine.contributionAmount * memberNumber
        const payoutEntry = user.payoutsPerMonth.find(entry => entry.month === currentMonth);
        if (payoutEntry) {
            payoutEntry.contribution += tontine.contributionAmount * memberNumber;
        } else {
            user.payoutsPerMonth.push({
                month: currentMonth,
                contribution: tontine.contributionAmount * memberNumber,
            });
        }
        tontine.balance += (amountCollected - expectedAmount);
        await user.save()
        await tontine.save()


        res.status(200).json({ message: "Contribution maked successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to make contributions details' });
    }
}

async function setSanctionDone(req, res) {
    const { tontineId, sanctionId } = req.params; // Assuming you pass tontineId and sanctionId as URL parameters

    try {
        // Find the tontine by ID
        const tontine = await TontineModel.findById(tontineId);

        if (!tontine) {
            return res.status(404).json({ message: 'Tontine not found' });
        }

        // Find the sanction by ID within the sanctionsList
        const sanction = tontine.sanctionsList.id(sanctionId);

        if (!sanction) {
            return res.status(404).json({ message: 'Sanction not found' });
        }

        // Set the sanction as done
        sanction.done = true;

        // Save the updated tontine
        await tontine.save();

        return res.status(200).json({ message: 'Sanction updated successfully', sanction });
    } catch (error) {
        console.error('Error updating sanction:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

const apiClient = axios.create({
    baseURL: 'https://demo.campay.net/api',
    headers:{ 
            'Authorization': `Token ${permanentAccessToken}`,
              'Content-Type': 'application/json'
            }
})

async function mobilePayment(req,res){
    const payment = req.body
    try{
           const paymentData = {
               amount: payment.amount,
               currency: payment.currency,
               from: payment.from,
               description: payment.description,
           }
   
           const result = await apiClient.post('/collect/',{
               ...paymentData,
               external_reference: "Tontine payment",
               external_user: ""
           });

           if(result){
            //    const savePayment = await paymentSchema.create(paymentData);
               return res.status(200).json({message:"payment made succesfully",data: result?.data})
           }else{
               return res.status(500).json({message: "payment not successful"})
           }
       }catch (error) {
           console.log('error: ', error)
       return res.status(500).json({message: "an error occured in the payment process"})
       }
}

const tontineController = {
    createTontine,
    joinTontine,
    leaveTontine,
    addSecretaryToTontine,
    updateTontineDetails,
    deleteTontine,
    getTontineByID,
    generateTontineCode,
    setSanctionDone,
    getTontineByMember,
    processContributions,
    mobilePayment
};

module.exports = tontineController;