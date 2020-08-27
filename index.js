const app = require("express")();
var mercadopago = require("mercadopago");
var port = process.env.PORT || 9000;

mercadopago.configure({
  access_token:
    "TEST-5642876213767884-061008-27aa57358417722c30553630ff3fe76e-6430927",
});
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
// app.use(require("body-parser").text());
app.use(require("body-parser").json());

app.get("/", async (req, res) => {
  res.send("welcome");
});

app.post("/api/get_preference", async (req, res) => {
  var obj = req.body;
  // console.log(obj);

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

app.post("/api/make_payment", async (req, res) => {
  var obj = req.body;
  console.log(obj);

  // var mercadopago = require('mercadopago');
  // mercadopago.configurations.setAccessToken("ENV_ACCESS_TOKEN");

  try {
    var payment_data = {
      transaction_amount: obj.amount,
      token: obj.access_token,
      description: obj.description,
      installments: obj.installments,
      payment_method_id: obj.payment_method_id,
      payer: {
        email: obj.email
      }
    };

    mercadopago.payment.save(payment_data).then(function (data) {
      console.log("Resposne received")
      res.status(200);
      res.send(data);
    }).catch(function (error) {
      // let r = { status: 500 };
      // res.status(500);
      // res.send({
      //   data: error
      // });
      let r = { status: 200 };
      res.status(200);
      res.send({
        data: error
      });
    });
  } catch (err) {
    let r = { status: 500 };
    res.status(500);
    res.send({
      data: err
    });
  }
});

app.listen(port, () => console.log("Listening " + port));
