/* global paypal, orderData */
paypal.Buttons({
  fundingSource: paypal.FUNDING.CREDIT,
  createOrder: function (data, actions) {
    return actions.order.create(orderData)
  },
  onApprove: function (data, actions) {
    return actions.order.capture()
      .then(function (details) {
      })
  }
}).render('#paypal-playpen')
