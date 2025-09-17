export default function Receipt({ order }) {
  if (!order || Object.keys(order).length === 0) {
    return (
      <div
        id="print-area"
        className="print-area"
        style={{ fontWeight: "bold" }}
      >
        <h2>No order data provided</h2>
        <pre>{JSON.stringify(order, null, 2)}</pre>
      </div>
    );
  }

  // Format date
  let orderDate = "";
  try {
    orderDate = order.createdAt?.toDate
      ? order.createdAt.toDate().toLocaleString()
      : new Date(order.createdAt).toLocaleString();
  } catch {
    orderDate = new Date().toLocaleString();
  }

  // Calculate totals
  let subtotal = 0,
    totalDiscount = 0,
    finalTotal = 0;
  const discountPercent = Number(order.appliedDiscountPercent || 0);
  const items = order.items || [];
  items.forEach((item) => {
    const qty = Number(item.quantity || 0);
    const origPrice =
      item.unitPrice != null ? Number(item.unitPrice) : Number(item.price || 0);
    const discPrice =
      item.unitDiscountedPrice != null
        ? Number(item.unitDiscountedPrice)
        : origPrice * (1 - discountPercent / 100);
    subtotal += origPrice * qty;
    finalTotal += discPrice * qty;
    totalDiscount += (origPrice - discPrice) * qty;
  });

  return (
    <div
      id="print-area"
      className="print-area"
      style={{
        fontFamily: "monospace",
        width: "100%",
        padding: "8px 0",
        fontWeight: "bold", // overall bold
        color: "#000", // ensure dark print text
      }}
    >
      {/* Header / Logo */}
      <div style={{ textAlign: "center", marginBottom: 8 }}>
        <div style={{ marginTop: 8 }}>
          <img
            src="/AsifBiryani.jpg"
            alt="Logo"
            style={{
              width: 80, // bigger logo
              height: 80,
              borderRadius: "50%",
              margin: "0 auto 6px auto",
              display: "block",
            }}
          />
        </div>
        <div
          style={{
            fontSize: 14,
            color: "#000", // dark
            marginBottom: 4,
            fontWeight: "bold",
          }}
        >
          Order Receipt
        </div>
      </div>

      {/* Order details */}
      <div style={{ fontSize: 13, marginBottom: 6 }}>
        <div>Order ID: {order.orderID || order.id}</div>
        <div>Date: {orderDate}</div>
        <div>Customer: {order.billingName || order.name}</div>
        <div>Mobile: {order.billingMobile || "—"}</div>
        <div>Address: {order.address}</div>
      </div>

      <hr style={{ border: "1px dashed #000", margin: "8px 0" }} />

      {/* Items Table */}
      <div style={{ fontSize: 13, marginBottom: 6 }}>
        <div style={{ marginBottom: 2 }}>Items</div>
        <table
          style={{ width: "100%", fontSize: 13, borderCollapse: "collapse" }}
        >
          <thead>
            <tr style={{ borderBottom: "1px solid #000" }}>
              <th style={{ textAlign: "left" }}>Item</th>
              <th>Qty</th>
              <th>Orig</th>
              <th>Discount</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {items.length > 0 ? (
              items.map((item, idx) => {
                const qty = Number(item.quantity || 0);
                const origPrice =
                  item.unitPrice != null
                    ? Number(item.unitPrice)
                    : Number(item.price || 0);
                const discPrice =
                  item.unitDiscountedPrice != null
                    ? Number(item.unitDiscountedPrice)
                    : origPrice * (1 - discountPercent / 100);
                const itemDiscount = (origPrice - discPrice) * qty;
                const itemTotal = origPrice * qty - itemDiscount;
                return (
                  <tr key={idx} style={{ borderBottom: "1px dotted #000" }}>
                    <td>{item.itemName || item.name}</td>
                    <td style={{ textAlign: "center" }}>{qty}</td>
                    <td style={{ textAlign: "right" }}>
                      ₹{origPrice.toFixed(2)}
                    </td>
                    <td
                      style={{
                        textAlign: "right",
                        color: "#000", // black instead of green
                        fontWeight: "bold", // bold for emphasis
                      }}
                    >
                      ₹{itemDiscount.toFixed(2)}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      ₹{itemTotal.toFixed(2)}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={5} style={{ textAlign: "center", color: "#aaa" }}>
                  No items found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <hr style={{ border: "1px dashed #000", margin: "8px 0" }} />

      {/* Totals */}
      <div style={{ fontSize: 14, marginBottom: 4 }}>
        <div>
          Subtotal:{" "}
          <span style={{ float: "right" }}>₹{subtotal.toFixed(2)}</span>
        </div>
        <div>
          Discount:{" "}
          <span style={{ float: "right", color: "#000", fontWeight: "bold" }}>
            -₹{totalDiscount.toFixed(2)}
          </span>
        </div>
        <div style={{ fontSize: 16, color: "#000" }}>
          Total:{" "}
          <span style={{ float: "right" }}>₹{finalTotal.toFixed(2)}</span>
        </div>
      </div>

      <hr style={{ border: "1px dashed #000", margin: "8px 0" }} />

      {/* Footer */}
      <div
        style={{
          textAlign: "center",
          fontSize: 14,
          marginTop: 8,
          color: "#000",
          fontWeight: "bold",
        }}
      >
        <p>Thank you for choosing Asif Bhai&apos;s Biryani!</p>
        <br />
        <span style={{ fontSize: 13, color: "#000" }}>
          We hope you enjoy your meal. Visit again!
        </span>
      </div>
    </div>
  );
}
