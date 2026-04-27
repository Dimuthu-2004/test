const crypto = require('crypto');
const fs = require('fs/promises');
const path = require('path');
const mongoose = require('mongoose');
const Item = require('../models/item');

const dataFilePath = path.join(__dirname, '..', 'data', 'items.json');

function isMongoConnected() {
  return mongoose.connection.readyState === 1;
}

function validateItemPayload(payload, { partial = false } = {}) {
  const sanitized = {};

  if (!partial || Object.prototype.hasOwnProperty.call(payload, 'name')) {
    if (typeof payload.name !== 'string' || payload.name.trim() === '') {
      throw new Error('Name is required');
    }
    sanitized.name = payload.name.trim();
  }

  if (!partial || Object.prototype.hasOwnProperty.call(payload, 'description')) {
    if (typeof payload.description !== 'string' || payload.description.trim() === '') {
      throw new Error('Description is required');
    }
    sanitized.description = payload.description.trim();
  }

  if (!partial || Object.prototype.hasOwnProperty.call(payload, 'price')) {
    const price = Number(payload.price);
    if (!Number.isFinite(price) || price < 0) {
      throw new Error('Price must be a valid non-negative number');
    }
    sanitized.price = price;
  }

  return sanitized;
}

async function ensureDataFile() {
  await fs.mkdir(path.dirname(dataFilePath), { recursive: true });

  try {
    await fs.access(dataFilePath);
  } catch (error) {
    await fs.writeFile(dataFilePath, '[]', 'utf8');
  }
}

async function readLocalItems() {
  await ensureDataFile();
  const raw = await fs.readFile(dataFilePath, 'utf8');
  return JSON.parse(raw);
}

async function writeLocalItems(items) {
  await ensureDataFile();
  await fs.writeFile(dataFilePath, JSON.stringify(items, null, 2), 'utf8');
}

async function getAllItems() {
  if (isMongoConnected()) {
    return Item.find().sort({ createdAt: -1 });
  }

  return readLocalItems();
}

async function createItem(payload) {
  const sanitized = validateItemPayload(payload);

  if (isMongoConnected()) {
    const item = new Item(sanitized);
    return item.save();
  }

  const items = await readLocalItems();
  const now = new Date().toISOString();
  const newItem = {
    _id: crypto.randomUUID(),
    ...sanitized,
    createdAt: now,
    updatedAt: now,
  };

  items.unshift(newItem);
  await writeLocalItems(items);

  return newItem;
}

async function deleteItem(id) {
  if (isMongoConnected()) {
    return Item.findByIdAndDelete(id);
  }

  const items = await readLocalItems();
  const index = items.findIndex((item) => item._id === id);

  if (index === -1) {
    return null;
  }

  const [deletedItem] = items.splice(index, 1);
  await writeLocalItems(items);

  return deletedItem;
}

async function updateItem(id, payload) {
  const sanitized = validateItemPayload(payload, { partial: true });

  if (Object.keys(sanitized).length === 0) {
    throw new Error('Provide at least one field to update');
  }

  if (isMongoConnected()) {
    return Item.findByIdAndUpdate(id, sanitized, {
      new: true,
      runValidators: true,
    });
  }

  const items = await readLocalItems();
  const index = items.findIndex((item) => item._id === id);

  if (index === -1) {
    return null;
  }

  items[index] = {
    ...items[index],
    ...sanitized,
    updatedAt: new Date().toISOString(),
  };

  await writeLocalItems(items);
  return items[index];
}

module.exports = {
  getAllItems,
  createItem,
  deleteItem,
  updateItem,
  isMongoConnected,
};
