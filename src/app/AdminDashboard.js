"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  FaUtensils,
  FaUserShield,
  FaPlus,
  FaList,
  FaShoppingCart,
  FaSave,
  FaEdit,
  FaTrash,
  FaTimes,
  FaPlusCircle,
  FaCheck,
  FaSignOutAlt,
} from "react-icons/fa";
import { db } from "../../lib/firebase";
import ImageUploader from "./ImageUploader";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";

export default function AdminDashboard() {
  const router = useRouter();
  const [menuItems, setMenuItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [nextItemId, setNextItemId] = useState(1);
  const [nextOrderId, setNextOrderId] = useState(1);
  const [activeTab, setActiveTab] = useState("add-item");
  const [notification, setNotification] = useState({
    message: "",
    type: "",
    visible: false,
  });
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [formData, setFormData] = useState({
    itemName: "",
    price: "",
    category: "",
    photoUrl: "",
    description: "",
  });

  const [editFormData, setEditFormData] = useState({
    id: null,
    itemName: "",
    price: "",
    category: "",
    photoUrl: "",
    description: "",
  });
  const [shopDocId, setShopDocId] = useState(null);
  const [isShopOpen, setIsShopOpen] = useState(false);

  const formatDate = (ts) => {
    if (!ts) return "";
    if (ts?.toDate) return ts.toDate().toLocaleString();
    try {
      return new Date(ts).toLocaleString();
    } catch {
      return String(ts);
    }
  };
  useEffect(() => {
    const itemsQuery = query(collection(db, "menuItems"), orderBy("itemName"));
    const unsubscribe = onSnapshot(itemsQuery, (snapshot) => {
      const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      console.debug("[AdminDashboard] menuItems snapshot:", items);
      setMenuItems(items);
    });

    const ordersQuery = query(
      collection(db, "orders"),
      orderBy("createdAt", "desc")
    );
    const unsubscribeOrders = onSnapshot(ordersQuery, (snapshot) => {
      const list = snapshot.docs.map((d) => {
        const data = d.data() || {};
        const rawItems = Array.isArray(data.items) ? data.items : [];
        const normalizedItems = rawItems.map((it) => ({
          ...it,
          itemName: it?.itemName || it?.name || it?.item || "",
          price: it?.price != null ? it.price : it?.rate ?? 0,
          quantity: it?.quantity != null ? it.quantity : it?.qty ?? 0,
        }));
        return { id: d.id, ...data, items: normalizedItems };
      });
      console.debug("[AdminDashboard] orders snapshot (normalized):", list);
      setOrders(list);
    });

    // Fetch shop status (first doc in collection)
    const unsub = onSnapshot(collection(db, "shop"), (snapshot) => {
      if (!snapshot.empty) {
        const docData = snapshot.docs[0].data();
        setShopDocId(snapshot.docs[0].id);
        setIsShopOpen(!!docData.IsOpen);
      }
    });

    return () => {
      unsubscribe();
      unsubscribeOrders();
      unsub();
    };
  }, []);
  useEffect(() => {
    localStorage.setItem("nextOrderId", nextOrderId.toString());
  }, [nextOrderId]);

  const showNotification = (message, type = "success") => {
    setNotification({ message, type, visible: true });
    setTimeout(
      () => setNotification({ message: "", type, visible: false }),
      3000
    );
  };
  const handleAddItem = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        itemName: formData.itemName,
        price: parseFloat(formData.price || 0),
        category: formData.category,
        photoUrl: formData.photoUrl,
        description: formData.description,
      };
      await addDoc(collection(db, "menuItems"), payload);
      setFormData({
        itemName: "",
        price: "",
        category: "",
        photoUrl: "",
        description: "",
      });
      showNotification("Menu item added successfully!");
    } catch (error) {
      console.error("[AdminDashboard] Failed to add item:", error);
      showNotification("Failed to add item", "error");
    }
  };
  const openEditModal = (item) => {
    setEditItem(item);
    setEditFormData({
      id: item.id,
      itemName: item.itemName || "",
      price: item.price ?? "",
      category: item.category || "",
      photoUrl: item.photoUrl || "",
      description: item.description || "",
    });
    setEditModalOpen(true);
  };

  const handleEditItem = async (e) => {
    e.preventDefault();
    try {
      const ref = doc(db, "menuItems", editFormData.id);
      await updateDoc(ref, {
        itemName: editFormData.itemName,
        price: parseFloat(editFormData.price || 0),
        category: editFormData.category,
        photoUrl: editFormData.photoUrl,
        description: editFormData.description,
      });
      setEditModalOpen(false);
      showNotification("Item updated successfully!");
    } catch (error) {
      console.error("[AdminDashboard] Failed to update item:", error);
      showNotification("Failed to update item", "error");
    }
  };

  const handleDeleteItem = async (id) => {
    if (confirm("Are you sure you want to delete this item?")) {
      try {
        await deleteDoc(doc(db, "menuItems", id));
        showNotification("Item deleted successfully!");
      } catch (error) {
        console.error("[AdminDashboard] Failed to delete item:", error);
        showNotification("Failed to delete item", "error");
      }
    }
  };

  const acceptOrder = async (id) => {
    try {
      await updateDoc(doc(db, "orders", id), { status: "accepted" });
      showNotification("Order accepted successfully!");
    } catch (e) {
      console.error("[AdminDashboard] Failed to accept order:", e);
      showNotification("Failed to accept order", "error");
    }
  };

  const rejectOrder = async (id) => {
    if (confirm("Are you sure you want to reject this order?")) {
      try {
        await updateDoc(doc(db, "orders", id), { status: "rejected" });
        showNotification("Order rejected successfully!");
      } catch (e) {
        console.error("[AdminDashboard] Failed to reject order:", e);
        showNotification("Failed to reject order", "error");
      }
    }
  };

  return (
    <div className="min-h-screen h-screen w-full bg-gradient-to-br from-black to-gray-900 text-white overflow-auto">
      {/* Notification */}
      {notification.visible && (
        <div
          className={`fixed top-5 right-5 z-50 p-4 rounded-md font-semibold transition-transform ${
            notification.type === "success" ? "bg-green-600" : "bg-red-600"
          }`}
        >
          {notification.message}
        </div>
      )}
      <header className="bg-gradient-to-br from-yellow-400 to-yellow-300 text-black p-4 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <FaUtensils className="text-2xl" />
            <h1 className="text-2xl font-bold">Super Briyani Admin</h1>
          </div>
          <div className="flex items-center space-x-4">
            <FaUserShield className="text-xl" />
            <span className="font-semibold">Administrator</span>
            <button
              onClick={() => router.push("/")}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center"
            >
              <FaSignOutAlt className="mr-2" />
              Logout
            </button>
          </div>
        </div>
        {/* Shop Open Toggle */}
        <div className="flex items-center justify-end mt-4">
          <span className="mr-3 font-semibold text-lg">
            Shop Status:
            <span
              className={
                isShopOpen ? "text-green-700 ml-2" : "text-red-700 ml-2"
              }
            >
              {isShopOpen ? "Open" : "Closed"}
            </span>
          </span>
          <label className="flex items-center cursor-pointer">
            <div className="relative">
              <input
                type="checkbox"
                checked={isShopOpen}
                onChange={async (e) => {
                  if (!shopDocId) return;
                  const newStatus = e.target.checked;
                  setIsShopOpen(newStatus);
                  await updateDoc(doc(db, "shop", shopDocId), {
                    IsOpen: newStatus,
                  });
                  showNotification(
                    `Shop is now ${newStatus ? "Open" : "Closed"}`
                  );
                }}
                className="sr-only"
              />
              <div
                className={`block w-14 h-8 rounded-full ${
                  isShopOpen ? "bg-green-400" : "bg-red-400"
                }`}
              ></div>
              <div
                className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition ${
                  isShopOpen ? "translate-x-6" : ""
                }`}
              ></div>
            </div>
            <span className="ml-3 text-black font-bold">
              {isShopOpen ? "Open" : "Closed"}
            </span>
          </label>
        </div>
      </header>
      <nav className="bg-gray-900 border-b border-yellow-500">
        <div className="container mx-auto px-4">
          <div className="flex space-x-1">
            <button
              className={`px-6 py-3 font-semibold transition-all duration-200 flex items-center ${
                activeTab === "add-item"
                  ? "bg-gradient-to-br from-yellow-400 to-yellow-300 text-black"
                  : "text-yellow-400 hover:bg-yellow-400 hover:text-black"
              }`}
              onClick={() => setActiveTab("add-item")}
            >
              <FaPlus className="mr-2" />
              Add Item
            </button>
            <button
              className={`px-6 py-3 font-semibold transition-all duration-200 flex items-center ${
                activeTab === "view-items"
                  ? "bg-gradient-to-br from-yellow-400 to-yellow-300 text-black"
                  : "text-yellow-400 hover:bg-yellow-400 hover:text-black"
              }`}
              onClick={() => setActiveTab("view-items")}
            >
              <FaList className="mr-2" />
              View Items
            </button>
            <button
              className={`px-6 py-3 font-semibold transition-all duration-200 flex items-center ${
                activeTab === "orders"
                  ? "bg-gradient-to-br from-yellow-400 to-yellow-300 text-black"
                  : "text-yellow-400 hover:bg-yellow-400 hover:text-black"
              }`}
              onClick={() => setActiveTab("orders")}
            >
              <FaShoppingCart className="mr-2" />
              Orders
            </button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {activeTab === "add-item" && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-gray-900 rounded-lg p-8 border border-yellow-500 shadow-lg">
              <h2 className="text-2xl font-bold text-yellow-400 mb-6 text-center flex items-center justify-center">
                <FaPlusCircle className="mr-2" />
                Add New Menu Item
              </h2>
              <form className="space-y-6" onSubmit={handleAddItem}>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-yellow-400 font-semibold mb-2">
                      Item Name
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none"
                      value={formData.itemName}
                      onChange={(e) =>
                        setFormData({ ...formData, itemName: e.target.value })
                      }
                      placeholder="Enter item name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-yellow-400 font-semibold mb-2">
                      Price (₹)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({ ...formData, price: e.target.value })
                      }
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-yellow-400 font-semibold mb-2">
                    Category
                  </label>
                  <select
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none"
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    required
                  >
                    <option value="">Select Category</option>
                    <option value="Biryani">Biryani</option>
                    <option value="Appetizer">Appetizer</option>
                    <option value="Main Course">Main Course</option>
                    <option value="Dessert">Dessert</option>
                    <option value="Beverage">Beverage</option>
                    <option value="Special">Special</option>
                  </select>
                </div>
                <div>
                  <label className="block text-yellow-400 font-semibold mb-2">
                    Photo URL
                  </label>
                  <input
                    type="url"
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none"
                    value={formData.photoUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, photoUrl: e.target.value })
                    }
                    placeholder="https://example.com/image.jpg"
                  />
                  <div className="mt-3">
                    <ImageUploader
                      buttonLabel="Upload Image to Cloudinary"
                      onUploadComplete={(url) => setFormData({ ...formData, photoUrl: url })}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-yellow-400 font-semibold mb-2">
                    Description
                  </label>
                  <textarea
                    rows="3"
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Enter item description"
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="w-full bg-gradient-to-br from-yellow-400 to-yellow-300 text-black py-3 rounded-lg font-bold flex items-center justify-center transition-all duration-200 hover:shadow-lg"
                >
                  <FaSave className="mr-2" />
                  Add Item
                </button>
              </form>
            </div>
          </div>
        )}
        {activeTab === "view-items" && (
          <div className="bg-gray-900 rounded-lg border border-yellow-500 shadow-lg overflow-x-auto">
            <table className="w-full text-white">
              <thead className="bg-yellow-400 text-black">
                <tr>
                  <th className="px-6 py-4 text-left font-bold">Image</th>
                  <th className="px-6 py-4 text-left font-bold">Name</th>
                  <th className="px-6 py-4 text-left font-bold">Category</th>
                  <th className="px-6 py-4 text-left font-bold">Price</th>
                  <th className="px-6 py-4 text-left font-bold">Description</th>
                  <th className="px-6 py-4 text-center font-bold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {menuItems.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-8 text-gray-400">
                      <FaUtensils className="text-4xl mb-2 mx-auto" />
                      <p>No menu items found. Add some items to get started!</p>
                    </td>
                  </tr>
                ) : (
                  menuItems.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b border-gray-700 hover:bg-gray-800"
                    >
                      <td className="px-6 py-4">
                        {item.photoUrl ? (
                          <img
                            src={item.photoUrl}
                            alt={item.itemName}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gray-700 rounded-lg flex items-center justify-center">
                            <FaUtensils className="text-gray-500" />
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 font-semibold">
                        {item.itemName}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 rounded-full text-sm font-semibold bg-yellow-400 text-black">
                          {item.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold text-yellow-400">
                        ₹{Number(item.price || 0).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-gray-300 max-w-xs truncate">
                        {item.description || "No description"}
                      </td>
                      <td className="px-6 py-4 text-center space-x-2">
                        <button
                          onClick={() => openEditModal(item)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg transition-colors"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg transition-colors"
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
        {activeTab === "orders" && (
          <div className="space-y-4">
            {orders.filter((o) => (o.status || "pending") === "pending")
              .length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <FaShoppingCart className="text-4xl mb-2 mx-auto" />
                <p>
                  No orders found. Orders will appear here when customers place
                  them.
                </p>
              </div>
            ) : (
              orders
                .filter((o) => (o.status || "pending") === "pending")
                .map((order) => (
                  <div
                    key={order.id}
                    className="bg-gray-800 p-6 rounded-lg border border-gray-700 hover:border-yellow-500 transition-colors"
                  >
                    <div className="flex justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-yellow-400">
                          {order.orderID || `Order #${order.id}`}
                        </h3>
                        <p className="text-gray-400 text-sm">
                          {formatDate(order.createdAt)}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => acceptOrder(order.id)}
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold"
                        >
                          <FaCheck className="mr-2" /> Accept
                        </button>
                        <button
                          onClick={() => rejectOrder(order.id)}
                          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center"
                        >
                          <FaTimes className="mr-2" /> Reject
                        </button>
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-yellow-400 mb-2">
                          Customer Information
                        </h4>
                        <p className="text-white">
                          <strong>Name:</strong> {order.name}
                        </p>
                        <p className="text-gray-300 mt-2">
                          <strong>Address:</strong> {order.address}
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-yellow-400 mb-2">
                          Order Items
                        </h4>
                        <div className="space-y-2">
                          {order.items?.map((i, idx) => {
                            const itemPrice = Number(i.price || 0);
                            const qty = Number(i.quantity || 0);
                            const itemTotal = itemPrice * qty;
                            return (
                              <div
                                key={idx}
                                className="flex justify-between items-center bg-gray-700 p-3 rounded"
                              >
                                <div className="flex-1">
                                  <span className="text-white font-semibold">
                                    {i.itemName || i.name || "Unnamed item"}
                                  </span>
                                  <div className="text-sm text-gray-300">
                                    <span>
                                      ₹{itemPrice.toFixed(2)} × {qty}
                                    </span>
                                  </div>
                                </div>
                                <span className="text-yellow-400 font-bold">
                                  ₹{itemTotal.toFixed(2)}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                        <div className="mt-4 pt-3 border-t border-gray-600">
                          <div className="flex justify-between items-center">
                            <span className="text-white font-semibold text-lg">
                              Total:
                            </span>
                            <span className="text-yellow-400 font-bold text-xl">
                              ₹
                              {order.total != null
                                ? Number(order.total).toFixed(2)
                                : (order.items || [])
                                    .reduce(
                                      (total, it) =>
                                        total +
                                        Number(it.price || 0) *
                                          Number(it.quantity || 0),
                                      0
                                    )
                                    .toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
            )}
          </div>
        )}
      </div>
      {editModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center"
          onClick={(e) =>
            e.target === e.currentTarget && setEditModalOpen(false)
          }
        >
          <div className="bg-gray-900 rounded-lg p-8 max-w-2xl w-full mx-4 border border-yellow-500">
            <h3 className="text-xl font-bold text-yellow-400 mb-6">
              Edit Menu Item
            </h3>
            <form onSubmit={handleEditItem} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-yellow-400 font-semibold mb-2">
                    Item Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none"
                    value={editFormData.itemName}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        itemName: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div>
                  <label className="block text-yellow-400 font-semibold mb-2">
                    Price (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none"
                    value={editFormData.price}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        price: e.target.value,
                      })
                    }
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-yellow-400 font-semibold mb-2">
                  Category
                </label>
                <select
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none"
                  value={editFormData.category}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      category: e.target.value,
                    })
                  }
                  required
                >
                  <option value="Biryani">Biryani</option>
                  <option value="Appetizer">Appetizer</option>
                  <option value="Main Course">Main Course</option>
                  <option value="Dessert">Dessert</option>
                  <option value="Beverage">Beverage</option>
                  <option value="Special">Special</option>
                </select>
              </div>
              <div>
                <label className="block text-yellow-400 font-semibold mb-2">
                  Photo URL
                </label>
                <input
                  type="url"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none"
                  value={editFormData.photoUrl}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      photoUrl: e.target.value,
                    })
                  }
                />
                <div className="mt-3">
                  <ImageUploader
                    buttonLabel="Upload New Image"
                    onUploadComplete={(url) =>
                      setEditFormData({ ...editFormData, photoUrl: url })
                    }
                  />
                </div>
              </div>
              <div>
                <label className="block text-yellow-400 font-semibold mb-2">
                  Description
                </label>
                <textarea
                  rows="3"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none"
                  value={editFormData.description}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      description: e.target.value,
                    })
                  }
                ></textarea>
              </div>
              <div className="flex space-x-4 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-br from-yellow-400 to-yellow-300 text-black py-3 rounded-lg font-bold transition-all duration-200 flex justify-center items-center"
                >
                  <FaSave className="mr-2" /> Update Item
                </button>
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-bold transition-all duration-200 flex justify-center items-center"
                >
                  <FaTimes className="mr-2" /> Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
