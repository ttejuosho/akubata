import Address from "../models/Address.js";
import sequelize from "../config/db.js";

export const getAddressById = async (req, res) => {
  try {
    const { addressId } = req.params;
    const userId = req.user.userId;

    const address = await Address.findOne({
      where: { addressId, userId },
    });

    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }

    return res.status(200).json({
      message: "success",
      address,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getAddresses = async (req, res) => {
  const addresses = await Address.findAll({
    where: { userId: req.user.userId },
  });
  res.json(addresses);
};

export const addAddress = async (req, res) => {
  const userId = req.user.userId;
  const addressPayload = req.body;

  // Check for duplicates (same address for same user)
  const duplicate = await Address.findOne({
    where: {
      userId,
      addressLine1: addressPayload.addressLine1,
      city: addressPayload.city,
      state: addressPayload.state || null,
      zipCode: addressPayload.zipCode,
      country: addressPayload.country,
    },
  });

  if (duplicate) {
    return res.status(409).json({
      message: "This address already exists",
      addressId: duplicate.addressId,
    });
  }

  const address = await Address.create({
    ...addressPayload,
    userId,
  });
  res.status(201).json({ message: "Address created successfully", address });
};

export const updateAddress = async (req, res) => {
  const address = await Address.findOne({
    where: {
      addressId: req.params.addressId,
      userId: req.user.userId,
    },
  });
  if (!address) return res.status(404).json({ message: "Address not found" });
  await address.update(req.body);
  res.json(address);
};

export const deleteAddress = async (req, res) => {
  const address = await Address.findOne({
    where: { addressId: req.params.addressId, userId: req.user.userId },
  });
  if (!address) return res.status(404).json({ message: "Address not found" });
  await address.destroy();
  res.json({ message: "Deleted" });
};

export const setDefaultAddress = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { addressId } = req.params;
    const userId = req.user.userId;

    // Step 1: Verify the address belongs to the user
    const exists = await Address.findOne({
      where: { addressId, userId },
      transaction: t,
    });

    if (!exists) {
      await t.rollback();
      return res.status(404).json({ message: "Address not found" });
    }

    // Step 2: Clear all defaults
    await Address.update(
      { isDefault: false },
      { where: { userId }, transaction: t }
    );

    // Step 3: Set new default
    await Address.update(
      { isDefault: true },
      { where: { addressId, userId }, transaction: t }
    );

    await t.commit();

    return res.json({
      message: "Default address updated successfully",
    });
  } catch (err) {
    await t.rollback();
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
