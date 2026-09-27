const generateOrderNumber = (sequenceNumber) => {
    const date = new Date();

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    const number = String(sequenceNumber).padStart(6, "0");

    return `ORD-${year}${month}${day}-${number}`;
};

module.exports = generateOrderNumber;