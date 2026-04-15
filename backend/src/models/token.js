import mongoose from "mongoose"



const AppointTokenSchema = new mongoose.Schema({

    token_id: {
        type: Number,
        required: true,
        min: 1
    },

    queue_date: {
        type: Date,
        required: true,

    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },

    provider_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Provider',
        required: true
    },

    status: {
        type: String,
        required: true,
        default: 'Completed',
        enum: ['Completed', 'Cancelled', 'Pending']
    },

    
    fee: {
        type: Number,
        required: true,
        default: 0
    },


    issued_at: {
        type: Date,
        default: Date.now,
        expires: '30d'
    },
    
    expires_at: {
        type: Date,
        required: true
    },
    is_valid: {
        type: Boolean,
        default: true,
        required: true
    },
    validation_key: {
        type: String,
        required: false,
        unique: true,
        
        select: false
    },
}, {

    indexes: [
        {
            fields: { token_id: 1, provider_id: 1, queue_date: 1 },
            options: { unique: true }
        },

    ]
});

export const Token = mongoose.model('Token', AppointTokenSchema);
export default Token;