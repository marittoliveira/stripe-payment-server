/*const app = require("express")();
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

    var payment_methods = {
      excluded_payment_types: [{ id: "ticket" }, { id: "atm" }],
    };

    preference.items = [item];
    preference.payer = payer;
    preference.payment_methods = payment_methods;

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
});*/
const app = require("express")();
var mercadopago = require("mercadopago");

var port = process.env.PORT || 9000;

mercadopago.configure({
  access_token:
    "TEST-5642876213767884-061008-27aa57358417722c30553630ff3fe76e-6430927",
});
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});
app.use(require("body-parser").json());

app.get("/", async (req, res) => {
  res.send("welcome");
});

app.post('/api/sub', async (req, res) => {
  const {email, payment_method, price} = req.body;

  const customer = await stripe.customers.create({
    payment_method: payment_method,
    email: email,
    invoice_settings: {
      default_payment_method: payment_method,
    },
  });

  const subscription = await stripe.subscriptions.create({
    customer: customer.id,
    
    items: [{ price }],
    expand: ['latest_invoice.payment_intent']
  });
  
  const status = subscription['latest_invoice']['payment_intent']['status'] 
  const client_secret = subscription['latest_invoice']['payment_intent']['client_secret']

  res.json({'client_secret': client_secret, 'status': status});
})

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


app.post("/api/process_payment", (req, res) => {
  var payment_data = {
    transaction_amount: parseInt(req.body.transactionAmount),
    token: req.body.token,
    description: req.body.description,
    installments: parseInt(req.body.installments),
    payment_method_id: req.body.paymentMethodId,
    issuer_id: undefined,
    payer: {
      email: req.body.email
    }
  };
  try{
  mercadopago.payment.save(payment_data).then(function(response) {
      res.status(response.status).json({
        status: response.body.status,
        status_detail: response.body.status_detail,
        id: response.body.id
      });
    }).catch((error) => {
      console.log("error Found : ",error)
    });
  }catch(err){
    console.log(err)
    res.status(400).json(err)
  }
});

app.listen(port, () => console.log("Listening " + port));

app.listen(port, () => console.log("Listening " + port));
