import { Provider, Token, Counter } from '../../models/index.js'
import crypto from 'crypto'


export const bookToken = async (req, reply) => {
    try {
        const userId = req.user && req.user.userId;

        if (!req.body) {
            return reply.code(400).send({ message: 'Request body is required.' });
        }

        const { providerPublicId } = req.body;

        if (!providerPublicId) {
            return reply.code(400).send({ message: 'Provider ID is required.' })
        }

        let provider;
        // Check if providerPublicId looks like a MongoDB ObjectId (24 hex chars)
        if (providerPublicId.match(/^[0-9a-fA-F]{24}$/)) {
            provider = await Provider.findById(providerPublicId);
        }


        if (!provider) {
            provider = await Provider.findOne({ provider_id: providerPublicId.toLowerCase() });
        }

        if (!provider) {
            return reply.code(404).send({ message: 'Provider not found.' })
        }

        const thirtyMinsAgo = new Date(Date.now() - 30 * 60 * 1000);
        const activeTokenCount = await Token.countDocuments({
            user_id: userId,
            provider_id: provider._id,
            is_valid: true,
            issued_at: { $gt: thirtyMinsAgo }
        });

        if (activeTokenCount >= 2) {
            return reply.code(400).send({ message: 'You can only book up to 2 active tokens per provider under 30 mins.' });
        }

        
        const now = new Date();
        const today = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));

       
        const counterId = `${provider._id.toString()}_${today.toISOString().split('T')[0]}`;

        // upsert: true creates the counter if it's the first token of the day.
        const counter = await Counter.findByIdAndUpdate(
            counterId,
            { $inc: { seq: 1 } },
            { new: true, upsert: true }
        )
        
        const newTokenId = counter.seq;


        
        const expiresAt = new Date();
        expiresAt.setHours(23, 59, 59, 999);

        const newToken = new Token({
            token_id: newTokenId,
            issued_at: Date.now(),
            queue_date: today,
            user_id: userId,
            provider_id: provider._id,
            fee: provider.booking_fee,
            status: 'Completed',
            expires_at: expiresAt,
            is_valid: true,
            validation_key: crypto.randomBytes(32).toString('hex')
        })

        await newToken.save();

        
        if (req.server.io) {
            req.server.io.to(userId).emit('token_updated', { message: 'New token booked' });
        }

        return reply.code(201).send({
            message: 'Token booked successfully!',
            token: newToken
        });
    } catch (error) {
        if (error.code === 11000) {
            return reply.code(500).send({ message: 'Failed to generate a token try again' })
        }
        console.log("error booking token", error);
        return reply.code(500).send({ message: 'An internal error occured.' })

    }
}

export const validateToken = async (req, reply) => {
    try {
        
        const { token_id, queue_date, provider_id, validation_key } = req.body || {};

        if (!token_id || !queue_date || !provider_id || !validation_key) {
            return reply.code(400).send({ message: 'Incomplete token data for validation.' });
        }

        const provider = await Provider.findOne({ provider_id: provider_id.toLowerCase() });
        if (!provider) {
            return reply.code(404).send({ message: 'Invalid Provider.' });
        }

        const token = await Token.findOne({
            token_id: parseInt(token_id, 10),
            queue_date: new Date(queue_date),
            provider_id: provider._id,
            validation_key: validation_key
        }).select('+validation_key');

        if (!token) {
            return reply.code(404).send({ message: 'Token not found or invalid key.' });
        }

        if (!token.is_valid) {
            
            return reply.code(410).send({ message: 'This token has already been used or revoked.', status: token.status });
        }

        token.is_valid = false;
        await token.save();

        reply.code(200).send({ message: 'Token validated successfully.', status: token.status, token_id: token.token_id });

        
        if (req.server.io) {
            req.server.io.to(token.user_id.toString()).emit('token_updated', { message: 'Token validated' });
        }


    } catch (error) {
        console.error('Error validating token:', error);
        reply.code(500).send({ message: 'An internal server error occurred.' });
    }
}



//for provider
export const fetchtoken = async (req, reply) => {

    try {
        const providerId = req.user.userId;
        const { date } = req.query;

        
        let queryDate = new Date();
        if (date) {
            queryDate = new Date(date);
        }

        
        queryDate.setUTCHours(0, 0, 0, 0);

        const tokens = await Token.find({
            provider_id: providerId,
            queue_date: queryDate,
            status: 'Completed'

        }).sort({ token_id: 1 }) 
            .populate('user_id', 'name phone created_at');

        return reply.code(200).send({
            message: 'provider queue retrieved sucessfully',
            tokens: tokens
        })

    } catch (error) {
        console.error('Error fetching provider queue', error)
        reply.code(500).send({ message: " Internal server error " })
    }





}



export const fetchUserTokens = async (req, reply) => {
    try {
        const userId = req.user.userId;
        const tokens = await Token.find({ user_id: userId })
            .sort({ created_at: -1 })
            .populate('provider_id', 'name provider_id'); 

        return reply.code(200).send({ message: 'User tokens retrieved successfully', tokens });
    } catch (error) { console.error('Error fetching user tokens', error); reply.code(500).send({ message: 'Internal server error' }); }
}

const normalize = (value = '') => value.toString().trim().toLowerCase();

const escapeRegex = (value = '') =>
    value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const levenshtein = (a = '', b = '') => {
    const m = a.length;
    const n = b.length;
    if (!m) return n;
    if (!n) return m;

    const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
    for (let i = 0; i <= m; i += 1) dp[i][0] = i;
    for (let j = 0; j <= n; j += 1) dp[0][j] = j;

    for (let i = 1; i <= m; i += 1) {
        for (let j = 1; j <= n; j += 1) {
            const cost = a[i - 1] === b[j - 1] ? 0 : 1;
            dp[i][j] = Math.min(
                dp[i - 1][j] + 1,
                dp[i][j - 1] + 1,
                dp[i - 1][j - 1] + cost
            );
        }
    }
    return dp[m][n];
};


const similarity = (a = '', b = '') => {
    if (!a || !b) return 0;
    const maxLen = Math.max(a.length, b.length);
    if (!maxLen) return 0;
    const dist = levenshtein(a, b);
    return 1 - dist / maxLen;
};

const scoreProvider = (query, provider) => {
    const id = normalize(provider.provider_id);
    const name = normalize(provider.name);
    const base = Math.max(similarity(query, id), similarity(query, name));
    const startsWithBoost =
        id.startsWith(query) || name.startsWith(query) ? 0.15 : 0;
    return base + startsWithBoost;
};



export const searchProvider = async (req, reply) => {
    try {
        const rawQuery = (req.query?.providerId || '').toString().trim();
        if (!rawQuery) {
            return reply.code(400).send({ message: 'Provider ID is required' });
        }

        const normalizedQuery = normalize(rawQuery);
        let provider = null;

        if (rawQuery.match(/^[0-9a-fA-F]{24}$/)) {
            provider = await Provider.findById(rawQuery)
                .select('name provider_id _id phone isActivated email contactd_info profileImage');
        }

        if (!provider) {
            provider = await Provider.findOne({ provider_id: normalizedQuery })
                .select('name provider_id _id phone isActivated email contactd_info profileImage');
        }

        if (!provider) {
            provider = await Provider.findOne({ name: new RegExp(`^${escapeRegex(rawQuery)}$`, 'i') })
                .select('name provider_id _id phone isActivated email contactd_info profileImage');
        }

        let suggestions = [];
        const regex = new RegExp(escapeRegex(rawQuery), 'i');
        const candidates = await Provider.find({
            $or: [{ provider_id: regex }, { name: regex }],
        }).select('name provider_id _id phone isActivated email contactd_info profileImage');

        if (candidates?.length) {
            suggestions = candidates
                .map((p) => ({ provider: p, score: scoreProvider(normalizedQuery, p) }))
                .sort((a, b) => b.score - a.score)
                .map((item) => item.provider);

            if (provider) {
                suggestions = suggestions.filter(
                    (p) => p._id.toString() !== provider._id.toString()
                );
            }

            suggestions = suggestions.slice(0, 3);
        }


       return reply.code(200).send({
            message: provider ? 'Provider found' : 'Similar providers found',
            provider: provider || null,
            suggestions,
        });
        
    } catch (error) {
        console.error('Search provider error:', error);
        return reply.code(500).send({ message: 'Internal server error' });
    }
}
