import db from "../models/models/index.js";

const getAllActiveDeliveryServices = async () => {
    return await db.deliveryService.findAll({
        where: {
            isActive: true
        },
        attributes: ['id', 'name', 'description', 'deliveryFee']
    })
}

export default {
  getAllActiveDeliveryServices
}