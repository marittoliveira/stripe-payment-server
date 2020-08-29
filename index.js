// const app = require("express")();
// var mercadopago = require("mercadopago");
// var port = process.env.PORT || 9000;

// mercadopago.configure({
//   access_token:
//     "TEST-1456055079143308-051916-8ad472fa5fd87ef418bdc7c48d9614f0-233894286",
// });

// // app.use(require("body-parser").text());
// app.use(require("body-parser").json());

// app.get("/", async (req, res) => {
//   res.send("welcome ml");
// });

// app.post("/api/get_preference", async (req, res) => {
//   var obj = req.body;

//   // console.log(obj);

//   try {
//     var preference = {};

//     var item = {
//       title: obj.title,
//       quantity: 1,
//       currency_id: "BRL",
//       unit_price: obj.service_value,
//     };

//     var payer = {
//       email: obj.email,
//       name: obj.name,
//       date_created: new Date().toISOString(),
//     };

//     var payments = {
//       payment_method_id: obj.method,
//       payment_type_id: obj.card,
//       token: response.id,
//       transaction_amount: obj.service_value,
//       installments: obj.plots,
//       processing_mode: "aggregator",
//     };

//     var disbursements = {
//       //Values ​​rates
//       amount: obj.service_rate,
//       external_reference: obj.market,
//       collector_id: id.place,
//       application_fee: 20,
//       money_release_days: 30,
//       //seller values
//       amount: obj.service_withfee,
//       external_reference: obj.seller,
//       collector_id: id.seller,
//       application_fee: 80,
//       money_release_days: 30,
//     };

//     var external_reference = {
//       id: obj.ref_transaction,
//     };

//     preference.items = [item];
//     preference.payer = payer;
//     preference.payments = payments;
//     preference.disbursements = disbursements;
//     preference.external_reference = external_reference;

//     mercadopago.preferences
//       .create(preference)
//       .then((data) => {
//         // console.log(data);
//         let r = { status: 200, id: data.body.id };
//         res.json(r);
//       })
//       .catch((error) => {
//         let r = { status: 500 };
//         res.json({ r });
//       });
//   } catch (err) {
//     let r = { status: 500 };
//     res.status(500).end();
//   }
// });

// app.listen(port, () => console.log("Listening " + port));

const app = require("express")();
var mercadopago = require("mercadopago");
var port = process.env.PORT || 9000;

mercadopago.configure({
  access_token:
    "TEST-1456055079143308-051916-8ad472fa5fd87ef418bdc7c48d9614f0-233894286",
});

// app.use(require("body-parser").text());
app.use(require("body-parser").json());

app.get("/", async (req, res) => {
  res.send("welcome");
});

app.post("/api/get_preference", async (req, res) => {
  var obj = req.body;
  console.log(obj);

  try {
    var preference = {};

    var item = {
      title: obj.title,
      quantity: 1,
      currency_id: "BRL",
      unit_price: obj.service_value,
    };

    var payer = {
      email: obj.email,
      name: obj.name,
      date_created: new Date().toISOString(),
    };

    preference.items = [item];
    preference.payer = payer;

    mercadopago.preferences
      .create(preference)
      .then((data) => {
        // console.log(data);
        let r = { status: 200, id: data.body.id };
        res.json(r);
      })
      .catch((error) => {
        let r = { status: 500 };
        res.json({ r });
      });
  } catch (err) {
    let r = { status: 500 };
    res.status(500).end();
  }
});

app.listen(port, () => console.log("Listening " + port));
