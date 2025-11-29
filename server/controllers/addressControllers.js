import Address from "../models/Address.js";

export const getAddresses = async (req, res) => {
  const addresses = await Address.findAll({
    where: { userId: req.user.userId },
  });
  res.json(addresses);
};

export const addAddress = async (req, res) => {
  const address = await Address.create({
    ...req.body,
    userId: req.user.userId,
  });
  res.status(201).json(address);
};

export const updateAddress = async (req, res) => {
  const address = await Address.findOne({
    where: { addressId: req.params.addressId, userId: req.user.userId },
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
  const t = await sequelize.transaction(); // start transaction
  try {
    const { addressId } = req.params;
    const userId = req.user.userId;

    // Step 1: Find the address the user wants to set as default
    const address = await UserAddress.findOne({
      where: { addressId, userId },
      transaction: t,
      lock: t.LOCK.UPDATE, // lock the row for update
    });

    if (!address) {
      await t.rollback();
      return res.status(404).json({ message: "Address not found" });
    }

    // Step 2: Reset all previous default addresses for this user
    await UserAddress.update(
      { isDefault: false },
      { where: { userId }, transaction: t }
    );

    // Step 3: Set this address as default
    address.isDefault = true;
    await address.save({ transaction: t });

    // Step 4: Commit transaction
    await t.commit();

    res.json(address);
  } catch (err) {
    await t.rollback();
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};
