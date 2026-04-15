import { Provider } from "../../models/user.js";

export const updateSubscription = async (req, reply) => {
    try {
        const { providerId, isSubscribed, subscriptionPlan, subscriptionExpiry } = req.body;

        const provider = await Provider.findByIdAndUpdate(
            providerId,
            {
                isSubscribed,
                subscriptionPlan,
                subscriptionExpiry
            },
            { new: true }
        );

        if (!provider) {
            return reply.status(404).send({ message: "Provider not found" });
        }

        return reply.send({
            message: "Subscription updated successfully",
            provider
        });
    } catch (error) {
        console.error("Error updating subscription:", error);
        return reply.status(500).send({ message: "Internal Server Error" });
    }
};
