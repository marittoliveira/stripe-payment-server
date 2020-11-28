const app = require('express')();
var mercadopago = require('mercadopago');
const stripe = require('stripe')(
  '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'
);
const cors = require('cors');
const bodyParser = require('body-parser');
var port = process.env.PORT || 9000;
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

mercadopago.configure({
  access_token:
    'TEST-1456055079143308-090812-0686399f726749634bc15b7a4b2e2388-233894286',
});
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  );
  next();
});

app.get('/', async (req, res) => {
  res.send('welcome');
});
app.post('/api/stripe/createAccount', async (req, res) => {
  const account = await stripe.accounts.create({
    type: 'standard',
    email: req.body.email,
  });
  // console.log(account.id);
  res.send(account.id);
});

app.post('/api/stripe/deleteAccount', async (req, res) => {
  console.log(req.body.account_id);
  const deleted = await stripe.accounts
    .del(req.body.account_id)
    .catch((err) => {
      console.log(err);
    });
  console.log(deleted);
  res.send('success');
});

app.post('/api/stripe/retrieveAccount', async (req, res) => {
  // console.log(req.body.account_id);
  if (req.body.account_id) {
    const account = await stripe.accounts.retrieve(req.body.account_id);
    // console.log(account);
    account.success = true;
    res.json(account);
  } else {
    res.json({ msg: 'account_id is undefined', success: false });
  }
});

app.post('/api/stripe/accountLinks', async (req, res) => {
  // console.log(req.body.account_id);
  const accountLinks = await stripe.accountLinks
    .create({
      account: req.body.account_id,
      refresh_url: 'https://doutorferidasconecta.app.br/',
      return_url: 'https://doutorferidasconecta.app.br/',
      type: 'account_onboarding',
    })
    .catch((err) => {
      // console.log(err);
      res.json(err);
    });
  // console.log(accountLinks);
  res.json(accountLinks);
});

app.post('/api/stripe/intentMobileApp', async (req, res) => {
  let clonedPaymentMethod = await stripe.paymentMethods
    .create(
      {
        payment_method: req.body.payment_method,
      },
      {
        stripeAccount: req.body.account_id,
      }
    )
    .catch((err) => {
      console.log(err);
    });
  console.log(clonedPaymentMethod);
  const paymentIntent = await stripe.paymentIntents
    .create(
      {
        payment_method_types: ['card'],
        amount: req.body.amount,
        // payment_method: req.body.payment_method,
        payment_method: clonedPaymentMethod.id,
        currency: 'brl',
        description: req.body.description,
        receipt_email: req.body.user_email,
        application_fee_amount: Math.floor(req.body.amount * 0.2),
        confirm: true,
      },
      {
        stripeAccount: req.body.account_id,
      }
    )
    .catch((err) => {
      console.log(err);
      res.json({
        err: err,
        success: false,
      });
    });

  // console.log(paymentIntent);
  if (paymentIntent.status == 'succeeded') {
    res.json({
      paymentIntent: paymentIntent.id,
      success: true,
    });
  } else {
    res.json({
      paymentIntent: paymentIntent.id,
      status: paymentIntent.status,
      success: false,
    });
  }
});

app.post('/api/stripe_intent', async (req, res) => {
  // console.log(typeof req.body.amount);
  const intent = await stripe.paymentIntents.create({
    amount: req.body.amount,
    currency: 'brl',
    payment_method_types: ['card'],
    payment_method: req.body.payment_method,
  });
  // console.log(intent.client_secret);
  res.send(intent.client_secret);
});

app.post('/api/get_preference', async (req, res) => {
  var obj = req.body;
  // console.log(obj);

  try {
    var preference = {};

    var item = {
      title: obj.title,
      quantity: 1,
      currency_id: 'BRL',
      unit_price: obj.service_value,
    };

    var payer = {
      email: obj.email,
      name: obj.name,
      date_created: new Date().toISOString(),
    };

    var payment_methods = {
      excluded_payment_types: [{ id: 'ticket' }, { id: 'atm' }],
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
});

app.post('/api/process_payment', (req, res) => {
  // console.log(req.body);
  var payment_data = {
    transaction_amount: parseInt(req.body.transactionAmount),
    token: req.body.token,
    description: req.body.description,
    installments: parseInt(req.body.installments),
    payment_method_id: req.body.paymentMethodId,
    issuer_id: undefined,
    payer: {
      email: req.body.email,
    },
  };
  try {
    mercadopago.payment
      .save(payment_data)
      .then(function (response) {
        res.status(response.status).json({
          status: response.body.status,
          status_detail: response.body.status_detail,
          id: response.body.id,
        });
      })
      .catch((error) => {
        console.log('error Found : ', error);
      });
  } catch (err) {
    console.log(err);
    res.status(400).json(err);
  }
});

app.post('/api/sub', async (req, res) => {
  const { email, payment_method, price } = req.body;

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
    expand: ['latest_invoice.payment_intent'],
  });

  const status = subscription['latest_invoice']['payment_intent']['status'];
  const client_secret =
    subscription['latest_invoice']['payment_intent']['client_secret'];

  res.json({
    client_secret: client_secret,
    status: status,
    subscriptionID: subscription.id,
  });
});
app.delete('/api/sub', async (req, res) => {
  const { subscriptionID } = req.body;
  if (!subscriptionID) {
    return res.status(500).json({ message: 'Subscription Was Not Passed!' });
  }
  const deleted = await stripe.subscriptions.del(subscriptionID);
  return res.status(200).json({ message: 'Subscription cancelled' });
});

app.listen(port, () => console.log('Listening ' + port));
