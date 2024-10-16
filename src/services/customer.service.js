import db from "../models/models/index.js";
import paginate from "./plugins/paginate.plugin.js";
import { UserRole } from "../utils/enums.js";

const getAllCustomers = async (filter, options) => {
    const searchFields = ['firstName', 'lastName', 'email', 'phoneNumber'];
    const customers = await paginate(db.user, { ...filter, role: UserRole.CUSTOMER }, options, [], searchFields);
    const customerResponse = customers.results.map(customer => {
        const plainCustomer = customer.get({ plain: true });
        delete plainCustomer.password;
        return plainCustomer;
    });
    return {
        ...customers,
        results: customerResponse
    };
};

export default {
    getAllCustomers
};
  