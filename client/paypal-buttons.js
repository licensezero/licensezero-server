/* eslint-env browser */
/* global orderID, paypal */
paypal.Buttons({
  fundingSource: paypal.FUNDING.CREDIT,
  createOrder: function (data, actions) {
    return fetch('/paypal-order?orderID=' + orderID, {
      method: 'post',
      headers: { 'content-type': 'application/json' }
    }).then(function (response) {
      return response.text()
    })
  },
  onApprove: function (data, actions) {
    return fetch('/paypal-capture', {
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        orderID: orderID,
        payPalOrderID: data.orderID
      })
    })
      .then(function (response) {
        response.json()
      })
      .then(function (data) {
        if (data.error) {
          alert(data)
        } else if (data.redirect) {
          window.location.href = data.redirect
        }
      })
  }
}).render('#paypal-playpen')
