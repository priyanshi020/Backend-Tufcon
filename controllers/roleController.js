const roleModel = require('../models/roleModel');
// create role api start
exports.createRole = async (req, res) => {
    try {
        const roleData = req.body;
        await roleModel.create(roleData);
        res.json({
            message: "Role Created Successfully"
        });
    } catch (error) {
        console.error("Error in creating role:", error);
        return res.status(500).send({ message: "Error in creating Role" });
    }
};
// create role api end
// get all  role api start
exports.getRole = async (req, res) => {
    try {
        const data = await roleModel;
        res.json({
            message: "Role Retrieved Successfully",
            status: true,
            data: data
        });
    } catch (error) {
        console.error("Error in getting roles:", error);
        return res.status(500).send({ message: "Error in Getting Role", status: false });
    }
};
// get all  role api end
// update  role api start
exports.updateRole = async (req, res) => {
    try {
        const roleData = req.body;
        await roleModel.updateOne({ _id: roleData._id }, roleData);
        res.json({
            message: "Role Updated Successfully",
            status: true,
        });
    } catch (error) {
        console.error("Error in updating role:", error);
        return res.status(500).send({ message: "Error in Updating Role", status: false });
    }
};
// update  role api end
// delete  role api start
exports.deleteRole = async (req, res) => {
    try {
        const id = req.body.id;
        await roleModel.updateOne({ _id: id });
        res.json({
            message: "Role Deleted Successfully",
            status: true,
        });
    } catch (error) {
        console.error("Error in deleting role:", error);
        return res.status(500).send({ message: "Error in deleting Role", status: false });
    }
};
// delete  role api end
