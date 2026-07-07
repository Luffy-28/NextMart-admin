import mongoose from "mongoose";
import { configDotenv } from "dotenv";
import { config } from "../config/config.js";
import { Category } from "../models/categoryModel.js";
import { SubCategory } from "../models/subCategoryModel.js";
import Product from "../models/productModel.js";
import { Order } from "../models/orderModel.js";

// Ensure environment variables are loaded
configDotenv();

const mockCategories = [
  {
    name: "Electronics",
    slug: "electronics",
    image: "https://nextmart-admin.s3.ap-southeast-2.amazonaws.com/categories/electronics.png",
    isActive: true,
  },
  {
    name: "Footwear",
    slug: "footwear",
    image: "https://nextmart-admin.s3.ap-southeast-2.amazonaws.com/categories/footwear.png",
    isActive: true,
  },
  {
    name: "Fitness & Nutrition",
    slug: "fitness-nutrition",
    image: "https://nextmart-admin.s3.ap-southeast-2.amazonaws.com/categories/fitness.png",
    isActive: true,
  },
];

const mockSubCategories = [
  {
    name: "Audio Accessories",
    slug: "audio-accessories",
    image: "https://nextmart-admin.s3.ap-southeast-2.amazonaws.com/subcategories/audio.png",
    categoryName: "Electronics",
    isActive: true,
  },
  {
    name: "Running Shoes",
    slug: "running-shoes",
    image: "https://nextmart-admin.s3.ap-southeast-2.amazonaws.com/subcategories/running-shoes.png",
    categoryName: "Footwear",
    isActive: true,
  },
  {
    name: "Supplements",
    slug: "supplements",
    image: "https://nextmart-admin.s3.ap-southeast-2.amazonaws.com/subcategories/supplements.png",
    categoryName: "Fitness & Nutrition",
    isActive: true,
  },
];

const mockProducts = [
  {
    name: "NextMart Noise Cancelling Headphones",
    description: "Experience premium sound with industry-leading noise cancellation.",
    brand: "NextMart",
    basePrice: 299.99,
    discountedPrice: 249.99,
    stock: 50,
    color: "Black",
    size: "One Size",
    features: ["Active Noise Cancellation", "40-hour battery life", "Hi-Res Audio certified"],
    specifications: [
      { label: "Weight", value: "250g" },
      { label: "Connectivity", value: "Bluetooth 5.2, AUX" },
    ],
    tags: ["audio", "headphones", "wireless", "electronics"],
    image: "https://nextmart-admin.s3.ap-southeast-2.amazonaws.com/products/headphones.png",
    categoryName: "Electronics",
    subCategoryName: "Audio Accessories",
    featured: true,
    isActive: true,
  },
  {
    name: "Vapor Ultra Running Shoes",
    description: "Lightweight running shoes built for maximum speed and comfort.",
    brand: "Nike",
    basePrice: 159.99,
    discountedPrice: 129.99,
    stock: 80,
    color: "Volt Green",
    size: "10",
    features: ["ZoomX foam midsole", "Engineered mesh upper", "Carbon fiber plate"],
    specifications: [
      { label: "Weight", value: "210g" },
      { label: "Arch Support", value: "Neutral" },
    ],
    tags: ["shoes", "running", "athletic", "footwear"],
    image: "https://nextmart-admin.s3.ap-southeast-2.amazonaws.com/products/running-shoes.png",
    categoryName: "Footwear",
    subCategoryName: "Running Shoes",
    featured: true,
    isActive: true,
  },
  {
    name: "Whey Protein Powder 2kg — Chocolate",
    description: "Premium grass-fed whey protein isolate to support muscle recovery and growth.",
    brand: "Optimum Nutrition",
    basePrice: 69.99,
    discountedPrice: 59.99,
    stock: 120,
    color: "N/A",
    size: "2kg",
    features: ["25g Protein per scoop", "Low sugar & low fat", "Rich chocolate flavour"],
    specifications: [
      { label: "Servings", value: "60" },
      { label: "Protein Source", value: "Whey Isolate & Concentrate" },
    ],
    tags: ["protein", "supplements", "fitness", "nutrition"],
    image: "https://nextmart-admin.s3.ap-southeast-2.amazonaws.com/products/whey.png",
    categoryName: "Fitness & Nutrition",
    subCategoryName: "Supplements",
    featured: false,
    isActive: true,
  },
];

const seedProducts = async () => {
  try {
    console.log(`Connecting to MongoDB...`);
    await mongoose.connect(config.mongoUrl);
    console.log("Connected to MongoDB.");

    // Clear existing collections
    console.log("Clearing existing catalog collections...");
    await Category.deleteMany({});
    await SubCategory.deleteMany({});
    await Product.deleteMany({});
    await Order.deleteMany({});
    console.log("Existing catalog collections cleared.");

    // 1. Seed Categories
    console.log("Seeding Categories...");
    const categoryMap = {};
    for (const cat of mockCategories) {
      const created = await Category.create(cat);
      categoryMap[cat.name] = created._id;
      console.log(`✅ Created Category: ${cat.name}`);
    }

    // 2. Seed SubCategories
    console.log("Seeding Sub-categories...");
    const subCategoryMap = {};
    for (const sub of mockSubCategories) {
      sub.category = categoryMap[sub.categoryName];
      const created = await SubCategory.create(sub);
      subCategoryMap[sub.name] = created._id;
      console.log(`✅ Created Sub-Category: ${sub.name}`);
    }

    // 3. Seed Products
    console.log("Seeding Products...");
    const productMap = {};
    for (const prod of mockProducts) {
      prod.category = categoryMap[prod.categoryName];
      prod.subCategory = subCategoryMap[prod.subCategoryName];
      const created = await Product.create(prod);
      productMap[prod.name] = created;
      console.log(`✅ Created Product: ${prod.name}`);
    }

    // 4. Seed Mock Orders to populate Dashboard analytics
    console.log("Seeding Mock Orders...");
    const mockOrders = [
      {
        orderNumber: `ORD-${Date.now()}-001`,
        user: new mongoose.Types.ObjectId(), // Mock User ObjectId
        items: [
          {
            product: productMap["Whey Protein Powder 2kg — Chocolate"]._id,
            name: "Whey Protein Powder 2kg — Chocolate",
            image: productMap["Whey Protein Powder 2kg — Chocolate"].image,
            price: 59.99,
            quantity: 7,
          },
          {
            product: productMap["Vapor Ultra Running Shoes"]._id,
            name: "Vapor Ultra Running Shoes",
            image: productMap["Vapor Ultra Running Shoes"].image,
            price: 129.99,
            quantity: 3,
          },
        ],
        totalAmount: 59.99 * 7 + 129.99 * 3,
        paymentStatus: "paid",
        orderStatus: "delivered",
      },
      {
        orderNumber: `ORD-${Date.now()}-002`,
        user: new mongoose.Types.ObjectId(),
        items: [
          {
            product: productMap["NextMart Noise Cancelling Headphones"]._id,
            name: "NextMart Noise Cancelling Headphones",
            image: productMap["NextMart Noise Cancelling Headphones"].image,
            price: 249.99,
            quantity: 4,
          },
        ],
        totalAmount: 249.99 * 4,
        paymentStatus: "paid",
        orderStatus: "delivered",
      },
    ];

    await Order.insertMany(mockOrders);
    console.log("✅ Seeded mock orders for Dashboard analytics.");

    console.log("🎉 Seeding completed successfully!");
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
};

seedProducts();
