import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
      index: true,
    },
    subCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubCategory",
      index: true,
    },
    brand: {
      type: String,
      index: true,
    },
    basePrice: {
      type: Number,
      required: true,
    },
    discountedPrice: {
      type: Number,
    },
    stock: {
      type: Number,
      default: 0,
      min: 0,
    },
    color: {
      type: String,
    },
    size: {
      type: String,
    },
    features: {
      type: [String],
      default: [],
    },
    specifications: {
      type: [
        {
          label: {
            type: String,
            trim: true,
          },
          value: {
            type: String,
            trim: true,
          },
        },
      ],
      default: [],
    },
    tags: [{ type: String }],
    image: { type: String, default: "" },

    featured: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
    embedding: {
      type: [Number],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },

    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },

    metaTitle: String,
    metaDescription: String,
  },
  { timestamps: true },
);

productSchema.pre("save", async function () {
  if (this.isModified("name")) {
    this.slug = this.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-");
  }
});

productSchema.index({ name: "text", description: "text" });
productSchema.index({ basePrice: 1 });
productSchema.index({ tags: 1 });

const Product = mongoose.model("Product", productSchema);
export default Product;
