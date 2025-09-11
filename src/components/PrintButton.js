export default function PrintButton(props) {
  const { order, printAreaId = "print-area" } = props;
  const handlePrint = () => {
    const sourceArea = document.getElementById(printAreaId);
    if (!sourceArea) {
      window.print();
      return;
    }
    // Hide the original print area
    sourceArea.style.display = "none";
    // Create a hidden print area at the root with a unique id
    const printArea = document.createElement("div");
    printArea.style.position = "fixed";
    printArea.style.top = "0";
    printArea.style.left = "0";
    printArea.style.width = "58mm";
    printArea.style.background = "white";
    printArea.style.color = "black";
    printArea.style.zIndex = "9999";
    printArea.style.padding = "0";
    printArea.style.margin = "0";
    printArea.style.fontSize = "12px";
    printArea.style.visibility = "visible";
    printArea.innerHTML = sourceArea.innerHTML;
    document.body.appendChild(printArea);

    // Add print styles
    const style = document.createElement("style");
    style.innerHTML = `@media print { body * { visibility: hidden !important; } div#print-temp, div#print-temp * { visibility: visible !important; } div#print-temp { position: absolute; top: 0; left: 0; width: 58mm; font-size: 12px; background: white; color: black; padding: 0; margin: 0; } } @page { size: 58mm auto; margin: 0; }`;
    printArea.id = "print-temp";
    document.head.appendChild(style);

    window.print();

    // Clean up after printing
    setTimeout(() => {
      document.body.removeChild(printArea);
      document.head.removeChild(style);
      sourceArea.style.display = "";
    }, 1000);
  };

  return (
    <button
      onClick={handlePrint}
      className="bg-yellow-400 hover:bg-yellow-500 text-black px-4 py-2 rounded font-semibold mt-2"
    >
      Print Receipt
    </button>
  );
}
