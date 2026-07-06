import { Address } from "../models/addressModel.js";
import { User } from "../models/userModel.js";
import { Order } from "../models/orderModel.js";

//get all the customers
export const getAllCustomers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "", gender, status } = req.query;

    const pageNUm = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNUm - 1) * limitNum;

    const filter = {
      $or: [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phoneNumber: { $regex: search, $options: "i" } },
      ],
    };

    if (gender) {
      filter.gender = gender;
    }

    if (status) {
      filter.status = status;
    }

    const users = await User.find(filter)
      .select("-password -googleId -__v")
      .skip(skip)
      .limit(limitNum)
      .sort();
    const total = await User.countDocuments(filter);

    return res.status(200).send({
      status: "success",
      messgae: "User fetched successfully",
      users,
      pagination: {
        total,
        page: pageNUm,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      status: "error",
      message: "Error fetching customers",
    });
  }
};

// get cutsomer details with :id
export const getUserDetials = async (req, res) => {
  try {
    const { id: userId } = req.params;
    const user = await User.findById(userId).select("-password -googleId -__v");
    if (!user) {
      return res.status(404).send({
        status: "error",
        messgae: "User not found",
      });
    }
    const address = await Address.find({ user: userId }).sort({
      isDefault: -1,
      createdAt: -1,
    });
    return res.status(200).send({
      status: "success",
      message: "User details fetched successfully",
      data: {
        user,
        address,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      status: "error",
      messgae: "Error fetching user details",
    });
  }
};

// update customer status like block unblock
export const updateCustomerStat = async (req, res) => {
  try {
    const { status, reason } = req.body;
    const { id: userId } = req.params;

    if (!status || !reason || !userId) {
      return res.status(400).send({
        status: "error",
        message: "Please provide status, reason and user id",
      });
    }
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { status, reason },
      { new: true },
    );
    if (!updatedUser) {
      return res.status(404).send({
        status: "error",
        message: "user not found",
      });
    }
    return res.status(200).send({
      status: "success",
      message: "customer status updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      status: "error",
      message: "erro updating status",
    });
  }
};

// get cutomer Orders

export const getOrderByUser = async (req, res) => {
  try {
    const userId = req.params.id;
    if (!userId) {
      return res.status(400).send({
        status: "error",
        message: "Please provide user id",
      });
    }
    const order = await Order.find({ user: userId })
      .populate("user", "name email phoneNumber")
      .populate("shippingAddress")
      .populate("items.product", "name images");
    if (!order) {
      return res.status(404).send({
        status: "error",
        message: "Order not found",
      });
    }
    return res.status(200).send({
      status: "success",
      message: "Order fetched successfully",
      data: order,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      status: "error",
      message: "error fetching orders",
    });
  }
};

// get cutomer Order Details with :id
export const getOrderDetails = async (req, res) => {
  try {
    const orderId = req.params.id;
    if (!orderId) {
      return res.status(400).send({
        status: "error",
        message: "Please provide order id",
      });
    }
    const order = await Order.findById(orderId)
      .populate("user", "name email")
      .populate("shippingAddress")
      .populate("items.product", "name images");
    if (!order) {
      return res.status(404).send({
        status: "error",
        message: "Order not found",
      });
    }
    return res.status(200).send({
      status: "success",
      message: "Order details fetched successfully",
      data: order,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      status: "error",
      message: "error fetching order details",
    });
  }
};
