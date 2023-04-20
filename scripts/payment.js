const quantityInput =  document.getElementById("quantity");
const priceParagraph = document.getElementById("price");

quantityInput.addEventListener("input",updatePrice);

function updatePrice(){
    const quantity = parseInt(quantityInput.value);
    const totalPrice = quantity * 8;
    priceParagraph.textContent = "Ticket Price: " + totalPrice + " Euro";
    document.querySelector('#makeBooking').parentElement.href = `ticket?screening=5&bought=${document.querySelector('#quantity').value}`
}