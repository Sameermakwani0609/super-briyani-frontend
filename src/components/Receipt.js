export default function Receipt({ order }) {
  if (!order || Object.keys(order).length === 0) {
    return (
      <div id="print-area" className="print-area">
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

  // Calculate totals and show original/discounted prices
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
      style={{ fontFamily: "monospace", width: "100%", padding: "8px 0" }}
    >
      <div style={{ textAlign: "center", marginBottom: 8 }}>
        <div style={{ marginTop: 8 }}>
          <img
            src="/biryanii.jpg"
            alt="Logo"
            style={{
              width: 48,
              height: 48,
              borderRadius: "50%",
              margin: "0 auto 6px auto",
              display: "block",
            }}
          />
        </div>
        <h2
          style={{
            fontWeight: "bold",
            fontSize: 18,
            margin: 0,
            color: "#d97706",
          }}
        >
          Super Briyani
        </h2>
        <div style={{ fontSize: 12, color: "#555", marginBottom: 2 }}>
          Order Receipt
        </div>
      </div>
      <div style={{ fontSize: 12, marginBottom: 4 }}>
        <div>
          Order ID: <b>{order.orderID || order.id}</b>
        </div>
        <div>
          Date: <b>{orderDate}</b>
        </div>
        <div>
          Customer: <b>{order.billingName || order.name}</b>
        </div>
        <div>
          Mobile: <b>{order.billingMobile || "—"}</b>
        </div>
        <div>
          Address: <b>{order.address}</b>
        </div>
      </div>
      <hr
        style={{
          border: "none",
          borderTop: "1px dashed #bbb",
          margin: "8px 0",
        }}
      />
      <div style={{ fontSize: 12, marginBottom: 4 }}>
        <div style={{ fontWeight: "bold", marginBottom: 2 }}>Items</div>
        <table
          style={{ width: "100%", fontSize: 12, borderCollapse: "collapse" }}
        >
          <thead>
            <tr style={{ borderBottom: "1px solid #eee" }}>
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
                  <tr key={idx} style={{ borderBottom: "1px dotted #eee" }}>
                    <td>{item.itemName || item.name}</td>
                    <td style={{ textAlign: "center" }}>{qty}</td>
                    <td style={{ textAlign: "right" }}>
                      ₹{origPrice.toFixed(2)}
                    </td>
                    <td style={{ textAlign: "right", color: "#059669" }}>
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
      <hr
        style={{
          border: "none",
          borderTop: "1px dashed #bbb",
          margin: "8px 0",
        }}
      />
      <div style={{ fontSize: 13, marginBottom: 2 }}>
        <div>
          Subtotal:{" "}
          <span style={{ float: "right" }}>₹{subtotal.toFixed(2)}</span>
        </div>
        <div>
          Discount:{" "}
          <span style={{ float: "right", color: "#059669" }}>
            -₹{totalDiscount.toFixed(2)}
          </span>
        </div>
        <div style={{ fontWeight: "bold", fontSize: 15, color: "#d97706" }}>
          Total:{" "}
          <span style={{ float: "right" }}>₹{finalTotal.toFixed(2)}</span>
        </div>
      </div>
      <hr
        style={{
          border: "none",
          borderTop: "1px dashed #bbb",
          margin: "8px 0",
        }}
      />
      <div
        style={{
          textAlign: "center",
          fontSize: 13,
          marginTop: 8,
          color: "#d97706",
          fontWeight: "bold",
        }}
      >
        Thank you for choosing Super Briyani!
        <br />
        <span style={{ fontSize: 12, color: "#555", fontWeight: "normal" }}>
          We hope you enjoy your meal. Visit again!
        </span>
      </div>
    </div>
  );
}
