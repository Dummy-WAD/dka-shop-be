import db from "../models/models/index.js";

const getAllActiveDeliveryServices = async () => {
    return await db.deliveryService.findAll({
        where: {
            is_active: true
        },
        attributes: ['id', 'name', 'description', 'deliveryFee']
    })
}

export default {
  getAllActiveDeliveryServices
}