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
  // console.log(req.body);
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
        // Do Stuff...
        // console.log(data.body);
        res.send(data.body.id);
      })
      .catch((error) => {
        // Do Stuff...
        console.log(error);
        res.json({ error });
      });
  } catch (err) {
    // console.log(err);
    res.json({ msg: "error" });
    res.status(500).end();
  }
});

app.listen(port, () => console.log("Listening " + port));
