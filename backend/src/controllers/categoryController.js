import { Category } from "../models/categoryModel.js";

// get all the category
export const getAllCategory = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const filter = {
      $or: [{ name: { $regex: search, $options: "i" } }],
    };
    const category = await Category.find(filter).skip(skip).limit(limitNum);
    const total = await Category.countDocuments(filter);

    return res.status(200).send({
      status: "success",
      message: "Category fetched successfully",
      category,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      status: "error",
      message: "error fetching category",
    });
  }
};

// create category

export const createCategory = async (req, res) => {
  try {
    const { name, slug, image, isActive } = req.body;
    if (!name || !slug || !image || isActive === undefined) {
      return res.status(400).send({
        status: "error",
        message: "Please provide name, slug, image and isActive",
      });
    }
    // check if the category is already exists
    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      return res.status(400).send({
        status: "error",
        message: "Category already exist",
      });
    }
    const category = await Category.insertOne({ name, slug, image, isActive });
    return res.status(201).send({
      status: "success",
      message: "category created successfully",
      data: category,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      status: "error",
      message: "error creating category",
    });
  }
};

//update category
export const updateCategory = async (req, res) => {
  try {
    const { catId } = req.params;
    const { name, slug, image, isActive } = req.body;
    if (!name || !slug || !image || isActive === undefined) {
      return res.status(400).send({
        status: "error",
        message: "Please provide name, slug, image and isActive",
      });
    }
    const updatedcategory = await Category.findByIdAndUpdate(
      catId,
      { name, slug, image, isActive },
      { new: true },
    );
    if (!updatedcategory) {
      return res.status(404).send({
        status: "error",
        message: "category not found",
      });
    }
    return res.status(200).send({
      status: "success",
      message: "category updated successfully",
      data: updatedcategory,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      status: "error",
      message: "error updating category",
    });
  }
};

//delete category — soft-delete by setting isActive: false
export const deleteCategory = async (req, res) => {
  try {
    const { catId } = req.params;

    if (!catId) {
      return res.status(400).send({
        status: "error",
        message: "Please provide a category id",
      });
    }

    const updatedcategory = await Category.findByIdAndUpdate(
      catId,
      { isActive: false },
      { new: true },
    );

    if (!updatedcategory) {
      return res.status(404).send({
        status: "error",
        message: "category not found",
      });
    }

    return res.status(200).send({
      status: "success",
      message: "category deactivated successfully",
      data: updatedcategory,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      status: "error",
      message: "error deactivating category",
    });
  }
};
