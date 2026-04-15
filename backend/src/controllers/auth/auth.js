
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { Customer, Provider } from '../../models/user.js'
import "dotenv/config";



const generateTokens = (user) => {
    const payload = { userId: user._id, role: user.role };
    const accessToken = jwt.sign(
        payload,
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '15d' }
    )

    const refreshToken = jwt.sign(
        payload,
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: '30d' }
    )

    return { accessToken, refreshToken }
}



export const loginCustomer = async (req, reply) => {
    try {
        const { phone, password } = req.body;
        const customer = await Customer.findOne({ phone });

        if (!customer) {
            return reply.status(400).send({ message: "Account not found" });
        }

        const isMatch = await bcrypt.compare(password, customer.password);
        if (!isMatch) {
            return reply.status(401).send({ message: "Invalid Credentials" });
        }

        const { accessToken, refreshToken } = generateTokens(customer);

        return reply.send({
            message: 'Login Sucessful',
            accessToken,
            refreshToken,
            customer
        })
    } catch (error) {
        return reply.status(500).send({ message: 'An error occurred', error })
    }
}

export const registerCustomer = async (req, reply) => {
    try {
        const { name, phone, password } = req.body;

        if (!name || !phone || !password) {
            return reply.status(400).send({ message: "All fields are required" });
        }

        const existingCustomer = await Customer.findOne({ phone });
        if (existingCustomer) {
            return reply.status(400).send({ message: "Phone number already registered" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const customer = new Customer({
            name,
            phone,
            password: hashedPassword,
            role: 'Customer',
            isActivated: true
        });

        await customer.save();

        const { accessToken, refreshToken } = generateTokens(customer);

        return reply.send({
            message: 'Registration Successful',
            accessToken,
            refreshToken,
            customer
        });
    } catch (error) {
        return reply.status(500).send({ message: 'An error occurred', error });
    }
}

export const resetCustomerPassword = async (req, reply) => {
    try {
        const { phone, newPassword } = req.body;

        if (!phone || !newPassword) {
            return reply.status(400).send({ message: "Phone and new password are required" });
        }

        const customer = await Customer.findOne({ phone });
        if (!customer) {
            return reply.status(404).send({ message: "Account not found" });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        customer.password = hashedPassword;
        await customer.save();

        return reply.send({ message: "Password updated successfully" });

    } catch (error) {
        return reply.status(500).send({ message: "An error occurred", error });
    }
}

export const loginProvider = async (req, reply) => {
    try {
        const { email, password } = req.body;
        let provider = await Provider.findOne({
            $or: [
                { email: email },
                { phone: email }
            ]
        });

        if (!provider) {
            return reply.status(400).send({ message: "Account not found" });
        }

        const isMatch = await bcrypt.compare(password, provider.password);
        if (!isMatch) {
            return reply.status(401).send({ message: "Invalid Credentials" });
        }

        const { accessToken, refreshToken } = generateTokens(provider);

        return reply.send({
            message: 'Login Successful',
            accessToken,
            refreshToken,
            provider
        })
    } catch (error) {
        return reply.status(500).send({ message: "An error occured", error })
    }
}

export const registerProvider = async (req, reply) => {
    try {
        const { email, password, name, phone, provider_id } = req.body;

        if (!name || !phone || !provider_id || !password || !email) {
            return reply.status(400).send({ message: "All fields are required" });
        }

        const existingPhone = await Provider.findOne({ phone });
        if (existingPhone) {
            return reply.status(400).send({ message: "Provider with this phone number already exists" });
        }

        const existingEmail = await Provider.findOne({ email });
        if (existingEmail) {
            return reply.status(400).send({ message: "Provider with this email already exists" });
        }

        const existingId = await Provider.findOne({ provider_id });
        if (existingId) {
            return reply.status(400).send({ message: "Provider ID already taken" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const provider = new Provider({
            email,
            password: hashedPassword,
            name,
            phone,
            provider_id,
            role: 'Provider',
            isActivated: true
        });
        await provider.save();

        const { accessToken, refreshToken } = generateTokens(provider);

        return reply.send({
            message: 'Registration Successful',
            accessToken,
            refreshToken,
            provider
        })
    } catch (error) {
        return reply.status(500).send({ message: "An error occured", error })
    }
}

export const refreshToken = async (req, reply) => {
    const { refreshToken } = req.body

    if (!refreshToken) {
        return reply.send({ message: 'Refresh token required' })
    }

    try {
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        let user;

        if (decoded.role === "Customer") {
            user = await Customer.findById(decoded.userId)
        } else if (decoded.role === "Provider") {
            user = await Provider.findById(decoded.userId);
        } else {
            return reply.status(403).send({ message: "Invalid Role" })
        }

        if (!user) {
            return reply.status(403).send({ message: "User not found" })
        }


        const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);

        return reply.send({
            message: "Token Refreshed",
            accessToken,
            refreshToken: newRefreshToken,
        });
    } catch (error) {
        if (error && error.name === 'TokenExpiredError') {
          
            return reply.status(401).send({ message: 'Refresh token expired' })
        }
        // 403 Forbidden
        return reply.status(403).send({ message: 'Invalid Refresh Token' })
    }
}




export const fetchUser = async (req, reply) => {
    try {
        const { userId, role } = req.user;
        let user;
        if (role === "Customer") {
            user = await Customer.findById(userId);
        } else if (role === "Provider") {
            user = await Provider.findById(userId)
        } else {
            return reply.status(403).send({ message: "Invalid Role" })
        }

        if (!user) {
            return reply.status(404).send({ message: "User not found" });
        }

        return reply.send({
            message: "User fetched sucessfully",
        })
    } catch (error) {
        return reply.status(500).send({ message: "An error occured", error })
    }
}

export const checkUsername = async (req, reply) => {
    try {
        const { provider_id } = req.query;
        if (!provider_id) {
            return reply.status(400).send({ message: "Provider ID is required" });
        }

        const existingId = await Provider.findOne({ provider_id });
        return reply.send({ available: !existingId });
    } catch (error) {
        return reply.status(500).send({ message: "An error occurred", error });
    }
}

export const resetProviderPassword = async (req, reply) => {
    try {
        const { identifier, newPassword } = req.body;
        if (!identifier || !newPassword) {
            return reply.status(400).send({ message: "Identifier and new password are required" });
        }

        const provider = await Provider.findOne({
            $or: [
                { email: identifier },
                { phone: identifier }
            ]
        });

        if (!provider) {
            return reply.status(404).send({ message: "Provider account not found" });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        provider.password = hashedPassword;
        await provider.save();

        return reply.send({ message: "Password updated successfully" });
    } catch (error) {
        return reply.status(500).send({ message: "An error occurred", error });
    }
}

