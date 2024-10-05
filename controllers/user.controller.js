const UserModel = require('../models/User.js')
const TontineModel = require('../models/Tontine.js')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt');
const validator = require('validator');


const login = async (req, res) => {
    try {
        let { email, password } = req.body
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password must be provided.' });
        }
        let user = await UserModel.findOne({ email: email.toLowerCase() })
        if (user == null) {
            return res.status(401).json({ error: 'Invalid email or password' })
        }
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        let token = jwt.sign({
            id: user._id,
            tel: user.tel,
            name: user.name,
            email: user.email,
            accountType: user.accountType
        }, 'mytoken')
        // console.log(token)

        user.token = token
        user.save()
            .then((result) => {
            return res.status(200).json({
                    message: 'login successful',
                    phone: user.phone,
                    name: user.name,
                    token: token,
                    accountType: user.accountType
            })
        })
        .catch((err) => {
            return res.status(401).json({ error: 'check your connection' })
        })
    }
    catch (e) {
        console.log(e)
        return res.status(500).json({ error: 'server error' })
    }

}

const register = async (req, res) => {
    try {
        let { name,phone, dob, email, password, confirmPass } = req.body
        console.log(req.body)
        if (!validator.isEmail(email)) {
            return res.status(400).send({ error: 'Invalid email.' });
        }
        const existingAdmin = await UserModel.findOne({ 'email': email });
        if (existingAdmin) {
            return res.status(409).send({ error: 'User Email already in use.' });
        }

        // Password validation
        if (password.length < 8) {
            return res.status(400).send({ error: 'Password must be at least 8 characters.' });
        }
        if (!/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
            return res.status(400).send({ error: 'Password must contain at least one lowercase letter, one uppercase letter, and one digit.' });
        }
        if (password !== confirmPass) {
            return res.status(400).send({ error: 'Passwords do not match.' });
        }
        const hash = await bcrypt.hash(password, 9);
        let user = new UserModel({
            name,
            phone,
            email: email.toLowerCase(),
            password: hash,
            dob
        })
        user.save()
            .then(respond => {
                return res.status(200).json({ message: 'User created successfully' })
            })
            .catch(err => {
                console.log(err)
                return res.status(409).json({ error: 'check you connection' });
            })

    }
    catch (e) {
        console.log(e)
        return res.status(500).json({ error: 'server error' })
    }

}

const getAllUsers = async (req, res) => {
    try {
        const users = await UserModel.find();
        return res.status(200).json({ users: users });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
}

// Controller function to create a new user
const createUser = async (req, res) => {
    try {
        // Validate the request body data (optional)
        if (!req.body.name || !req.body.email || !req.body.phone ||
            !req.body.token || !req.body.gender || !req.body.accountType) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Create a new user instance from the request body
        const newUser = new UserModel(req.body);

        // Save the new user to the database
        await newUser.save();

        // Respond with the newly created user
        res.status(201).json(newUser);
    } catch (error) {
        // Handle errors (e.g., validation errors, database errors)
        console.error(error);
        res.status(500).json({ error: 'Failed to create user' });
    }
};

// get user from id
const getUserById = async (req, res) => {
    try {
        // Get the user ID from the request parameters
        const userId = req.params.id;
        // Find the user by ID
        const user = await UserModel.findById(userId);
        // Check if user exists
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        // Respond with the found user
        res.json(user);
    } catch (error) {
        // Handle errors (e.g., database errors)
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch user' });
    }
};
const getUserDetail = async (req, res) => {
    try {
        // Get the user ID from token decoded
        const userId = req.userId;
        // Find the user by ID
        const user = await UserModel.findById(userId);
        // Check if user exists
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        // Respond with the found user
        return res.status(200).json(user);
    } catch (error) {
        // Handle errors (e.g., database errors)
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch user' });
    }
};
// update a user detail
const updateUser = async (req, res) => {
    try {
        // Get the user ID from the request parameters
        const userId = req.params.id;

        // Find the user by ID
        const user = await UserModel.findById(userId);

        // Check if user exists
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Update user fields with data from the request body
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        // Update other fields as needed

        // Save the updated user
        await user.save();

        // Respond with the updated user
        res.json(user);
    } catch (error) {
        // Handle errors (e.g., validation errors, database errors)
        console.error(error);
        res.status(500).json({ error: 'Failed to update user' });
    }
};
// add contribution
const addUserContribution = async (req, res) => {
    try {
        const userId = req.params.id;
        const contributionData = req.body;

        // Validate the contribution data (optional)
        if (!contributionData.amount || !contributionData.tontineId) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Find the user and tontine
        const user = await UserModel.findById(userId);
        const tontine = await TontineModel.findById(contributionData.tontineId);

        if (!user || !tontine) {
            return res.status(404).json({ error: 'User or tontine not found' });
        }

        // Add the contribution to the user's contributions array
        user.contributions.push(contributionData);

        // Save the updated user
        await user.save();

        res.status(200).json({ message: 'Contribution added successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to add contribution' });
    }
};
// add sanction
const addUserSanction = async (req, res) => {
    try {
        const userId = req.params.id;
        const sanctionData = req.body;

        // Validate the sanction data (optional)
        if (!sanctionData.amount || !sanctionData.reason || !sanctionData.tontineId) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Find the user and tontine
        const user = await UserModel.findById(userId);
        const tontine = await TontineModel.findById(sanctionData.tontineId);

        if (!user || !tontine) {
            return res.status(404).json({ error: 'User or tontine not found' });
        }

        // Add the sanction to the user's sanctions array
        user.sanctions.push(sanctionData);

        // Save the updated user
        await user.save();

        res.status(200).json({ message: 'Sanction added successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to add sanction' });
    }
};
// mark sanction done
const setSanctionDone = async (req, res) => {
    try {
        const userId = req.params.id;
        const sanctionIndex = req.params.sanctionIndex;

        // Find the user
        const user = await UserModel.findById(userId);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Check if the sanction index exists
        if (!user.sanctions[sanctionIndex]) {
            return res.status(404).json({ error: 'Sanction not found' });
        }

        // Set the sanction to done
        user.sanctions[sanctionIndex].done = true;

        // Save the updated user
        await user.save();

        res.status(200).json({ message: 'Sanction set to done' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to set sanction to done' });
    }
};
// add a transaction
const addTransactionAndNotification = async (req, res) => {
    try {
        const userId = req.params.id;
        const transactionData = req.body;

        // Validate the transaction data (optional)
        if (!transactionData.amount || !transactionData.type) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Find the user
        const user = await UserModel.findById(userId);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Add the transaction to the user's transactions array
        user.transactions.push(transactionData);

        // Create a notification message based on the transaction type
        let notificationMessage;
        if (transactionData.type === 'CashIn') {
            notificationMessage = `You have successfully cashed in ${transactionData.amount}`;
        } else if (transactionData.type === 'CashOut') {
            notificationMessage = `You have successfully cashed out ${transactionData.amount}`;
        } else {
            return res.status(400).json({ error: 'Invalid transaction type' });
        }

        // Add the notification to the user's notifications array
        user.notifications.push({ message: notificationMessage, senderId: user._id });

        // Save the updated user
        await user.save();

        res.status(200).json({ message: 'Transaction and notification added successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to add transaction and notification' });
    }
};
// create a notification
const createNotification = async (req, res) => {
    try {
        const userId = req.params.id;
        const notificationData = req.body;

        // Validate the notification data (optional)
        if (!notificationData.message) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Find the user
        const user = await UserModel.findById(userId);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Add the notification ID to the user's notifications array
        user.notifications.push({
            message: notificationData.message,
            senderId: user._id
        });

        // Save the updated user
        await user.save();

        res.status(201).json({ message: 'Notification created successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: 'Failed to create notification'
        });
    }
};
// Delete notification
const deleteNotification = async (req, res) => {
    try {
        const userId = req.params.id;
        const notificationId = req.params.notificationId;

        // Find the user
        const user = await UserModel.findById(userId);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Find the notification index to remove
        const notificationIndex = user.notifications.findIndex(
            (notification) => notification._id.toString() === notificationId
        );

        // If the notification is not found
        if (notificationIndex === -1) {
            return res.status(404).json({ error: 'Notification not found' });
        }

        // Remove the notification from the array
        user.notifications.splice(notificationIndex, 1);

        // Save the updated user
        await user.save();

        res.status(200).json({ message: 'Notification deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: 'Failed to delete notification'
        });
    }
};

const userController = {
    createUser,
    getUserById,
    updateUser,
    addUserContribution,
    addUserSanction,
    setSanctionDone,
    addTransactionAndNotification,
    createNotification,
    deleteNotification,
    login,
    register,
    getAllUsers,
    getUserDetail
};

module.exports = userController;