import { loadStripe } from "@stripe/stripe-js/pure";
import { placeOrder } from "./apiService";
export async function initStripe() {
  const stripe = await loadStripe(
    'pk_test_51KMYM9SAkrOqEqGY6GHQaGSCaLuN5OcVn1pugVsYYCwfL8N1oZAvglGMPOeH35Bkav7591IORm03kRyHHKrWVL3V00GII06ld6'
  );

  let card = null;
  function mountWidget() {
    const elements = stripe.elements();
    let style = {
      base: {
        color: "#32325d",
      },
      invalid: {
        color: "#fa755a",
        iconColor: "blue",
      },
    };
    card = elements.create("card", { style, hidePostalCode: true });
    card.mount("#card-element");
  }
  const paymentType = document.querySelector("#paymentType");
  if (!paymentType) {
    return;
  }
  paymentType.addEventListener("change", (e) => {
    if (e.target.value === "card") {
      mountWidget();
    } else {
      card.destroy();
    }
  });

  //ajax call(New)
  const paymentForm = document.querySelector("#payment-form");
  if (paymentForm) {
    paymentForm.addEventListener("submit", (e) => {
      e.preventDefault();
      let formData = new FormData(paymentForm);
      let formObject = {};
      for (let [key, value] of formData.entries()) {
        formObject[key] = value;
      }

      if (!card) {
        placeOrder(formObject);

        return;
      }

      //verify card
      stripe
        .createToken(card)
        .then((result) => {
          // console.log(result)
          formObject.stripeToken = result.token.id;
          placeOrder(formObject);
          // console.log(formObject)
        })
        .catch((err) => {
          console.log(err);
        });
    });
  }
}
