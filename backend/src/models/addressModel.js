import mongoose from "mongoose";

const addressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    street: {
      type: String,
      required: true,
    },

    suburb: {
      type: String,
    },

    city: {
      type: String,
      required: true,
    },

    state: {
      type: String,
      required: true,
    },

    postcode: {
      type: String,
      required: true,
    },

    country: {
      type: String,
      default: "Australia",
    },

    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

export const Address = mongoose.model("Address", addressSchema);
