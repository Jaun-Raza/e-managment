import bcrypt from 'bcrypt'
import cron from 'node-cron'

// User Model
import { User } from '../models/user.js';

export async function signUp(req, res) {
    const { username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
        username,
        email,
        password: hashedPassword,
    })

    try {
        const userConflict = await User.findOne({
            $or: [
                { username },
                { email },
            ]
        });

        if (userConflict) {
            if (userConflict.username === username) {
                return res.status(409).json({ error: "Username already exists, try with a different one.", success: false });
            }
            if (userConflict.email === email) {
                return res.status(409).json({ error: 'Email has been used', success: false });
            }
        }

        if (password.length < 8) {
            return res.status(400).json({ error: 'Password must be at least 8 characters long.', success: false });
        }

        await newUser.save();

        return res.status(200).json({ success: true, message: "Successfully registered, you can now login!" });
    } catch (err) {
        console.log(err)
        return res.status(500).json({ success: false, error: "Something went wrong, try again later." });
    }
}

export async function logIn(req, res) {
    const { email, password } = req.body;

    try {
        await User.findOne({ email }).then(async (foundUser) => {
            if (!foundUser) return res.status(409).json({ error: 'Invalid Credentials, try register yourself!', success: false });

            const comparePassword = await bcrypt.compare(password, foundUser.password);

            if (!comparePassword) {
                return res.status(401).json({ error: "Invalid Credentials", success: false })
            } else {

                const token = req.token;

                foundUser.tokens.push({
                    token,
                    createdAt: new Date()
                });

                await foundUser.save();
                return res.status(200).json({ token, success: true, message: "Successfully Logged In!" });
            }
        })

    } catch (err) {
        console.log(err)
        return res.status(500).json({ success: false, error: "Something went wrong, try again later." });
    }
}

export async function getUserData(req, res) {
    const email = req.query.email

    try {
        await User.findOne({ email }).then((foundUser) => {
            if (!foundUser) return res.status(404).json({ success: false, error: "User not found" })

            return res.status(200).json({ success: true, data: foundUser })
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ success: false, error: "Something went wrong, try again later." });
    }
}

const TOKEN_EXPIRATION_DAYS = 30;

function isTokenExpired(createdAt) {
    const createdDate = new Date(createdAt);
    const expirationDate = new Date(createdDate);
    expirationDate.setDate(createdDate.getDate() + TOKEN_EXPIRATION_DAYS);
    return expirationDate < new Date();
}

cron.schedule('0 0 * * *', async () => {
    console.log('Running the token cleanup task...');

    try {
        const users = await User.find();

        for (const user of users) {
            const validTokens = user.tokens.filter(t => !isTokenExpired(t.createdAt.$date));

            if (validTokens.length !== user.tokens.length) {
                user.tokens = validTokens;
                await user.save();
                console.log(`Expired tokens removed for user: ${user.email}`);
            }
        }

    } catch (err) {
        console.error('Error during token cleanup:', err);
    }
});