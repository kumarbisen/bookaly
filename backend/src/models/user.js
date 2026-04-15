import mongoose, { Schema } from "mongoose";

// Base User Schema

const userSchema = new mongoose.Schema({
    name: { type: String },
    role: {
        type: String,
        // ENUM stands for Enumeration. 
        // It is a data type that allows a column to store a value from a predefined, limited set of possible string values
        enum: ["Customer", "Admin", "Provider"],
        required: true,
    },
    isActivated: { type: Boolean, default: false }
})

// Customer Schema

const customerSchema = new mongoose.Schema({
    ...userSchema.obj,
    phone: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["Customer"], default: "Customer" },
    created_at: {
        type: Date,
        default: Date.now
    }
}, {
    // here you can specified schema collection if you want it uppercase
    // {collection:'Customer'}
    timestamps: false
})

// Admin Schema
const adminSchema = new mongoose.Schema({
    ...userSchema.obj,
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["Admin"], default: 'Admin' }
})


// Provider Schema

const providerSchema = new mongoose.Schema({
    ...userSchema.obj,
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true }, // Bussiness name
    phone: { type: String, required: true },
    role: { type: String, enum: ["Provider"], default: "Provider" },
    booking_fee: {
        type: Number,
        required: false,
        default: 0,
        min: 0
    },
    provider_id: {
        type: String, // username
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
    },
    profileImage: { 
    type: String, 
    default: null 
},
profileImagePublicId: { 
    type: String, 
    default: null 
},
    contactd_info: {
        type: Object,
        // Using Object for flexible storage of address,Email,social handle etc
        default: {}
    },
    isSubscribed: { type: Boolean, default: false },
    subscriptionPlan: { type: String, default: null },
    subscriptionExpiry: { type: Date, default: null },
    created_at: { type: Date, default: Date.now }

})


export const Customer = mongoose.model("User", customerSchema);
export const Provider = mongoose.model("Provider", providerSchema);
export const Admin = mongoose.model("Admin", adminSchema);